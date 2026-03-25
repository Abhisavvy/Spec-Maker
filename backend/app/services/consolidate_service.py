"""
PM / dashboard consolidation via Anthropic Messages API.
Compatible with POST /api/consolidate { "prompt": "...", "provider": "claude" }.
"""
from typing import Optional

from anthropic import Anthropic

from app.config import get_anthropic_api_key

# Keep in sync with app.services.generator default / fallback models
_PRIMARY = "claude-sonnet-4-20250514"
_FALLBACK = "claude-3-5-haiku-20241022"


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
    key = get_anthropic_api_key()
    if not key:
        raise ValueError(
            "Anthropic API key is not set. Add ANTHROPIC_API_KEY to .env or enter the key in the app and Save."
        )

    client = Anthropic(api_key=key, timeout=300.0, max_retries=2)
    models = [_PRIMARY, _FALLBACK]
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
