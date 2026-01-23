"""
Token optimization utilities to reduce token usage without compromising quality.
Uses intelligent summarization, semantic selection, and compression techniques.
"""
import os
from typing import List, Dict, Optional
import google.generativeai as genai

class TokenOptimizer:
    """
    Optimizes content for token efficiency while maintaining quality.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.flash_model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.flash_model = None
    
    def select_relevant_docs(self, prompt: str, docs: List[dict], max_docs: int = 5, max_chars_per_doc: int = 8000) -> List[dict]:
        """
        Select most relevant documents based on prompt similarity.
        Uses keyword matching and content overlap scoring.
        """
        if len(docs) <= max_docs:
            return docs[:max_docs]
        
        prompt_lower = prompt.lower()
        prompt_words = set(prompt_lower.split())
        
        # Score each document
        scored_docs = []
        for doc in docs:
            # Check filename relevance
            filename_lower = doc['filename'].lower()
            filename_words = set(filename_lower.replace('.', ' ').replace('_', ' ').split())
            
            # Check content relevance (first 2000 chars)
            content_sample = doc['content'][:2000].lower()
            content_words = set(content_sample.split())
            
            # Calculate overlap score
            filename_overlap = len(prompt_words & filename_words)
            content_overlap = len(prompt_words & content_words)
            
            # Weight: filename matches are more important
            score = (filename_overlap * 3) + content_overlap
            
            scored_docs.append((score, doc))
        
        # Sort by relevance
        scored_docs.sort(reverse=True, key=lambda x: x[0])
        
        # Return top N, but always include at least 2-3 for style reference
        selected = [doc for _, doc in scored_docs[:max_docs]]
        
        # Ensure we have style examples even if not directly relevant
        if len(selected) < 3 and len(docs) >= 3:
            # Add a couple more for style reference
            for doc in docs:
                if doc not in selected:
                    selected.append(doc)
                    if len(selected) >= 3:
                        break
        
        return selected
    
    def smart_truncate_doc(self, content: str, max_chars: int = 8000) -> str:
        """
        Intelligently truncate a document by keeping:
        - First section (intro/overview)
        - Key sections (headers)
        - Last section (conclusion/summary)
        """
        if len(content) <= max_chars:
            return content
        
        lines = content.split('\n')
        
        # Find section headers
        header_indices = []
        for i, line in enumerate(lines):
            if line.startswith('##') and not line.startswith('###'):
                header_indices.append(i)
        
        # Strategy: Keep first 30%, middle sections (sampled), last 20%
        first_chunk = int(max_chars * 0.3)
        last_chunk = int(max_chars * 0.2)
        middle_chunk = max_chars - first_chunk - last_chunk
        
        # Get first part
        first_lines = lines[:min(50, len(lines))]
        first_text = '\n'.join(first_lines)
        
        # Get key sections (sample every Nth header)
        middle_text = ""
        if header_indices:
            step = max(1, len(header_indices) // 5)  # Sample 5 sections
            for idx in header_indices[::step][:5]:
                section_lines = lines[idx:min(idx+20, len(lines))]
                middle_text += '\n'.join(section_lines) + '\n\n'
        
        # Get last part
        last_lines = lines[-30:]
        last_text = '\n'.join(last_lines)
        
        # Combine
        result = first_text[:first_chunk]
        if middle_text:
            result += "\n\n[... key sections ...]\n\n" + middle_text[:middle_chunk]
        result += "\n\n[... end ...]\n\n" + last_text[:last_chunk]
        
        return result[:max_chars]
    
    def summarize_if_needed(self, content: str, max_length: int = 5000, target_length: int = 3000) -> str:
        """
        Summarize content if it's too long, using Flash model for efficiency.
        """
        if len(content) <= max_length:
            return content
        
        if not self.flash_model:
            # Fallback: simple truncation
            return content[:target_length] + "... [truncated]"
        
        try:
            summary_prompt = f"""Summarize this game design spec content in {target_length//10} sentences, keeping:
- Key features and mechanics
- Important terminology
- UI/UX patterns
- Writing style examples

Content:
{content[:10000]}  # Limit input to avoid token limits
"""
            response = self.flash_model.generate_content(summary_prompt)
            return response.text[:target_length]
        except Exception as e:
            print(f"[TOKEN_OPT] Summarization failed, using truncation: {e}")
            return content[:target_length] + "... [truncated]"
    
    def optimize_figma_json(self, figma_json: dict, max_size: int = 10000) -> str:
        """
        Extract only essential Figma data, removing verbose metadata.
        """
        import json
        
        # Extract only what we need
        essential = {
            "frames": [],
            "transitions": []
        }
        
        # Process frames (limit to top-level frames)
        if isinstance(figma_json, dict):
            frames = figma_json.get("frames", [])
            for frame in frames[:20]:  # Limit to 20 frames
                essential_frame = {
                    "id": frame.get("id"),
                    "name": frame.get("name"),
                    "text_content": frame.get("text_content", "")[:500],  # Limit text
                }
                essential["frames"].append(essential_frame)
            
            # Transitions
            transitions = figma_json.get("transitions", [])
            for trans in transitions[:10]:  # Limit transitions
                essential["transitions"].append({
                    "from": trans.get("from"),
                    "to": trans.get("to"),
                    "trigger": trans.get("trigger")
                })
        
        result = json.dumps(essential, indent=1)
        
        # If still too large, truncate
        if len(result) > max_size:
            # Keep structure but reduce content
            result = result[:max_size] + "\n... [truncated]"
        
        return result
    
    def compress_prompt_instructions(self, instructions: str) -> str:
        """
        Compress verbose instructions while keeping essential information.
        """
        # Remove redundant phrases
        replacements = {
            "CRITICAL: Do NOT use": "Do NOT use",
            "immediately usable by development teams": "ready for development",
            "well-structured game design documents": "game design documents",
            "Use clean formatting": "Format: clean, plain text",
            "Use simple bullet points with hyphens (-) for lists": "Lists: use hyphens (-)",
            "Keep headings simple with ## for main sections": "Headings: ## for sections",
            "Ensure all text is copy-paste ready": "Copy-paste ready",
            "Use line breaks strategically for readability": "Strategic line breaks",
        }
        
        for old, new in replacements.items():
            instructions = instructions.replace(old, new)
        
        return instructions
    
    def format_docs_optimized(self, docs: List[dict], prompt: str = "", 
                              max_total_chars: int = 80000, 
                              max_docs: int = 5,
                              max_chars_per_doc: int = 8000) -> str:
        """
        Optimized document formatting with intelligent selection and truncation.
        """
        if not docs:
            return ""
        
        # Select most relevant docs
        selected_docs = self.select_relevant_docs(prompt, docs, max_docs=max_docs, max_chars_per_doc=max_chars_per_doc)
        
        out = ""
        current_chars = 0
        
        for i, doc in enumerate(selected_docs):
            # Smart truncate each document
            content = self.smart_truncate_doc(doc['content'], max_chars_per_doc)
            
            if current_chars + len(content) > max_total_chars:
                # Add a note about truncation
                out += f"\n[... {len(docs) - i} more documents available but truncated for token efficiency ...]\n"
                break
            
            out += f"--- EXAMPLE {i+1}: {doc['filename']} ---\n{content}\n\n"
            current_chars += len(content)
        
        return out
