# Full Context System

## Overview

The Spec Maker now analyzes **ALL existing specs** to provide comprehensive context when generating new specs. This ensures:

1. **Consistency** - New specs match the style and terminology of existing specs
2. **Conflict Detection** - Warns about potential overlaps with existing features
3. **Knowledge Leverage** - Uses patterns and understanding from all previous specs
4. **Quality** - Maintains the same high quality across all specs

## How It Works

### 1. **Context Analysis** (Automatic)

When you click "Generate Spec", the system:

- Analyzes all existing GDDs and Slides
- Extracts features, terminology, patterns, and UI elements
- Builds a comprehensive knowledge base
- Caches results for performance (refreshed when files change)

### 2. **Conflict Detection**

The system checks your new spec request against existing features:

- Compares keywords and concepts
- Identifies potential overlaps
- Displays warnings before generation
- AI addresses conflicts in the generated spec

### 3. **Intelligent Context Selection**

Instead of sending ALL specs to the AI (expensive), the system:

- Identifies the most relevant existing features for your request
- Includes established terminology and patterns
- Provides style examples from similar specs
- Keeps token usage efficient while maintaining quality

### 4. **Generation with Full Knowledge**

The AI generates your spec with:

- Complete awareness of all {total_specs} existing specs
- Understanding of established terminology
- Knowledge of existing features and systems
- Ability to reference and integrate with existing work

## What You'll See

### ✓ Context Loaded
```
Analyzed 53 existing specs with 247 features for full context.
```

### ⚠️ Potential Conflicts Detected
```
⚠️ Potential overlap with existing feature: 'Daily Rewards' from daily_rewards_spec.pdf
⚠️ Potential overlap with existing feature: 'Login Bonus' from login_system.pptx
```

The AI will review these and either:
- Clarify how the new spec differs
- Explain integration with existing systems
- Note modifications needed to existing features

## Benefits

### For You
- **No manual checking** - System automatically finds conflicts
- **Consistent quality** - All specs follow the same patterns
- **Faster iterations** - AI understands your game's context
- **Better specs** - Leverages knowledge from all previous work

### For Your Team
- **Reduced conflicts** - Fewer overlapping features
- **Clear integration** - New features reference existing systems
- **Consistent terminology** - Everyone speaks the same language
- **Complete picture** - Each spec aware of the full game design

## Performance

- **First Analysis**: ~5-10 seconds (analyzes all specs)
- **Cached Lookups**: <1 second (uses cached analysis)
- **Auto-Refresh**: When new specs are added to `data/gdds/` or `data/slides/`

## Manual Cache Refresh

If you want to force a refresh of the context analysis:

```bash
curl -X POST http://localhost:8000/api/refresh-context
```

Or add a button in the UI to call this endpoint.

## Technical Details

### What Gets Analyzed

From each spec:
- **Features**: All section headers and their context
- **Terminology**: Game-specific terms and their frequency
- **Patterns**: Common structures (UI patterns, flows, sections)
- **UI Elements**: Buttons, screens, popups, etc.
- **Flows**: User journeys and interactions
- **Style**: Writing patterns and common phrases

### Storage

Analysis is cached in:
```
data/context_cache/analyzed_context.json
```

This file contains:
- Feature index
- Terminology dictionary
- Pattern library
- Style guide
- Statistics

### Token Optimization

The system is smart about token usage:
- Analyzes ALL specs locally (no API calls)
- Sends only relevant context to AI
- Uses semantic matching to find related features
- Limits context to most important information

## Example Output

When generating a "Daily Login Rewards" spec, the system might detect:

**Conflicts:**
- Existing "Daily Rewards" feature
- Existing "Login Bonus" system

**Relevant Context:**
- 15 features related to rewards
- Established terms: "daily reset", "streak", "claim"
- 8 UI patterns for reward screens
- 3 similar flows from other specs

**Result:**
The AI generates a spec that:
- Uses consistent "daily reset" terminology
- References the existing reward system
- Follows established UI patterns
- Integrates with login bonus logic
- Maintains the same writing style

## Best Practices

1. **Keep specs organized** - All specs in `data/gdds/` and `data/slides/`
2. **Use consistent naming** - Helps conflict detection
3. **Review conflicts** - Check warnings before generating
4. **Update regularly** - Add new specs to folders as you create them
5. **Trust the system** - The AI has full context of your game

## Troubleshooting

### "No context loaded"
- Check that files exist in `data/gdds/` and `data/slides/`
- Ensure files are readable (not corrupted)
- Try manual refresh: `POST /api/refresh-context`

### "Analysis taking too long"
- Normal for first run with many specs
- Subsequent runs use cached analysis
- Cache is automatically refreshed when files change

### "Conflicts not detected"
- Conflict detection uses keyword matching
- Very different terminology may not match
- System errs on the side of caution (fewer false positives)

## Future Enhancements

Planned improvements:
- Semantic similarity (better than keyword matching)
- Visual conflict graph
- Automatic spec merging suggestions
- Cross-reference links in generated specs
- Version tracking and change detection
