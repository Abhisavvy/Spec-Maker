import os
import google.generativeai as genai
from app.services.parser import DocumentParser
from typing import Dict, List, Optional

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

# CONTEXT: ALL EXISTING SPECS (53 specs)
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
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Try to extract JSON from the response
            import json
            import re
            
            # Find JSON in the response
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_json = json.loads(json_match.group(0))
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
                    "summary": "Analysis completed but could not parse structured output. See raw_analysis."
                }
        except Exception as e:
            return {
                "error": f"Verification failed: {str(e)}",
                "conflicts": [],
                "gaps": [],
                "threats": [],
                "format_issues": [],
                "questions": []
            }

