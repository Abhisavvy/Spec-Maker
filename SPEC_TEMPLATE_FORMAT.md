# Spec Template Format and Structure

## Overview
This document describes the complete format and structure used to create game design specifications (specs) in the Spec Maker system.

---

## PowerPoint Template Structure

### Location
- **File**: `data/slides/Spec Template.pptx`
- **Purpose**: Defines the visual format, layout, and structure of generated specs

### Template Slides (16 slides total)

#### Fixed Slides (Index-based matching):

1. **Slide 0**: Title Slide
   - Title: `<Add spec name here>`
   - Contains: Spec name and basic info

2. **Slide 1**: Index
   - Title: `Index`
   - Contains: Table of contents/overview

3. **Slide 2**: Problem Statements
   - Title: `Problem Statements`
   - Contains: Problems this spec addresses

4. **Slide 3**: Vision and Anti-vision
   - Title: `Vision` and `Anti-vision` (split sections)
   - Contains: 
     - Vision: What we want to achieve
     - Anti-vision: What we want to avoid

5. **Slide 4**: Business and Design Goals
   - Title: (No title, but contains "Business Goals" placeholder)
   - Contains: Business objectives and design goals

6. **Slide 5**: Opportunity Identified
   - Title: `Opportunity Identified`
   - Contains: Opportunities this spec addresses

7. **Slide 6**: Expected Upsides
   - Title: `Expected Upsides`
   - Contains: Expected positive outcomes

8. **Slide 7**: Overview
   - Title: `Overview`
   - Contains: High-level overview of the spec

9. **Slide 8**: UI Master Slide (Template for cloning)
   - Title: `<Screen Name> UI`
   - **This slide is cloned for each UI screen**
   - Placeholders:
     - Header
     - Sub text
     - CTA (Call-to-Action)
     - CTA functionality
     - Surfacing conditions
     - Popup Priority
     - Mockup image

10. **Slide 9**: Flow Master Slide (Template for cloning)
    - Title: `<Flow name> Flow`
    - **This slide is cloned for each user flow**
    - Placeholders:
      - Description
      - Mockup image

11. **Slide 10**: Edge Cases
    - Title: `Edge Cases`
    - Contains: Edge cases and error scenarios

12. **Slide 11**: UI Dev Requirement
    - Title: `UI dev requirement`
    - Contains: UI development requirements and links

13. **Slide 12**: Sound Requirement
    - Title: `Sound requirement`
    - Contains: Sound/audio requirements and links

14. **Slide 13**: Experimentation Plan
    - Title: `Experimentation Plan`
    - Contains: A/B tests and experiments

15. **Slide 14**: Tracking Requirement
    - Title: `Tracking requirement`
    - Contains: Analytics and tracking requirements

16. **Slide 15**: Analysis Plan
    - Title: `Analysis Plan`
    - Contains: How to analyze results

---

## Markdown Generation Format

The system generates specs in Markdown format first, then converts to PowerPoint. Here's the required structure:

### Required Section Headers (Use `##` for main sections)

1. **Title Slide**: `<Add spec name here>`
   - The name of the spec

2. **Problem statements**
   - List of problems this spec addresses
   - Format: Bullet points with hyphens (-)

3. **Vision and anti-vision**
   - Split into two subsections:
     ```
     Vision
     - Point 1
     - Point 2
     
     Anti-vision
     - Point 1
     - Point 2
     ```

4. **Business and Design Goals**
   - Business objectives
   - Design goals
   - Format: Bullet points

5. **Opportunities**
   - Opportunities identified
   - Format: Bullet points

6. **Expected Upsides**
   - Expected positive outcomes
   - Format: Bullet points

7. **Overview**
   - High-level overview
   - Format: Bullet points or paragraphs

8. **UI Slides** (Dynamic - one per screen)
   - Format: `## <Screen Name> UI`
   - **Special Key-Value Format**:
     ```
     Header: [header text]
     Sub text: [sub text]
     CTA: [call-to-action text]
     CTA functionality: [what the CTA does]
     Surfacing conditions: [when this screen appears]
     Popup Priority: [priority level]
     Mockup: {{FIGMA_IMAGE:FRAME_ID}}
     ```
   - **Note**: No bolding, just plain text with colons

9. **Flow Slides** (Dynamic - one per flow)
   - Format: `## <Flow name> Flow`
   - **Special Format**:
     ```
     Description: [step-by-step flow description]
     Mockup: {{FIGMA_IMAGE:FRAME_ID}}
     ```

10. **Edge Cases**
    - Edge cases and error scenarios
    - Format: Bullet points

11. **UI dev requirement**
    - UI development requirements
    - May include links

12. **Sound requirement**
    - Sound/audio requirements
    - May include links

13. **Experimentation Plan**
    - A/B tests and experiments
    - Format: Structured with experiment details

14. **Tracking requirement**
    - Analytics and tracking requirements
    - Format: Bullet points or structured list

