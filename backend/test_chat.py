from app.services.chat_service import SpecChatService
from dotenv import load_dotenv
import os

# Load env vars
load_dotenv()

def test_chat():
    print("--- Testing Chat Service ---")
    chat_service = SpecChatService()
    
    # Mock context loading (since we don't want to parse all files)
    # We'll inject some fake context for testing
    chat_service.context = """
    --- DOCUMENT: Economy Design.pdf ---
    Daily Login Rewards:
    Day 1: 100 Coins
    Day 2: 200 Coins
    Day 3: 300 Coins
    Day 7: 1000 Coins + Premium Chest
    
    --- DOCUMENT: Retention Specs.docx ---
    Goal: Increase D7 retention by 5%.
    Strategy: Use push notifications for daily rewards.
    """
    
    question = "How can we improve the daily login rewards to boost retention?"
    print(f"Question: {question}\n")
    
    answer = chat_service.ask_question(question)
    print(f"Answer:\n{answer}")

if __name__ == "__main__":
    test_chat()
