import os
import re
import google.generativeai as genai
from app.services.parser import DocumentParser
from typing import Dict, List, Optional

def _check_mock_links_and_popup_priority(spec_content: str) -> List[Dict]:
    """
    Scan spec text for missing Mock Link and missing Popup Priority.
    Returns a list of alerts: { "type": "missing_mock_link" | "missing_popup_priority", "section": str, "description": str }
    """
    alerts = []
    if not spec_content or not spec_content.strip():
        return alerts

    # Split into sections by ## headers
    sections = re.split(r'\n(?=##\s+)', spec_content)
    
    for block in sections:
        lines = block.split('\n')
        if not lines:
            continue
        first_line = lines[0].strip()
        # Section title: ## Something UI or ## Something Popup
        section_title = first_line.replace('#', '').strip() if first_line.startswith('#') else ''
        block_text = block.lower()
        has_mockup_label = 'mockup:' in block_text or 'mock up:' in block_text
        has_popup_in_title = 'popup' in section_title.lower() or 'modal' in section_title.lower()
        has_popup_in_content = 'popup' in block_text or 'modal' in block_text
        
        # Check Mock Link: UI-like section (has Header/CTA or "UI" in title) should have a valid mockup
        is_ui_section = ' ui' in section_title.lower() or 'ui ' in section_title.lower() or ('header:' in block_text and ('cta:' in block_text or 'sub text:' in block_text))
        if is_ui_section or has_mockup_label:
            # Valid mock link: FIGMA_IMAGE:..., http, or markdown image/link [...](...)
            mockup_match = re.search(r'mockup\s*:\s*(.+?)(?=\n|$)', block_text, re.IGNORECASE | re.DOTALL)
            mockup_value = (mockup_match.group(1).strip() if mockup_match else '').strip()
            has_valid_link = (
                'figma_image:' in mockup_value or
                'http' in mockup_value or
                '[' in mockup_value
            ) or bool(re.search(r'figma_image\s*:\s*\d', mockup_value, re.IGNORECASE))
            if has_mockup_label and (not mockup_value or not has_valid_link):
                alerts.append({
                    "type": "missing_mock_link",
                    "section": section_title or "(unnamed section)",
                    "description": "Mockup is empty or does not contain a valid link (e.g. FIGMA_IMAGE:ID or image URL)."
                })
        
        # Check Popup Priority: sections that are popups should have "Popup Priority:"
        if has_popup_in_title or (has_popup_in_content and is_ui_section):
            has_popup_priority = bool(re.search(r'popup\s*priority\s*:', block_text))
            if not has_popup_priority:
                alerts.append({
                    "type": "missing_popup_priority",
                    "section": section_title or "(unnamed section)",
                    "description": "Popup/Modal section does not specify Popup Priority (e.g. High/Medium/Low)."
                })
    
    return alerts


class SpecVerifier:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
    
    def verify_spec(self, spec_content: str, spec_filename: str, all_specs_context: str) -> Dict:
        """
        Verifies a spec against existing specs and checks for:
        - Conflicts
        - Gaps
        - Potential threats
        - Format/structure issues
        - Clarifying questions
        """
        if not self.model:
            return {
                "error": "GEMINI_API_KEY is not set. Please set it in the environment."
            }
        
        prompt = f"""
# ROLE
You are an expert spec reviewer and quality assurance specialist. Your role is to analyze game design specifications for conflicts, gaps, threats, and structural issues.

# SPEC TO VERIFY
Filename: {spec_filename}

Content:
{spec_content[:50000]}  # Limit to avoid token limits

# CONTEXT: ALL EXISTING SPECS
{all_specs_context[:200000]}  # Limit context to stay within token limits

# TASK
Analyze the provided spec and provide a comprehensive verification report covering:

1. CONFLICTS: Identify any contradictions or conflicts between this spec and existing specs
   - Feature conflicts
   - Design inconsistencies
   - Technical contradictions
   - Timeline/resource conflicts

2. GAPS: Identify missing information or incomplete sections
   - Missing required sections
   - Incomplete feature descriptions
   - Missing edge cases
   - Unclear requirements
   - Missing technical specifications

3. POTENTIAL THREATS: Identify risks and potential issues
   - Technical risks
   - User experience risks
   - Business risks
   - Implementation challenges
   - Scalability concerns

4. FORMAT & STRUCTURE: Evaluate adherence to spec format standards
   - Missing required sections (Problem statements, Vision, Goals, etc.)
   - Incorrect formatting
   - Inconsistent structure
   - Missing UI/Flow documentation

5. CLARIFYING QUESTIONS: Generate questions that need answers
   - Questions about ambiguous requirements
   - Questions about missing details
   - Questions about conflicts that need resolution
   - Questions about format/structure

# OUTPUT FORMAT
Provide your analysis in the following JSON structure:
{{
    "conflicts": [
        {{
            "type": "Feature Conflict",
            "description": "Detailed description",
            "severity": "High/Medium/Low",
            "related_specs": ["spec1.pdf", "spec2.pdf"]
        }}
    ],
    "gaps": [
        {{
            "section": "Section name",
            "description": "What's missing",
            "impact": "High/Medium/Low"
        }}
    ],
    "threats": [
        {{
            "type": "Technical Risk",
            "description": "Detailed threat description",
            "severity": "High/Medium/Low",
            "recommendation": "How to mitigate"
        }}
    ],
    "format_issues": [
        {{
            "issue": "Missing section",
            "description": "Description of format/structure issue",
            "recommendation": "How to fix"
        }}
    ],
    "questions": [
        "Question 1?",
        "Question 2?"
    ],
    "summary": "Overall assessment and key findings"
}}

Be thorough, specific, and actionable. Reference specific sections and existing specs when identifying conflicts.
"""
        
        try:
            # Alerts for missing Mock Link and Popup Priority (from content scan)
            alerts = _check_mock_links_and_popup_priority(spec_content)

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Try to extract JSON from the response
            import json
            
            # Find JSON in the response
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_json = json.loads(json_match.group(0))
                result_json["alerts"] = alerts
                return result_json
            else:
                # Fallback: return structured text
                return {
                    "raw_analysis": result_text,
                    "conflicts": [],
                    "gaps": [],
                    "threats": [],
                    "format_issues": [],
                    "questions": [],
                    "alerts": alerts,
                    "summary": "Analysis completed but could not parse structured output. See raw_analysis."
                }
        except Exception as e:
            return {
                "error": f"Verification failed: {str(e)}",
                "conflicts": [],
                "gaps": [],
                "threats": [],
                "format_issues": [],
                "questions": [],
                "alerts": _check_mock_links_and_popup_priority(spec_content) if spec_content else []
            }