15. **Analysis Plan**
    - How to analyze results
    - Format: Structured plan

16. **Changelog** (Optional)
    - Version history and changes

---

## Formatting Rules

### General Rules
- **No bolding**: Do NOT use markdown `**` or HTML `<b>` tags
- **Plain text only**: All text should be plain, no formatting
- **Bullet points**: Use hyphens (-) for lists
- **Headings**: Use `##` for main sections
- **Line breaks**: Use strategically for readability

### Writing Style
- **Be specific and concrete**: Avoid vague or abstract language
- **Player-centric**: Use language focused on player experience
- **Actionable**: Each point should be clear and actionable
- **Concise**: Avoid fluff, filler words, and long explanations
- **Anticipate questions**: Think about what developers and QA will ask

### Special Formatting

#### UI Slides
- Must use Key: Value format
- Keys: Header, Sub text, CTA, CTA functionality, Surfacing conditions, Popup Priority, Mockup
- Values: Plain text descriptions
- Mockup: Use `{{FIGMA_IMAGE:FRAME_ID}}` for Figma images

#### Flow Slides
- Description: Step-by-step flow in plain text
- Mockup: Use `{{FIGMA_IMAGE:FRAME_ID}}` for Figma images

#### Vision/Goals
- Split into "Vision" and "Anti-vision" subsections
- Use bullet points under each

---

## Figma Integration

### Image Placeholders
- Format: `{{FIGMA_IMAGE:FRAME_ID}}`
- The system replaces these with actual Figma images
- Frame IDs come from the Figma file structure

### Figma Data Usage
1. **Identifying Screens**: Each Top-Level Frame = UI Screen
2. **Extracting Content**: Use `text_content` for Header, Sub text, CTA
3. **Understanding Flows**: Use `transitions` to describe flows
4. **Using Images**: Reference Frame IDs from "AVAILABLE MOCKUPS" list

---

## Content Sources

The spec generation uses these sources for context:

1. **Existing GDDs**: All PDFs in `data/gdds/` (currently 14 files)
2. **Existing Slides**: All PPTX files in `data/slides/` (template + any others)
3. **Edge Cases**: Excel file in `data/edge_cases/`
4. **User Context**: Uploaded files in `data/context_uploads/`
5. **Figma Data**: If Figma token/URL provided

---

## Template Matching Logic

The system matches generated markdown sections to PowerPoint slides:

1. **Exact Title Match**: Matches section headers to slide titles (case-insensitive)
2. **Keyword Matching**: Uses keywords like "problem statements", "vision", "opportunities"
3. **Master Slide Cloning**: 
   - UI sections → Clone Slide 8 (UI Master)
   - Flow sections → Clone Slide 9 (Flow Master)
4. **Content Filling**: Fills placeholders with generated content

---

## Example Structure

```
## Battle Pass Feature

## Problem statements
- Players need more engagement
- Retention is declining
- Need new monetization opportunities

## Vision and anti-vision
Vision
- Engaging progression system
- Rewards player loyalty

Anti-vision
- Pay-to-win mechanics
- Grindy requirements

## Business and Design Goals
- Increase daily active users by 20%
- Improve retention by 15%
- Create new revenue stream

## Opportunities
- Seasonal content updates
- Cross-promotion opportunities

## Expected Upsides
- Higher player engagement
- Increased revenue
- Better retention metrics

## Overview
The Battle Pass feature provides a tiered reward system...

## Battle Pass Screen UI
Header: Battle Pass
Sub text: View your progress and rewards
CTA: Claim Rewards
CTA functionality: Opens reward claim screen
Surfacing conditions: Player has unclaimed rewards
Popup Priority: High
Mockup: {{FIGMA_IMAGE:BP_SCREEN}}

## Battle Pass Purchase Flow
Description: Player clicks purchase, sees confirmation, completes payment, receives rewards
Mockup: {{FIGMA_IMAGE:BP_PURCHASE}}

## Edge Cases
- Player has no internet connection
- Payment fails mid-transaction
- Player reaches max tier

## UI dev requirement
- Implement tier progression animation
- Add reward claim animations
- Link: [Jira Ticket #123]

## Sound requirement
- Tier unlock sound effect
- Reward claim sound
- Link: [Audio Asset Library]

## Experimentation Plan
Experiment: Battle Pass Price Test
- Variant A: $9.99
- Variant B: $14.99
- Metric: Conversion rate

## Tracking requirement
- Track tier progression
- Track reward claims
- Track purchase conversions

## Analysis Plan
- Compare engagement metrics pre/post launch
- Analyze conversion rates by variant
- Review retention impact
```

---

## Notes

- The template's visual design (colors, fonts, layout) is preserved in generated specs
- Slide titles are matched case-insensitively
- Master slides allow dynamic generation of multiple UI screens and flows
- The system works without a template but having one ensures consistency
- All HTML tags are removed from the final markdown output for clean display
