# Dashboard Prompt Template for Spec Maker

## Quick Copy-Paste Prompt

Use this prompt in your dashboard/meeting extraction tool to generate complete spec-ready data:

```
Extract and structure the following information from this meeting/transcript. Format as markdown with the exact section headers shown below:

## <Feature/Spec Name>

## Problem statements
[List each problem as a bullet point]
- Problem 1: [Description]
- Problem 2: [Description]

## Vision and anti-vision
Vision
- [What success looks like - point 1]
- [What success looks like - point 2]

Anti-vision
- [What to avoid - point 1]
- [What to avoid - point 2]

## Business and Design Goals
- [Primary goal with metric: e.g., "D1 retention increase by X% within 4 weeks"]
- [Secondary goal: e.g., "Higher D0 funnel completion rate"]
- [Design goal: e.g., "Feel fair, readable, and motivating"]

## Opportunities
- [Market/player opportunity 1]
- [Technical/design opportunity 2]
- [Data/experimentation opportunity 3]

## Expected Upsides
- [Expected benefit 1 with impact range: e.g., "1-2%+ retention improvement"]
- [Expected benefit 2: e.g., "Increased session depth"]
- [Expected benefit 3: e.g., "Improved LTV per new player"]

## Overview
[2-3 sentence overview of what this feature/initiative is about and why it matters]

## <Screen Name> UI
Header: [Screen header text]
Sub text: [Sub text or description]
CTA: [Call-to-action button text]
CTA functionality: [What happens when clicked]
Surfacing conditions: [When/where this appears]
Popup Priority: [High/Medium/Low]
Mockup: {{FIGMA_IMAGE:FRAME_ID}}

## <Flow Name> Flow
Description: [Step-by-step flow]
- Step 1: [Action]
- Step 2: [Action]
- Step 3: [Action]
Mockup: {{FIGMA_IMAGE:FRAME_ID}}

## Edge Cases
- [Edge case 1: What happens if X?]
- [Edge case 2: What happens when Y?]
- [Edge case 3: Handling of Z scenario]

## UI dev requirement
- [UI requirement 1: Technical detail]
- [UI requirement 2: Animation/transition]
- [UI requirement 3: Responsive/accessibility]

## Sound requirement
- [Sound/SFX requirement 1]
- [Sound/SFX requirement 2]

## Experimentation Plan
- [Experiment 1: Hypothesis, test design, success criteria]
- Timeline: [Duration, when to run]
- Segmentation: [How to segment analysis]

## Tracking requirement
- [Metric 1: What to track, event name, when to fire]
- [Metric 2: Conversion funnel tracking]
- [Metric 3: User behavior events]

## Analysis Plan
- [Analysis approach: How to measure success]
- Statistical requirements: [p-value, sample size]
- Timeline: [When to analyze, reporting cadence]
- Cohort analysis: [Segmentation approach]

## Changelog
- Initial spec creation
```

## Extraction Guidelines

### For Each Section:

**Problem statements:**
- Extract pain points, issues, or challenges mentioned
- Focus on user/player problems, not just technical issues
- Include context about who is affected

**Vision and Anti-vision:**
- Vision: Extract positive outcomes, success criteria, desired states
- Anti-vision: Extract risks, things to avoid, negative outcomes to prevent

**Business and Design Goals:**
- Business: Quantifiable metrics (retention %, LTV, engagement)
- Design: User experience goals, feel, quality criteria
- Include timelines and success thresholds

**Opportunities:**
- Market opportunities (player needs, market gaps)
- Technical opportunities (new capabilities, optimizations)
- Data opportunities (experimentation, insights)

**Expected Upsides:**
- Quantified benefits with ranges (e.g., "1-2%+ improvement")
- Include both primary and secondary benefits
- Reference similar successful features if mentioned

**Overview:**
- 2-3 sentence summary
- What the feature is
- Why it matters
- High-level approach

**UI Screens:**
- Extract any screens, popups, modals discussed
- Include: header, subtext, CTA, when it appears
- Note any priority or importance

**Flows:**
- Step-by-step user journeys
- Decision points and branches
- Outcomes at each step

**Edge Cases:**
- Error scenarios
- Unusual user behaviors
- Boundary conditions
- "What if" situations

**UI Dev Requirements:**
- Technical implementation details
- Animations, transitions
- Responsive design needs
- Accessibility requirements

**Sound Requirements:**
- New SFX needed
- Reuse existing sounds
- Audio timing/triggers

**Experimentation Plan:**
- A/B test designs
- Hypotheses
- Success criteria
- Timeline and duration

**Tracking Requirements:**
- Specific metrics to track
- Event names and parameters
- When events fire
- Funnel tracking needs

**Analysis Plan:**
- Statistical approach
- Success thresholds
- Segmentation strategy
- Reporting cadence

## Example Output

Based on your D0 Funnel example, here's what a complete extraction would look like:

