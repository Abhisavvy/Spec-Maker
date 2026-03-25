"""
PM / dashboard consolidation via Anthropic Messages API.
Compatible with POST /api/consolidate { "prompt": "...", "provider": "claude" }.
"""
import os
from pathlib import Path
from typing import Optional

from anthropic import Anthropic
from dotenv import load_dotenv


def _api_key() -> Optional[str]:
    backend_dir = Path(__file__).resolve().parent.parent.parent
    load_dotenv(backend_dir / ".env")
    load_dotenv()
    return (os.environ.get("ANTHROPIC_API_KEY") or "").strip() or None


def run_consolidation(prompt: str, provider: Optional[str]) -> str:
    """
    Run consolidation. Only Anthropic is supported; provider 'claude' or 'anthropic' uses it.
    """
    p = (provider or "claude").strip().lower()
    if p not in ("claude", "anthropic"):
        raise ValueError(
            "Unsupported provider. This server uses the Anthropic API only; send provider 'claude'."
        )
    if not (prompt or "").strip():
        raise ValueError("prompt is required")
    key = _api_key()
    if not key:
        raise ValueError("ANTHROPIC_API_KEY is not set")

    client = Anthropic(api_key=key, timeout=300.0, max_retries=2)
    models = ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022"]
    last_error: Optional[Exception] = None
    for model in models:
        try:
            response = client.messages.create(
                model=model,
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        except Exception as e:
            last_error = e
            continue
    assert last_error is not None
    raise last_error
