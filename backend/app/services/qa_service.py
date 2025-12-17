import os
import google.generativeai as genai
from typing import List, Optional

class QAService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.history_file = "../data/qa_history/history.json"
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-2.5-flash for better quota availability
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def load_history(self) -> str:
        """Loads past Q&A context."""
        if os.path.exists(self.history_file):
            try:
                import json
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    return "\n".join([f"Q: {item['q']}\nA: {item['a']}" for item in data])
            except:
                return ""
        return ""

    def save_entry(self, question: str, answer: str):
        """Saves a new Q&A entry."""
        data = []
        if os.path.exists(self.history_file):
            try:
                import json
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
            except:
                pass
        
        data.append({"q": question, "a": answer})
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        
        import json
        with open(self.history_file, 'w') as f:
            json.dump(data, f, indent=2)

    def analyze_prompt(self, prompt: str, gdd_context: str = "") -> List[str]:
        """
        Analyzes the prompt and returns a list of clarifying questions if information is missing.
        Returns empty list if the prompt is sufficient.
        """
        if not self.model:
            return []

        history = self.load_history()

        analysis_prompt = f"""
You are a Senior Game Producer. A designer has come to you with a game idea.
Your goal is to determine if you have enough information to write a detailed Game Design Document (GDD).

USER IDEA:
{prompt}

PAST Q&A HISTORY (Do not ask these again):
{history}

CONTEXT (Existing GDDs/Slides style):
{gdd_context[:2000]}... (truncated)

TASK:
1. Analyze the idea.
2. If the idea is too vague (e.g., "Make a racing game"), ask 3-5 critical clarifying questions (e.g., "What is the core loop?", "Is it single or multiplayer?", "What is the art style?").
3. If the idea is detailed enough to start a draft, return "SUFFICIENT".

OUTPUT FORMAT:
- If sufficient: Just the word "SUFFICIENT".
- If questions needed: A JSON-formatted list of strings, e.g., ["Question 1?", "Question 2?"]
"""
        try:
            response = self.model.generate_content(analysis_prompt)
            text = response.text.strip()
            
            if "SUFFICIENT" in text.upper():
                return []
            
            # Simple parsing of the list
            import json
            try:
                # Try to find JSON array in the text
                start = text.find('[')
                end = text.rfind(']') + 1
                if start != -1 and end != -1:
                    return json.loads(text[start:end])
                else:
                    # Fallback: split by newlines if not JSON
                    return [line.strip('- *') for line in text.split('\n') if '?' in line]
            except:
                return [text] # Return raw text if parsing fails
                
        except Exception as e:
            error_str = str(e)
            print(f"Error analyzing prompt: {e}")
            # Re-raise API key and quota errors so they can be handled properly
            if "API key" in error_str.lower() or "API_KEY" in error_str:
                raise
            if "429" in error_str or "quota" in error_str.lower() or "Quota exceeded" in error_str:
                raise Exception(f"API quota exceeded: {error_str[:200]}")
            return []