```markdown
## D0 Funnel Opts

## Problem statements
- The core problem is that the D0 funnel is not optimally converting new players into engaged day 1+ users, with unclear impact of bot score, content, and time-in-level on retention. This affects new Roll players in the D0 experience, leading to suboptimal retention, weaker engagement, and an under-monetized early funnel.

## Vision and anti-vision
Vision
- Existing D0 content experiments have shown impact, and prior "trip" / Game of Rolls tests indicate more upside if bot score, content, and timing are tuned together.
- Opportunity for uplift in D0→D1 retention, session depth, and LTV (1–2%+ range including ads).

Anti-vision
- Avoid over-optimizing bot score in ways that break perceived fairness or feel rigged.
- Avoid making D0 longer/heavier for all players without segment awareness (fast versus slow deciders).
- Avoid overfitting to a narrow cohort (e.g., ad-only players) without understanding organic behavior.

## Business and Design Goals
- D1 retention for new players should increase by X% (TBD from baseline) within 4 weeks of rollout.
- Primary success: Statistically significant increase in D1 retention for new players by X% within 4 weeks.
- Secondary criteria: Higher D0 funnel completion rate (games 1–3), increased next-day engagement rate post-D0, longer average session length on D0, improved Ad LTV per new player.
- Qualitative: Early games should feel fair, readable, and motivating, with clear momentum into games 2 and 3, without major hit to early drop-off.

## Opportunities
- Opportunity to optimize bot score, content, and timing together for maximum impact (prior tests show potential).
- Opportunity to segment players (fast vs slow deciders) for personalized D0 experience.
- Opportunity to improve early funnel monetization through better engagement.

## Expected Upsides
- D0→D1 retention improvement: 1–2%+ range (including ads).
- Increased session depth on D0.
- Improved LTV per new player (1–2%+ range including ads).
- Better early game momentum and engagement.

## Overview
Improving D0 funnel for onboarding players by tuning bot score, content, and timing together. An uplift in D0→D1 retention, session depth, and LTV (1–2%+ range including ads) is anticipated, building on existing content experiments and prior "trip" tests.

## D0 Game Flow
Description: Players install/open Roll and begin their first game (D0). They encounter initial content and bot behavior tuned for D0, free from IP/ad interruptions up to the first 2–3 games. Players progress through early games, making decisions in approximately 6.5s or 15s+ buckets. They receive game outcomes, messaging, and guidance encouraging progression. Upon reaching the end of D0, they get a sense of progression. Engaged players return the next day and beyond, influenced by their D0 experience.
Mockup: {{FIGMA_IMAGE:FRAME_ID}}

## Edge Cases
- What if player makes decisions very quickly (< 6.5s)? Handle fast deciders.
- What if player takes very long (> 15s)? Handle slow deciders.
- What if player drops off during first game? Track and analyze early drop-off.
- What if bot score feels unfair? Ensure perceived fairness is maintained.
- What if player is from ad vs organic? Segment analysis needed.

## UI dev requirement
- Support decision time buckets (6.5s vs 15s+).
- Implement bot score tuning without breaking perceived fairness.
- Ensure no IP/ad interruptions in first 2-3 games.
- Track progression messaging and guidance.

## Sound requirement
- Maintain existing SFX; no new bespoke audio is required for V1 unless easy wins are identified.

## Experimentation Plan
- A/B test: Control (current D0) vs Treatment (optimized bot score + content + timing).
- Hypothesis: Optimized D0 funnel will improve D1 retention by X% (TBD).
- Success criteria: Statistically significant increase in D1 retention within 4 weeks.
- Timeline: 4 weeks minimum for statistical significance.
- Segmentation: Analyze by player segment (fast vs slow deciders), acquisition source (ad vs organic).

## Tracking requirement
- Track D1 retention rate for new players (primary metric).
- Track D0 funnel completion rate (games 1-3).
- Track next-day engagement rate post-D0.
- Track average session length on D0.
- Track Ad LTV per new player.
- Track decision time buckets (6.5s vs 15s+).
- Track early drop-off points.

## Analysis Plan
- Compare treatment vs control on D1 retention (primary metric).
- Statistical significance: p < 0.05, minimum sample size TBD.
- Cohort analysis: Segment by player type (fast vs slow deciders), acquisition source (ad vs organic).
- Timeline: Analyze after 4 weeks, with interim checks at 1-2 weeks.
- Reporting: Weekly updates, final analysis report with statistical validation.

## Changelog
- Initial spec creation
```

## Integration with Spec Maker

Once you have the enhanced meeting data:

1. **Option 1: Direct Input**
   - Copy the enhanced meeting data
   - Paste into Spec Maker's prompt field
   - Add: "Generate a complete spec based on this meeting data:"
   - Click Generate

2. **Option 2: Use Enhancement API** (coming soon)
   - Send your meeting data to `/api/enhance-meeting-data`
   - Get back complete spec structure
   - Use that as input to Spec Maker

3. **Option 3: Auto-Enhance**
   - The Spec Maker will automatically detect missing sections
   - It will generate reasonable defaults
   - You can refine after generation

## Tips for Best Results

1. **Be Specific**: Include numbers, percentages, timelines
2. **Include Context**: Add "why" not just "what"
3. **Mention Constraints**: Note what to avoid (anti-vision)
4. **Quantify Goals**: Use metrics, not just descriptions
5. **Include Timelines**: When things happen, how long tests run
6. **Segment Thinking**: Consider different user types/cohorts
