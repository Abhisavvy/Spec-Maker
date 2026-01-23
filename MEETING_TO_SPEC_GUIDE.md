# Meeting Data to Spec Guide

## Quick Start

Your dashboard extracts meeting data. To convert it into complete specs:

### Method 1: Use the Template (Recommended)

1. **Update your dashboard** to use the prompt template in `DASHBOARD_PROMPT_TEMPLATE.md`
2. **Extract complete data** with all required sections
3. **Paste into Spec Maker** with prefix: "Generate a complete spec based on this meeting data:"
4. **Generate** - The AI will create a production-ready spec

### Method 2: Auto-Enhance (Quick Fix)

1. **Extract your current format** (like your D0 Funnel example)
2. **Send to enhancement API**: `POST /api/enhance-meeting-data`
3. **Get back complete structure** with missing sections filled
4. **Use enhanced data** as input to Spec Maker

### Method 3: Direct Input (Current)

1. **Paste your meeting data** into Spec Maker
2. **Add context**: "Generate a complete spec based on this meeting data:"
3. **Generate** - AI will infer missing sections

## What's Missing from Your Current Format

Your D0 Funnel example has:
- ✅ Problem statements
- ✅ Vision and anti-vision
- ✅ Business and Design Goals
- ✅ Overview
- ✅ User Flow
- ✅ Sound requirement

Missing:
- ❌ **Opportunities** - Market/player opportunities
- ❌ **Expected Upsides** - Quantified benefits
- ❌ **UI Screens** - Individual screen specs
- ❌ **Edge Cases** - Error/edge scenarios
- ❌ **UI dev requirement** - Technical UI needs
- ❌ **Experimentation Plan** - Testing strategy
- ❌ **Tracking requirement** - Analytics/metrics
- ❌ **Analysis Plan** - How to measure success

## Enhancement API Usage

```bash
curl -X POST http://localhost:8000/api/enhance-meeting-data \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_data": "## D0 Funnel Opts\n## Problem statements\n..."
  }'
```

Returns:
```json
{
  "enhanced_data": "## D0 Funnel Opts\n## Problem statements\n...\n## Opportunities\n...\n## Expected Upsides\n..."
}
```

## Dashboard Integration

### Option A: Update Extraction Prompt

Use the prompt in `DASHBOARD_PROMPT_TEMPLATE.md` to extract all sections directly from meetings.

### Option B: Post-Process Enhancement

1. Extract meeting data in your current format
2. Call `/api/enhance-meeting-data` to fill gaps
3. Use enhanced data in Spec Maker

### Option C: Hybrid Approach

1. Extract what you can from meetings
2. Enhance with API for missing sections
3. Let Spec Maker refine and polish

## Example Workflow

```python
# In your dashboard
meeting_data = extract_from_meeting(transcript)

# Enhance if needed
enhanced = requests.post(
    "http://localhost:8000/api/enhance-meeting-data",
    json={"meeting_data": meeting_data}
).json()["enhanced_data"]

# Use in Spec Maker
spec_prompt = f"Generate a complete spec based on this meeting data:\n\n{enhanced}"
```

## Best Practices

1. **Extract Quantified Goals**: Always include metrics, percentages, timelines
2. **Include Context**: Add "why" not just "what"
3. **Mention Constraints**: Note what to avoid (anti-vision)
4. **Segment Thinking**: Consider different user types/cohorts
5. **Include Timelines**: When things happen, how long tests run

## Files Created

- `MEETING_DATA_TEMPLATE.md` - Complete structure template
- `DASHBOARD_PROMPT_TEMPLATE.md` - Prompt for your dashboard
- `backend/app/services/meeting_data_enhancer.py` - Auto-enhancement service
- `MEETING_TO_SPEC_GUIDE.md` - This guide

## Next Steps

1. **Review** `DASHBOARD_PROMPT_TEMPLATE.md` for the extraction prompt
2. **Test** the enhancement API with your D0 Funnel example
3. **Update** your dashboard to extract more complete data
4. **Generate** specs with full context

---

**Ready to use!** Your meeting data will now generate complete, production-ready specs. 🚀
