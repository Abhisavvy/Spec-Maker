import requests
from typing import Dict, Any, List

class FigmaService:
    BASE_URL = "https://api.figma.com/v1"

    def __init__(self, token: str):
        self.token = token
        self.headers = {"X-Figma-Token": token}

    def get_file(self, file_key: str) -> Dict[str, Any]:
        """Fetch the entire Figma file."""
        url = f"{self.BASE_URL}/files/{file_key}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Figma API Error: {response.status_code} - {response.text}")
        return response.json()

    def get_images(self, file_key: str, node_ids: List[str]) -> Dict[str, str]:
        """Fetch image URLs for specific node IDs with parallel batching."""
        if not node_ids:
            return {}
        
        print(f"DEBUG: Starting image fetch for {len(node_ids)} nodes...")
        
        all_images = {}
        batch_size = 10 # Increase batch size for efficiency
        batches = [node_ids[i:i + batch_size] for i in range(0, len(node_ids), batch_size)]
        
        import concurrent.futures
        import time

        def fetch_batch_with_retry(batch_ids, depth=0):
            """Recursively try to fetch images, splitting batch on failure."""
            if not batch_ids:
                return {}
            
            url = f"{self.BASE_URL}/images/{file_key}"
            params = {"ids": ",".join(batch_ids), "format": "png", "scale": 2}
            
            try:
                response = requests.get(url, headers=self.headers, params=params)
                if response.status_code == 200:
                    images = response.json().get("images", {})
                    print(f"DEBUG: Fetched batch of {len(batch_ids)} (Depth {depth})")
                    return images
                else:
                    print(f"Error fetching batch of {len(batch_ids)}: {response.status_code}")
                    # If batch failed and we have more than 1 item, split and retry
                    if len(batch_ids) > 1:
                        mid = len(batch_ids) // 2
                        left = batch_ids[:mid]
                        right = batch_ids[mid:]
                        print(f"DEBUG: Splitting batch into {len(left)} and {len(right)} and retrying...")
                        
                        results = {}
                        results.update(fetch_batch_with_retry(left, depth+1))
                        # Small sleep between splits to be nice
                        time.sleep(0.5)
                        results.update(fetch_batch_with_retry(right, depth+1))
                        return results
                    else:
                        print(f"Failed to fetch single image {batch_ids[0]} after retries.")
                        return {}
            except Exception as e:
                print(f"Exception fetching batch: {str(e)}")
                if len(batch_ids) > 1:
                    mid = len(batch_ids) // 2
                    left = batch_ids[:mid]
                    right = batch_ids[mid:]
                    results = {}
                    results.update(fetch_batch_with_retry(left, depth+1))
                    time.sleep(0.5)
                    results.update(fetch_batch_with_retry(right, depth+1))
                    return results
                return {}

        # Use ThreadPoolExecutor for parallel fetching
        # Limit workers to avoid hitting rate limits too hard
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_batch = {executor.submit(fetch_batch_with_retry, batch): batch for i, batch in enumerate(batches)}
            for future in concurrent.futures.as_completed(future_to_batch):
                result = future.result()
                if result:
                    all_images.update(result)
                
        return all_images

    def extract_flows(self, file_key: str, file_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract prototype flows and frame hierarchy.
        Returns a dict with structured JSON data and image mapping.
        """
        document = file_data.get("document", {})
        pages = document.get("children", [])
        
        structured_data = {"pages": []}
        frame_ids = []
        frame_map = {} # ID -> Name
        
        for page in pages:
            page_data = {
                "name": page.get("name"),
                "id": page.get("id"),
                "frames": []
            }
            
            frames = [node for node in page.get("children", []) if node.get("type") == "FRAME"]
            
            for frame in frames:
                f_id = frame.get('id')
                f_name = frame.get('name')
                frame_ids.append(f_id)
                frame_map[f_id] = f_name
                
                frame_data = {
                    "id": f_id,
                    "name": f_name,
                    "text_content": self._extract_text_from_node(frame),
                    "transitions": []
                }
                
                if "transitionNodeID" in frame:
                     frame_data["transitions"].append(frame.get("transitionNodeID"))
                
                # Also check children for interactions/transitions if needed
                # (Simplified for now)
                
                page_data["frames"].append(frame_data)
            
            structured_data["pages"].append(page_data)

        # Fetch images for all frames
        images = self.get_images(file_key, frame_ids)
        
        # Generate Deep Links
        # Format: https://www.figma.com/design/{file_key}?node-id={node_id}
        links = {}
        for f_id in frame_ids:
            # Figma node IDs often have ':' which needs to be URL encoded to '-' or '%3A'
            # Usually for the URL param, it's safe to pass as is or use standard encoding
            # But Figma often uses '123:456' -> '123-456' in some contexts, but ?node-id=123:456 works.
            import urllib.parse
            encoded_id = urllib.parse.quote(f_id)
            links[f_id] = f"https://www.figma.com/design/{file_key}?node-id={encoded_id}"

        return {
            "json_data": structured_data, # Structured JSON
            "images": images, # Map of NodeID -> ImageURL
            "links": links, # Map of NodeID -> DeepLinkURL
            "frame_map": frame_map
        }

    def _extract_text_from_node(self, node: Dict[str, Any]) -> List[str]:
        """Recursively extract text characters from a node."""
        texts = []
        if node.get("type") == "TEXT":
            texts.append(node.get("characters", ""))
        
        if "children" in node:
            for child in node["children"]:
                texts.extend(self._extract_text_from_node(child))
        
        return texts

    @staticmethod
    def parse_file_key(url: str) -> str:
        """Extract file key from Figma URL."""
        # Example: https://www.figma.com/file/ByKey123/Name...
        try:
            if "figma.com/file/" in url:
                return url.split("figma.com/file/")[1].split("/")[0]
            elif "figma.com/design/" in url:
                 return url.split("figma.com/design/")[1].split("/")[0]
            return url # Assume it's the key if not a URL
        except:
            return url
