import os
import json
import google.generativeai as genai
from app.services.parser import DocumentParser
from typing import List, Dict

class SpecChatService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-2.5-flash for large context window (1M+ tokens)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
        
        # Cache context
        self.context = ""
        
        # Session-based conversation history (in-memory for now)
        # In production, you'd use session IDs and persistent storage
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
            # No truncation per document - rely on 1.5 Flash's large window
            context_parts.append(f"--- DOCUMENT: {doc['filename']} ---\n{doc['content']}")
            
        self.context = "\n\n".join(context_parts)
        print(f"Loaded {len(docs)} documents into context.")
        
        # Load conversation history
        self._load_history()

    def _load_history(self):
        """Load conversation history from file."""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    self.conversation_history = json.load(f)
            except:
                self.conversation_history = []

    def _save_history(self):
        """Save conversation history to file."""
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        # Keep only last 20 exchanges to avoid bloat
        history_to_save = self.conversation_history[-20:]
        with open(self.history_file, 'w') as f:
            json.dump(history_to_save, f, indent=2)

    def _format_history(self) -> str:
        """Format conversation history for the prompt."""
        if not self.conversation_history:
            return "No previous conversation."
        
        history_text = ""
        for entry in self.conversation_history[-10:]:  # Last 10 exchanges
            history_text += f"User: {entry['question']}\nAssistant: {entry['answer']}\n\n"
        return history_text

    def ask_question(self, question: str) -> str:
        """Answers a question based on the loaded context with conversation memory."""
        if not self.model:
            return "Error: API Key not set."
            
        if not self.context:
            return "Error: No specs loaded. Please check files first."

        conversation_context = self._format_history()
        
        # SAFETY CAP: 250k tokens ~ 1M chars. We cap at 600k chars to be safe and leave room for history/output.
        # This is 24x larger than the previous 25k limit.
        safe_context = self.context[:600000]
        if len(self.context) > 600000:
            print(f"WARNING: Context truncated from {len(self.context)} to 600,000 chars to fit Free Tier limits.")

        prompt = f"""
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
{conversation_context}

# USER QUESTION:
{question}
"""
        import time
        import random
        
        max_retries = 3
        base_delay = 5
        
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                answer = response.text
                
                # Save to history
                self.conversation_history.append({
                    "question": question,
                    "answer": answer
                })
                self._save_history()
                
                return answer
            except Exception as e:
                error_str = str(e)
                if "429" in error_str:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"Rate limit hit. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                else:
                    return f"Error answering question: {str(e)}"
        
        return "Error: Rate limit exceeded after multiple retries. Please wait a minute and try again."

    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        if os.path.exists(self.history_file):
            os.remove(self.history_file)
