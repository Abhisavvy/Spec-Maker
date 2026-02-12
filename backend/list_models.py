"""List Claude models available for use (documentation helper)."""
# Anthropic does not expose a list_models API; models are fixed.
# See: https://docs.anthropic.com/en/docs/build-with-claude/model-deprecations
print("Claude models used in this project:")
print("  - claude-sonnet-4-20250514 (spec generation, chat)")
print("  - claude-3-5-haiku-20241022 (QA analysis, fallback)")
print("Set ANTHROPIC_API_KEY in .env to use the API.")
