import os
import time
import anthropic
from typing import List, Optional
from app.config import get_anthropic_api_key
from app.services.parser import DocumentParser
from app.services.analyzer import EdgeCaseAnalyzer
from app.services.figma import FigmaService
from app.services.context_analyzer import ContextAnalyzer

# Default model for spec generation (good balance of quality and context)
DEFAULT_MODEL = "claude-sonnet-4-20250514"
FALLBACK_MODEL = "claude-3-5-haiku-20241022"


class GeneratorService:
    def __init__(self):
        self.context_analyzer = ContextAnalyzer()

    def generate_gdd(self, prompt: str, figma_token: Optional[str], figma_url: Optional[str],
                     gdds_dir: str, slides_dir: str, edge_cases_dir: str, context_uploads_dir: str = None) -> str:

        api_key = get_anthropic_api_key()
        if not api_key:
            return "Error: API key is not set. Enter your Anthropic API key in the box above and click Save."
        client = anthropic.Anthropic(api_key=api_key)

        # 1. Analyze ALL specs to build comprehensive knowledge base
        print("Analyzing all existing specs for full context...")
        analysis = self.context_analyzer.analyze_all_specs(gdds_dir, slides_dir)

        # 2. Check for potential conflicts
        conflicts = self.context_analyzer.find_potential_conflicts(prompt, analysis)
        if conflicts:
            print(f"[WARNING] Found {len(conflicts)} potential conflicts:")
            for conflict in conflicts:
                print(f"  {conflict}")

        # 3. Get relevant context based on the prompt
        relevant_context = self.context_analyzer.get_relevant_context(prompt, analysis, max_features=15)

        # 4. Load full documents for examples
        print("Loading document examples...")
        gdd_examples = DocumentParser.load_documents_from_dir(gdds_dir)
        slides = DocumentParser.load_documents_from_dir(slides_dir)

        edge_cases_files = os.listdir(edge_cases_dir) if os.path.exists(edge_cases_dir) else []
        edge_cases_content = ""
        if edge_cases_files:
            path = os.path.join(edge_cases_dir, edge_cases_files[0])
            if not path.startswith('.'):
                full_content = DocumentParser.parse_file(path)
                edge_cases_content = full_content[:10000] if len(full_content) > 10000 else full_content

        # Load Custom Context Uploads
        custom_context = ""
        if context_uploads_dir and os.path.exists(context_uploads_dir):
            for filename in os.listdir(context_uploads_dir):
                if filename.endswith(".desc.txt") or filename.startswith("."):
                    continue

                file_path = os.path.join(context_uploads_dir, filename)
                desc_path = file_path + ".desc.txt"

                file_content = DocumentParser.parse_file(file_path)
                description = ""
                if os.path.exists(desc_path):
                    with open(desc_path, 'r') as f:
                        description = f.read()

                optimized_content = file_content[:8000] if len(file_content) > 8000 else file_content
                custom_context += f"\n--- EXTRA CONTEXT FILE: {filename} ---\n"
                custom_context += f"User Description: {description}\n"
                custom_context += f"File Content:\n{optimized_content}\n"

        # 2. Fetch Figma Data
        figma_content = ""
        figma_images = {}
        flow_data = {}
        if figma_token and figma_url:
            print("Fetching Figma data...")
            try:
                figma_service = FigmaService(figma_token)
                file_key = FigmaService.parse_file_key(figma_url)
                file_data = figma_service.get_file(file_key)
                flow_data = figma_service.extract_flows(file_key, file_data)

                import json
                figma_json = flow_data["json_data"]
                figma_content = json.dumps(figma_json, indent=2)
                figma_images = flow_data["images"]
                print(f"DEBUG: Successfully fetched {len(figma_images)} images from Figma.")

                figma_content += "\n\nAVAILABLE MOCKUPS (Use these Frame IDs to reference images):\n"
                for f_id, url in figma_images.items():
                    figma_content += f"- Frame ID: {f_id} (Image Available)\n"

            except Exception as e:
                figma_content = f"Error fetching Figma data: {str(e)}"
                print(figma_content)

        # 5. Construct Prompt with Full Context
        print("Constructing prompt with comprehensive context...")

        # Build conflict warnings if any (optimized - more concise)
        conflict_warning = ""
        if conflicts:
            conflicts_list = "\n".join([f"- {c}" for c in conflicts[:5]])  # Limit to 5 conflicts
            conflict_warning = f"""
⚠️ CONFLICTS: {len(conflicts)} potential overlaps detected:
{conflicts_list}

Address by: clarifying differences, explaining integration, or noting required modifications.
"""

        full_prompt = f"""
ROLE: Expert game design spec writer with knowledge of {analysis['stats']['total_specs']} existing specs.

GOALS: Create specs that are consistent with existing features/terminology, avoid conflicts, leverage established patterns, maintain quality/style.

{conflict_warning}

# FORMATTING RULES
- Format: clean, plain text (no bolding, no markdown **, no HTML)
- Lists: use hyphens (-)
- Headings: ## for sections
- Copy-paste ready, strategic line breaks

# WRITING STYLE
- Specific, concrete, player-centric
- Actionable points, focus on "what" and "why" before "how"
- Anticipate developer/QA questions
- BE CONCISE: no fluff, short descriptions

# USER REQUEST
{prompt}

# COMPREHENSIVE CONTEXT FROM ALL EXISTING SPECS
{relevant_context}

KNOWLEDGE: {analysis['stats']['total_specs']} specs, {len(analysis['features'])} features. Terms: {', '.join(list(analysis['terminology'].keys())[:10])}

REQUIREMENTS:
1. Match terminology/naming from existing specs
2. Reference existing features when relevant
3. Avoid duplicating existing functionality
4. Maintain consistency in style/structure

STRUCTURE (Required for PPTX conversion - use ## headers):
1. <Spec Name> 2. Problem statements 3. Vision/Anti-vision 4. Business/Design Goals 5. Opportunities 6. Expected Upsides 7. Overview 8. <Screen Name> UI (per screen) 9. <Flow name> Flow (per flow) 10. Edge Cases 11. UI dev requirement 12. Sound requirement 13. Experimentation Plan 14. Tracking requirement 15. Analysis Plan 16. Changelog

UI SLIDES (Section 8): Key: Value format (plain text):
Header: ... | Sub text: ... | CTA: ... | CTA functionality: ... | Surfacing conditions: ... | Popup Priority: ... | Mockup: {{FIGMA_IMAGE:ID}}

FLOW SLIDES (Section 9): Description: Step-by-step... | Mockup: {{FIGMA_IMAGE:ID}}

VISION/GOALS (Sections 3-4): Use sub-headers:
Vision: - Point 1 - Point 2
Anti-vision: - Point 1 - Point 2

CONTENT SOURCES:
- Slides (Style reference):
{self._format_docs_optimized(slides, prompt, max_total_chars=40000, max_docs=3)}

- Edge Cases:
{edge_cases_content[:5000] if len(edge_cases_content) > 5000 else edge_cases_content}

- Additional Context:
{custom_context[:3000] if len(custom_context) > 3000 else custom_context}

- Figma Data:
{figma_content[:15000] if len(figma_content) > 15000 else figma_content}

FIGMA: Each Top-Level Frame = UI Screen. Use frame name as <Screen Name>. Use `text_content` for Header/Sub text/CTA. Use `transitions` for flows. Use `{{FIGMA_IMAGE:FRAME_ID}}` for images.

- Examples (Match depth and detail):
{self._format_docs_optimized(gdd_examples, prompt, max_total_chars=60000, max_docs=5)}
"""

        # 4. Generate with Claude
        print("Generating...")
        models_to_try = [DEFAULT_MODEL, FALLBACK_MODEL]
        last_error = "Unknown error"

        for model_name in models_to_try:
            print(f"Attempting generation with model: {model_name}")
            max_retries = 3
            retry_delay = 10

            for attempt in range(max_retries):
                try:
                    response = client.messages.create(
                        model=model_name,
                        max_tokens=16384,
                        messages=[{"role": "user", "content": full_prompt}],
                    )
                    generated_text = response.content[0].text

                    # Replace Figma Image Placeholders with URLs AND Deep Links
                    figma_links = flow_data.get("links", {})
                    print(f"DEBUG: Found {len(figma_images)} images and {len(figma_links)} links.")
                    all_frame_ids = set(figma_links.keys()) | set(figma_images.keys())

                    for f_id in all_frame_ids:
                        deep_link = figma_links.get(f_id, "#")
                        url = figma_images.get(f_id)
                        if url:
                            replacement = f"[![Mockup]({url})]({deep_link})"
                        else:
                            replacement = f"[View Mockup in Figma]({deep_link})"
                        if f_id in generated_text:
                            print(f"DEBUG: Replacing {f_id} with {'Image' if url else 'Fallback Link'}")
                        generated_text = generated_text.replace(f"{{{{FIGMA_IMAGE:{f_id}}}}}", replacement)
                        generated_text = generated_text.replace(f"{{FIGMA_IMAGE:{f_id}}}", replacement)

                    with open("last_generated_gdd.md", "w") as f:
                        f.write(generated_text)

                    return generated_text
                except Exception as e:
                    error_str = str(e)
                    last_error = error_str
                    print(f"Error with {model_name} (Attempt {attempt+1}): {error_str}")
                    if "rate_limit" in error_str.lower() or "429" in error_str or "quota" in error_str.lower() or "Quota exceeded" in error_str:
                        if attempt < max_retries - 1:
                            print(f"Quota exceeded for {model_name}. Retrying in {retry_delay}s...")
                            time.sleep(retry_delay)
                            retry_delay *= 2
                        else:
                            print(f"Max retries exceeded for {model_name}. Switching models if available.")
                            break
                    else:
                        break

        if "429" in last_error or "quota" in last_error.lower() or "Quota exceeded" in last_error:
            return f"Error: API quota exceeded. Details: {last_error[:200]}"
        return f"Error: Failed to generate content. Last error: {last_error[:200]}"

    def _format_docs(self, docs: List[dict]) -> str:
        """Legacy method - use _format_docs_optimized instead."""
        return self._format_docs_optimized(docs, "", max_total_chars=100000, max_docs=5)

    def _format_docs_optimized(self, docs: List[dict], prompt: str = "",
                               max_total_chars: int = 80000,
                               max_docs: int = 5) -> str:
        """Format documents with truncation (no LLM dependency)."""
        out = ""
        current_chars = 0
        for d in docs[:max_docs]:
            content = d['content'][:8000]
            if current_chars + len(content) > max_total_chars:
                break
            out += f"--- DOCUMENT: {d['filename']} ---\n{content}...\n\n"
            current_chars += len(content)
        return out
