import os
import json
import time
import random
import anthropic
from app.config import get_anthropic_api_key
from app.services.parser import DocumentParser
from typing import List, Dict

# Model with large context for chat over specs
CHAT_MODEL = "claude-sonnet-4-20250514"


class SpecChatService:
    def __init__(self):
        self.context = ""
        self.conversation_history: List[Dict[str, str]] = []
        self.history_file = "../data/qa_history/chat_history.json"

    def load_context(self, gdds_dir: str, slides_dir: str):
        """Loads and concatenates all spec content."""
        print("Loading spec context for chat...")
        docs = []
        docs.extend(DocumentParser.load_documents_from_dir(gdds_dir))
        docs.extend(DocumentParser.load_documents_from_dir(slides_dir))

        context_parts = []
        for doc in docs:
            context_parts.append(f"--- DOCUMENT: {doc['filename']} ---\n{doc['content']}")

        self.context = "\n\n".join(context_parts)
        print(f"Loaded {len(docs)} documents into context.")
        self._load_history()

    def _load_history(self):
        """Load conversation history from file."""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    self.conversation_history = json.load(f)
            except Exception:
                self.conversation_history = []

    def _save_history(self):
        """Save conversation history to file."""
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        history_to_save = self.conversation_history[-20:]
        with open(self.history_file, 'w') as f:
            json.dump(history_to_save, f, indent=2)

    def _build_messages(self, question: str) -> List[Dict[str, str]]:
        """Build messages list: system context + conversation history + new question."""
        conversation_context = ""
        if self.conversation_history:
            for entry in self.conversation_history[-10:]:
                conversation_context += f"User: {entry['question']}\nAssistant: {entry['answer']}\n\n"

        safe_context = self.context[:600000]
        if len(self.context) > 600000:
            print(f"WARNING: Context truncated from {len(self.context)} to 600,000 chars.")

        system_and_context = f"""
# ROLE & EXPERTISE
You are an expert game design analyst and consultant specializing in mobile casual games, economy systems, and retention mechanics. You have deep knowledge of:
- Player psychology and behavioral patterns
- Game economy balancing and progression systems
- Competitive analysis and market trends
- Feature design and A/B testing methodologies
- Mobile game monetization strategies

# KNOWLEDGE BASE
You have access to game design documents, feature specifications, and product documentation. Your responses MUST be grounded in these documents. If you invent information not present in the specs it should be specifically mentioned.

# RESPONSE FORMATTING RULES

## Structure Every Response With:

### 📋 **CONTEXT** (What you're analyzing)
- Brief summary of the relevant spec/feature
- Key mechanics or systems involved

### 🎯 **DIRECT ANSWER** (Core response)
- Use markdown formatting:
  - **Bold** for key terms and mechanics
  - *Italics* for emphasis
  - `Code blocks` for formulas, variables, or technical terms
  - Bullet points for lists
  - Numbered lists for sequential steps
  - Tables for comparisons

### 🔍 **EVIDENCE** (Grounding in specs)
- Quote or reference specific sections from uploaded docs
- Format: "[Source: {{Document Name}}, Section: {{Section}}]"
- If information spans multiple docs, cite all relevant sources

### 💡 **DESIGN ANALYSIS** (OPTIONAL - ONLY IF PROMPTED)
**DO NOT INCLUDE this section unless the user explicitly asks for analysis, critique, improvements, or opinion.**
If prompted, choose ONE:
- **OPTIMIZATION**: How to improve the current design
- **CRITIQUE**: What's working / what's not and why
- **ALTERNATIVES**: Other approaches to consider
- **RISKS**: Potential issues or edge cases

### ⚙️ **ACTIONABLE RECOMMENDATIONS** (OPTIONAL - ONLY IF PROMPTED)
**DO NOT INCLUDE this section unless the user explicitly asks for recommendations or next steps.**
- Specific, implementable suggestions
- Prioritized by impact (High/Medium/Low)
- Include rationale for each recommendation

# INTELLIGENCE GUIDELINES

## Relational Understanding
When answering questions:
1. **Cross-Reference**: Identify if the question relates to multiple systems (e.g., economy + retention)
2. **Dependency Mapping**: Highlight how changes in one system affect others
3. **Player Journey**: Consider where this fits in the player experience

## Design Critique Framework
When evaluating ideas:

✅ **STRENGTHS**
- What works well and why
- Supporting evidence from similar successful games
- Alignment with player psychology

⚠️ **CONCERNS**
- Potential problems or conflicts with existing systems
- Technical or UX challenges
- Retention/monetization risks

🔄 **OPTIMIZATION PATHS**
- Specific improvements with reasoning
- Trade-offs to consider
- Testing recommendations

## Smart Contextual Responses
- If a question is vague, ask clarifying questions BEFORE answering
- If information is missing from specs, explicitly state: "Not found in current documentation. Based on industry standards..."
- If multiple interpretations exist, present options with pros/cons

# CONTEXT (Loaded Documents):
{safe_context}

# CONVERSATION HISTORY:
{conversation_context or "No previous conversation."}
"""

        # Single user message containing system context + question (Claude accepts long user content)
        user_content = f"{system_and_context}\n\n# USER QUESTION:\n{question}"
        return [{"role": "user", "content": user_content}]

    def ask_question(self, question: str) -> str:
        """Answers a question based on the loaded context with conversation memory."""
        api_key = get_anthropic_api_key()
        if not api_key:
            return "Error: API key is not set. Enter your Anthropic API key in the box at the top and click Save key."

        if not self.context:
            return "Error: No specs loaded. Please check files first."

        messages = self._build_messages(question)
        max_retries = 3
        base_delay = 5

        client = anthropic.Anthropic(api_key=api_key)
        for attempt in range(max_retries):
            try:
                response = client.messages.create(
                    model=CHAT_MODEL,
                    max_tokens=4096,
                    messages=messages,
                )
                answer = response.content[0].text

                self.conversation_history.append({
                    "question": question,
                    "answer": answer
                })
                self._save_history()

                return answer
            except Exception as e:
                error_str = str(e)
                if "rate_limit" in error_str.lower() or "429" in error_str:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"Rate limit hit. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                else:
                    return f"Error answering question: {error_str}"

        return "Error: Rate limit exceeded after multiple retries. Please wait a minute and try again."

    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        if os.path.exists(self.history_file):
            os.remove(self.history_file)
