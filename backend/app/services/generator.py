import os
import google.generativeai as genai
from typing import List, Optional
from app.services.parser import DocumentParser
from app.services.analyzer import EdgeCaseAnalyzer
from app.services.figma import FigmaService

class GeneratorService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro-latest')
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY not found in environment variables.")

    def generate_gdd(self, prompt: str, figma_token: Optional[str], figma_url: Optional[str], 
                     gdds_dir: str, slides_dir: str, edge_cases_dir: str, context_uploads_dir: str = None) -> str:
        
        if not self.model:
            return "Error: GEMINI_API_KEY is not set. Please set it in the environment."

        # 1. Load Context
        print("Loading context...")
        gdd_examples = DocumentParser.load_documents_from_dir(gdds_dir)
        slides = DocumentParser.load_documents_from_dir(slides_dir)
        
        edge_cases_files = os.listdir(edge_cases_dir) if os.path.exists(edge_cases_dir) else []
        edge_cases_content = ""
        if edge_cases_files:
             # Just take the first one for now
             path = os.path.join(edge_cases_dir, edge_cases_files[0])
             if not path.startswith('.'):
                 edge_cases_content = DocumentParser.parse_file(path)

        # Load Custom Context Uploads
        custom_context = ""
        if context_uploads_dir and os.path.exists(context_uploads_dir):
            for filename in os.listdir(context_uploads_dir):
                if filename.endswith(".desc.txt") or filename.startswith("."):
                    continue
                
                file_path = os.path.join(context_uploads_dir, filename)
                desc_path = file_path + ".desc.txt"
                
                # Parse file content
                file_content = DocumentParser.parse_file(file_path)
                
                # Read description
                description = ""
                if os.path.exists(desc_path):
                    with open(desc_path, 'r') as f:
                        description = f.read()
                
                custom_context += f"\n--- EXTRA CONTEXT FILE: {filename} ---\n"
                custom_context += f"User Description: {description}\n"
                custom_context += f"File Content:\n{file_content}\n"

        # 2. Fetch Figma Data
        figma_content = ""
        figma_images = {}
        flow_data = {} # Initialize to avoid UnboundLocalError
        if figma_token and figma_url:
            print("Fetching Figma data...")
            try:
                figma_service = FigmaService(figma_token)
                file_key = FigmaService.parse_file_key(figma_url)
                file_data = figma_service.get_file(file_key)
                
                # Extract flows and images
                flow_data = figma_service.extract_flows(file_key, file_data)
                
                # Convert structured JSON to string for LLM
                import json
                figma_json = flow_data["json_data"]
                figma_content = json.dumps(figma_json, indent=2)
                
                figma_images = flow_data["images"]
                print(f"DEBUG: Successfully fetched {len(figma_images)} images from Figma.")
                
                # Append image availability to content for LLM awareness
                figma_content += "\n\nAVAILABLE MOCKUPS (Use these Frame IDs to reference images):\n"
                for f_id, url in figma_images.items():
                    figma_content += f"- Frame ID: {f_id} (Image Available)\n"
                    
            except Exception as e:
                figma_content = f"Error fetching Figma data: {str(e)}"
                print(figma_content)

        # 3. Construct Prompt
        print("Constructing prompt...")
        full_prompt = f"""
# ROLE & EXPERTISE
You are an expert game design specification writer. Your role is to create clear, well-structured game design documents that are immediately usable by development teams.

# FORMATTING RULES
- Use clean formatting.
- **CRITICAL**: Do NOT use markdown asterisks (**) for bolding. Use HTML `<b>` tags instead (e.g., `<b>Header</b>`).
- Use simple bullet points with hyphens (-) for lists.
- Keep headings simple with ## for main sections.
- Ensure all text is copy-paste ready.
- Use line breaks strategically for readability.

# WRITING STYLE
- Be specific and concrete, not vague or abstract.
- Use player-centric language.
- Avoid jargon unless necessary.
- Each point should be actionable and clear.
- Focus on "what" and "why" before "how".
- Anticipate questions developers and QA might have.
- **BE CONCISE**: Avoid fluff, filler words, and long-winded explanations.
- Keep descriptions short and to the point.

# USER REQUEST
{prompt}

# TECHNICAL CONSTRAINTS (CRITICAL FOR PPTX GENERATION)
While following the clean style above, you MUST adhere to the following structure so our tool can convert this to a presentation.

## Required Section Headers (Use ##)
1. <Add spec name here> (Title Slide)
2. Problem statements
3. Vision and anti-vision
4. Business and Design Goals
5. Opportunities
6. Expected Upsides
7. Overview
8. <Screen Name> UI (Repeat for each screen)
9. <Flow name> Flow (Repeat for each flow)
10. Edge Cases
11. UI dev requirement
12. Sound requirement
13. Experimentation Plan
14. Tracking requirement
15. Analysis Plan
16. Changelog

## Special Formatting for UI Slides (Section 8)
For these slides ONLY, use a simple Key: Value format (do not use bolding for keys, just plain text):
- **Header**: ...
- **Sub text**: ...
- **CTA**: ...
- **CTA functionality**: ...
- **Surfacing conditions**: ...
- **Popup Priority**: ...
- **Mockup**: {{FIGMA_IMAGE:ID}}

## Special Formatting for Flow Slides (Section 9)
- **Description**: Step-by-step flow...
- **Mockup**: {{FIGMA_IMAGE:ID}}

## Special Formatting for Vision/Goals (Sections 3 & 4)
Use sub-headers for the split sections:
**Vision**
- Point 1
- Point 2

**Anti-vision**
- Point 1
- Point 2

CONTENT SOURCES:
- **Slides Content** (Reference for tone/style):
{self._format_docs(slides)}

- **Edge Cases**:
{edge_cases_content}

- **Additional User Context**:
{custom_context}

- **Figma Data (JSON)**:
{figma_content}

INSTRUCTIONS FOR FIGMA DATA:
1.  **Identifying Screens**: Treat each Top-Level Frame as a UI Screen. Use frame name as <Screen Name>.
2.  **Extracting Content**: Use `text_content` to fill Header, Sub text, CTA.
3.  **Understanding Flows**: Use `transitions` to describe flows.
4.  **Using Images**: Use `{{FIGMA_IMAGE:FRAME_ID}}` exactly as provided in the "AVAILABLE MOCKUPS" list.

- **Examples** (Mimic the depth and actionable detail):
{self._format_docs(gdd_examples)}
"""
        # 4. Generate
        print("Generating...")
        import time
        
        # Strategy: Try Pro first, then fallback to Flash if rate limited
        # Updated to use Gemini 2.5 models as 1.5 are not available for this user
        models_to_try = ['gemini-2.5-pro', 'gemini-2.5-flash']
        
        last_error = "Unknown error"
        for model_name in models_to_try:
            print(f"Attempting generation with model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            max_retries = 3
            retry_delay = 10 

            for attempt in range(max_retries):
                try:
                    response = model.generate_content(full_prompt)
                    generated_text = response.text
                    
                    # Replace Figma Image Placeholders with URLs AND Deep Links
                    # Handle both {{FIGMA_IMAGE:ID}} and {FIGMA_IMAGE:ID}
                    figma_links = flow_data.get("links", {})
                    print(f"DEBUG: Found {len(figma_images)} images and {len(figma_links)} links.")
                    
                    # Iterate over ALL known frames (from links), not just fetched images
                    # This ensures we provide a link even if the image download failed
                    all_frame_ids = set(figma_links.keys()) | set(figma_images.keys())
                    
                    for f_id in all_frame_ids:
                        deep_link = figma_links.get(f_id, "#")
                        url = figma_images.get(f_id)
                        
                        if url:
                            # We have the image
                            replacement = f"[![Mockup]({url})]({deep_link})"
                        else:
                            # Image fetch failed, provide a text link fallback
                            replacement = f"[**[View Mockup in Figma]**]({deep_link})"
                        
                        if f_id in generated_text:
                            print(f"DEBUG: Replacing {f_id} with {'Image' if url else 'Fallback Link'}")
                        
                        # Try double braces first
                        generated_text = generated_text.replace(f"{{{{FIGMA_IMAGE:{f_id}}}}}", replacement)
                        # Try single braces
                        generated_text = generated_text.replace(f"{{FIGMA_IMAGE:{f_id}}}", replacement)
                    
                    # Save generated markdown to last_generated_gdd.md
                    with open("last_generated_gdd.md", "w") as f:
                        f.write(generated_text)
                    
                    return generated_text
                except Exception as e:
                    error_str = str(e)
                    last_error = error_str
                    print(f"Error with {model_name} (Attempt {attempt+1}): {error_str}")
                    
                    if "429" in error_str:
                        if attempt < max_retries - 1:
                            print(f"Quota exceeded. Retrying in {retry_delay}s...")
                            time.sleep(retry_delay)
                            retry_delay *= 2
                        else:
                            print(f"Max retries exceeded for {model_name}. Switching models if available.")
                    else:
                        # If it's not a rate limit (e.g. invalid argument), fail immediately or try next model?
                        # Usually safe to try next model.
                        break
        
        return f"Error: Failed to generate content. Last error: {last_error}"

    def _format_docs(self, docs: List[dict]) -> str:
        out = ""
        # Safety Cap: We need to fit everything within ~250k tokens (~1M chars).
        # We'll cap each section to ensure we don't blow the budget.
        # Slides are critical for style, so we give them more room or prioritize them.
        # Examples are heavy, so we truncate them more aggressively if needed.
        
        MAX_TOTAL_CHARS = 300000 # 300k chars per section (Slides / Examples) to stay safe
        
        current_chars = 0
        for d in docs:
            # Truncate individual docs to 15k chars to prevent one huge doc from hogging space
            content = d['content'][:15000] 
            if current_chars + len(content) > MAX_TOTAL_CHARS:
                break
            out += f"--- DOCUMENT: {d['filename']} ---\n{content}...\n\n"
            current_chars += len(content)
            
        return out
