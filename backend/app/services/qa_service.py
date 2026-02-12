import os
import json
import anthropic
from typing import List, Optional
from app.config import get_anthropic_api_key

QA_MODEL = "claude-3-5-haiku-20241022"


class QAService:
    def __init__(self):
        self.history_file = "../data/qa_history/history.json"

    def load_history(self) -> str:
        """Loads past Q&A context."""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    return "\n".join([f"Q: {item['q']}\nA: {item['a']}" for item in data])
            except Exception:
                return ""
        return ""

    def save_entry(self, question: str, answer: str):
        """Saves a new Q&A entry."""
        data = []
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
            except Exception:
                pass

        data.append({"q": question, "a": answer})
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        with open(self.history_file, 'w') as f:
            json.dump(data, f, indent=2)

    def analyze_prompt(self, prompt: str, gdd_context: str = "") -> List[str]:
        """
        Analyzes the prompt and returns a list of clarifying questions if information is missing.
        Returns empty list if the prompt is sufficient.
        """
        api_key = get_anthropic_api_key()
        if not api_key:
            return []

        history = self.load_history()
        client = anthropic.Anthropic(api_key=api_key)

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
            response = client.messages.create(
                model=QA_MODEL,
                max_tokens=1024,
                messages=[{"role": "user", "content": analysis_prompt}],
            )
            text = response.content[0].text.strip()

            if "SUFFICIENT" in text.upper():
                return []

            try:
                start = text.find('[')
                end = text.rfind(']') + 1
                if start != -1 and end != -1:
                    return json.loads(text[start:end])
                else:
                    return [line.strip('- *') for line in text.split('\n') if '?' in line]
            except Exception:
                return [text]

        except Exception as e:
            error_str = str(e)
            print(f"Error analyzing prompt: {e}")
            # Re-raise API key and quota errors so they can be handled properly
            if "API key" in error_str.lower() or "API_KEY" in error_str:
                raise
            if "429" in error_str or "quota" in error_str.lower() or "Quota exceeded" in error_str:
                raise Exception(f"API quota exceeded: {error_str[:200]}")
            return []
