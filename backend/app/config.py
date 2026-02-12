"""Runtime config: API key can be set via UI (overrides env)."""
import os
from typing import Optional

_anthropic_api_key_override: Optional[str] = None


def get_anthropic_api_key() -> Optional[str]:
    """Return the API key to use: UI-set key if present, else env."""
    return _anthropic_api_key_override or os.environ.get("ANTHROPIC_API_KEY")


def set_anthropic_api_key(key: Optional[str]) -> None:
    """Set the API key from the UI. Pass None to clear."""
    global _anthropic_api_key_override
    _anthropic_api_key_override = (key or "").strip() or None
