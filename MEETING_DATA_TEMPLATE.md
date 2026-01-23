# Meeting Data to Spec Template

## Overview

This template helps you structure meeting data so the Spec Maker can generate complete, production-ready specs.

## Required Structure

Your dashboard should extract and format meeting data in this structure:

```markdown
## <Spec Name>

## Problem statements
- [Problem 1 description]
- [Problem 2 description]

## Vision and anti-vision
Vision
- [Vision point 1]
- [Vision point 2]

Anti-vision
- [What to avoid point 1]
- [What to avoid point 2]

## Business and Design Goals
- [Primary goal with metric and timeline]
- [Secondary goal with metric and timeline]

## Opportunities
- [Opportunity 1: Description of the opportunity and why it matters]
- [Opportunity 2: Market/player/technical opportunity]

## Expected Upsides
- [Expected benefit 1 with potential impact range]
- [Expected benefit 2 with potential impact range]
- [Expected benefit 3: Retention/LTV/Engagement improvements]

## Overview
[2-3 sentence overview of the feature/spec]

[Additional context about what this feature does and why it's important]

## <Screen Name> UI
Header: [Screen header text]
Sub text: [Sub text or description]
CTA: [Call-to-action button text]
CTA functionality: [What happens when CTA is clicked]
Surfacing conditions: [When/where this screen appears]
Popup Priority: [High/Medium/Low]
Mockup: {{FIGMA_IMAGE:FRAME_ID}}

## <Flow Name> Flow
Description: [Step-by-step flow description]
- Step 1: [Action]
- Step 2: [Action]
- Step 3: [Action]
Mockup: {{FIGMA_IMAGE:FRAME_ID}}

## Edge Cases
- [Edge case 1: What happens if X occurs?]
- [Edge case 2: What happens when Y happens?]
- [Edge case 3: Handling of Z scenario]

## UI dev requirement
- [UI requirement 1: Specific technical requirement]
- [UI requirement 2: Animation/transition requirement]
- [UI requirement 3: Responsive/accessibility requirement]

## Sound requirement
- [Sound requirement 1]
- [Sound requirement 2: New SFX needed or reuse existing]

## Experimentation Plan
- [Experiment 1: Hypothesis, test design, success criteria]
- [Experiment 2: A/B test or multivariate test details]
- Timeline: [When experiments run, duration]

## Tracking requirement
- [Metric 1: What to track and why]
- [Metric 2: Event name, parameters, when to fire]
- [Metric 3: Conversion funnel tracking]

## Analysis Plan
- [Analysis 1: How to measure success, baseline comparison]
- [Analysis 2: Cohort analysis, segmentation approach]
- [Analysis 3: Statistical significance requirements]
- Timeline: [When to analyze, reporting cadence]
```

## Your Current Format vs. Required Format

### ✅ What You Already Have
- Problem statements
- Vision and anti-vision
- Business and Design Goals
- Overview
- User Flow (needs formatting adjustment)
- Sound requirement

### ❌ What's Missing
- **Opportunities** - Market/player opportunities
- **Expected Upsides** - Quantified benefits
- **UI Screens** - Individual screen specifications
- **Edge Cases** - Error/edge scenarios
- **UI dev requirement** - Technical UI requirements
- **Experimentation Plan** - Testing strategy
- **Tracking requirement** - Analytics/metrics
- **Analysis Plan** - How to measure success

## Dashboard Prompt Template

Use this prompt in your dashboard to extract complete meeting data:

```
Extract the following information from this meeting transcript/notes and format it as a structured spec document:

1. SPEC NAME: [Feature/initiative name]

2. PROBLEM STATEMENTS: Extract all problems, pain points, or issues discussed. Format as bullet points.

3. VISION: Extract what success looks like, desired outcomes, positive goals.

4. ANTI-VISION: Extract what to avoid, risks, things that shouldn't happen.

5. BUSINESS GOALS: Extract quantifiable business objectives (metrics, targets, timelines).

6. DESIGN GOALS: Extract user experience, design, and product goals.

7. OPPORTUNITIES: Identify market opportunities, player needs, or technical opportunities mentioned.

8. EXPECTED UPSIDES: Extract expected benefits, improvements, or positive impacts (with ranges if mentioned).

9. OVERVIEW: Create a 2-3 sentence summary of what this feature/initiative is about.

10. USER FLOWS: Extract any user journeys, flows, or step-by-step processes mentioned. Format as:
   - Flow Name: [Description with steps]

11. UI SCREENS: If any screens, popups, or UI elements are discussed, extract:
   - Screen Name: [Description, header, CTA, when it appears]

12. EDGE CASES: Extract any edge cases, error scenarios, or "what if" situations discussed.

13. UI DEV REQUIREMENTS: Extract any technical UI requirements, animations, or implementation details.

14. SOUND REQUIREMENTS: Extract any audio/SFX requirements mentioned.

15. EXPERIMENTATION PLAN: Extract any testing plans, A/B tests, or experimentation strategies.

16. TRACKING REQUIREMENTS: Extract any metrics, analytics, or tracking needs mentioned.

17. ANALYSIS PLAN: Extract how success will be measured, analysis approaches, or reporting plans.

Format the output using the markdown structure provided.
```

## Auto-Enhancement Script

I'll create a script that can automatically enhance your meeting data format to include missing sections.
