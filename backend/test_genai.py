"""Test script for Claude API (spec generation)."""
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    print("Error: ANTHROPIC_API_KEY not set")
    exit(1)

client = anthropic.Anthropic(api_key=api_key)

print("Testing Claude API...")
try:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=256,
        messages=[{"role": "user", "content": "Hello, are you working? Reply in one short sentence."}],
    )
    text = response.content[0].text
    print(f"Success! Response: {text}")
except Exception as e:
    print(f"Error: {e}")
