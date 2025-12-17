# PowerPoint Template for Spec Maker

## Overview
This folder should contain a PowerPoint template file (`Spec Template.pptx`) that defines the format, structure, and flow of the generated specifications.

## Required Template File
- **Filename**: `Spec Template.pptx`
- **Location**: `data/slides/Spec Template.pptx`

## Template Structure

The template PowerPoint should have slides with the following structure and titles (in order):

### Required Slides (by index):

1. **Slide 0**: Title slide (can be blank or have a title placeholder)
2. **Slide 1**: (Reserved - can be blank or intro slide)
3. **Slide 2**: **"Problem statements"** - For problem statements content
4. **Slide 3**: **"Vision and anti-vision"** or **"Vision"** - For vision and anti-vision content
5. **Slide 4**: **"Business and Design Goals"** or **"Business Goals"** or **"Design Goals"** - For goals content
6. **Slide 5**: **"Opportunities"** or **"Opportunity identified"** - For opportunities content
7. **Slide 6**: **"Expected Upsides"** - For expected upsides content
8. **Slide 7**: **"Overview"** - For overview content
9. **Slide 8-9**: (Reserved for UI/Flow master slides or other content)
10. **Slide 10**: **"Edge Cases"** - For edge cases content
11. **Slide 11**: **"UI dev requirement"** - For UI development requirements
12. **Slide 12**: **"Sound requirement"** - For sound requirements
13. **Slide 13**: **"Experimentation Plan"** - For experimentation plans
14. **Slide 14**: **"Tracking requirement"** - For tracking requirements
15. **Slide 15**: **"Analysis Plan"** - For analysis plans

### Master Slides (Required)

The template should also include **master slides** that will be cloned for dynamic content:

1. **UI Master Slide**: 
   - Title should contain: `"<Screen Name>"` or `" UI"` (e.g., "Login Screen UI" or "Home Screen UI")
   - This slide will be cloned for each UI screen in the spec
   - Should have placeholders for: Header, Sub text, CTA, CTA functionality, Surfacing conditions, Popup Priority, Mockup

2. **Flow Master Slide**:
   - Title should contain: `"<Flow Name>"` or `" Flow"` (e.g., "Login Flow" or "Purchase Flow")
   - This slide will be cloned for each user flow in the spec
   - Should have placeholders for: Description, Mockup

## How It Works

1. **Template Matching**: The system matches generated content headers to template slide titles (case-insensitive)
2. **Content Filling**: When a match is found, the system fills the corresponding template slide with the generated content
3. **Master Cloning**: For UI and Flow slides, the system clones the master slides and fills them with specific screen/flow information
4. **Format Preservation**: The template's formatting, layout, and styling are preserved in the generated presentation

## Creating Your Template

1. Create a new PowerPoint presentation
2. Add slides with the exact titles listed above (matching is case-insensitive)
3. Design the layout, formatting, and styling for each slide type
4. Create master slides for UI and Flow slides
5. Save as `Spec Template.pptx` in this folder

## Example Template Structure

```
Slide 0: [Title Slide]
Slide 1: [Introduction/Blank]
Slide 2: Problem statements
  - Content area for problem statements
Slide 3: Vision and anti-vision
  - Vision section
  - Anti-vision section
Slide 4: Business and Design Goals
  - Business goals
  - Design goals
Slide 5: Opportunities
  - Content area for opportunities
Slide 6: Expected Upsides
  - Content area for expected upsides
Slide 7: Overview
  - Content area for overview
Slide 8: <Screen Name> UI (MASTER - will be cloned)
  - Header placeholder
  - Sub text placeholder
  - CTA placeholder
  - CTA functionality placeholder
  - Surfacing conditions placeholder
  - Popup Priority placeholder
  - Mockup image placeholder
Slide 9: <Flow Name> Flow (MASTER - will be cloned)
  - Description placeholder
  - Mockup image placeholder
Slide 10: Edge Cases
  - Content area for edge cases
Slide 11: UI dev requirement
  - Content area for UI dev requirements
Slide 12: Sound requirement
  - Content area for sound requirements
Slide 13: Experimentation Plan
  - Content area for experimentation plan
Slide 14: Tracking requirement
  - Content area for tracking requirements
Slide 15: Analysis Plan
  - Content area for analysis plan
```

## Notes

- The system will work without a template (creating a new presentation), but having a template ensures consistent formatting and structure
- Slide titles are matched case-insensitively
- The template's design, colors, fonts, and layout will be preserved in generated specs
- Master slides allow for dynamic generation of multiple UI screens and flows
