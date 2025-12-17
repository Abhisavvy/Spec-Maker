# Figma File Structure Guide for Spec Maker

## Overview
This guide explains how to structure and name your Figma files so the Spec Maker system can properly identify UI changes, flows, new screens, and popups.

---

## Core Principles

### 1. **Top-Level Frames = UI Screens**
- Each **top-level FRAME** on a page is treated as a separate UI Screen
- The frame name becomes the screen name in the spec
- Nested frames are treated as components within the screen

### 2. **Prototype Connections = Flows**
- **Transitions** between frames (using Figma's prototype feature) define user flows
- The system follows these connections to understand navigation paths

### 3. **Frame Names = Screen Identifiers**
- Frame names are used directly as screen names in the spec
- Use clear, descriptive names

---

## Naming Conventions

### Screen Frames (Top-Level Frames)

#### ✅ **Good Naming Examples:**
```
Login Screen
Home Screen
Profile Screen
Battle Pass Screen
Settings Screen
Shop Screen
```

#### ✅ **For New Screens:**
```
[New] Leaderboard Screen
[New] Tournament Screen
[New] Social Hub Screen
```

#### ✅ **For UI Changes/Updates:**
```
Home Screen V2
Profile Screen - Updated
Shop Screen - Redesign
```

#### ✅ **For Popups/Modals:**
```
Purchase Confirmation Popup
Reward Claim Popup
Error Message Popup
Settings Modal
```

### Flow Naming

Flows are identified by the **connection path** between frames. Name frames to make flows clear:

#### ✅ **Good Flow Structure:**
```
Login Screen → Home Screen → Profile Screen
Home Screen → Shop Screen → Purchase Confirmation Popup
Battle Pass Screen → Reward Claim Popup → Home Screen
```

---

## File Structure Recommendations

### Option 1: Single Page Structure (Recommended for Simple Specs)

**Structure:**
```
Page: "Feature Name"
  ├── Frame: "Login Screen"
  ├── Frame: "Home Screen"
  ├── Frame: "Profile Screen"
  ├── Frame: "Purchase Confirmation Popup"
  └── Frame: "Error Message Popup"
```

**Prototype Connections:**
- Connect frames using Figma's prototype feature
- Set transition types (Instant, Dissolve, etc.)
- Add interaction triggers (On Click, On Drag, etc.)

### Option 2: Multi-Page Structure (Recommended for Complex Specs)

**Structure:**
```
Page: "Screens"
  ├── Frame: "Login Screen"
  ├── Frame: "Home Screen"
  └── Frame: "Profile Screen"

Page: "Popups"
  ├── Frame: "Purchase Confirmation Popup"
  ├── Frame: "Reward Claim Popup"
  └── Frame: "Error Message Popup"

Page: "Flows"
  ├── Frame: "Login Flow Start"
  ├── Frame: "Login Flow Success"
  └── Frame: "Login Flow Error"
```

---

## Identifying Different Types of Content

### 1. **New Screens**

**How to Mark:**
- Prefix frame name with `[New]` or `NEW:`
- Or use a dedicated page called "New Screens"

**Examples:**
```
[New] Tournament Screen
NEW: Social Hub Screen
New Leaderboard Screen
```

**What the System Does:**
- Creates a new UI slide for each new screen
- Extracts text content (headers, CTAs, etc.)
- Generates mockup references

### 2. **UI Changes/Updates**

**How to Mark:**
- Use version numbers: `Screen Name V2`
- Use update indicators: `Screen Name - Updated`
- Use change markers: `Screen Name - Redesign`

**Examples:**
```
Home Screen V2
Profile Screen - Updated
Shop Screen - Redesign
Settings Screen - New Layout
```

**What the System Does:**
- Identifies it as an update to existing screen
- May reference the original in the spec
- Highlights what changed

### 3. **Popups/Modals**

**How to Mark:**
- Include "Popup", "Modal", or "Dialog" in the name
- Use a dedicated page for popups

**Examples:**
```
Purchase Confirmation Popup
Reward Claim Modal
Error Message Dialog
Settings Modal
Confirmation Dialog
```

**What the System Does:**
- Identifies as popup/modal
- May include popup priority information
- Links to parent screen if connected via prototype

### 4. **Flows**

**How to Mark:**
- Use Figma's **Prototype** feature to connect frames
- Name frames to indicate flow sequence
- Use flow indicators in names

**Examples:**
```
Login Screen → Home Screen (prototype connection)
Purchase Flow Start → Purchase Flow Confirmation → Purchase Flow Success
Onboarding Step 1 → Onboarding Step 2 → Onboarding Step 3
```

**What the System Does:**
- Follows prototype connections
- Creates flow slides describing the sequence
- Documents step-by-step navigation

---

## Best Practices

### 1. **Frame Organization**

#### ✅ **DO:**
- Keep top-level frames as separate screens
- Use clear, descriptive names
- Group related screens on the same page
- Use consistent naming conventions

#### ❌ **DON'T:**
- Nest screens inside other screens (unless it's a component)
- Use vague names like "Screen 1", "Frame 2"
- Mix different feature screens randomly

### 2. **Text Content Extraction**

The system extracts text from frames to populate:
- **Header**: Usually the largest/most prominent text
- **Sub text**: Secondary text elements
- **CTA**: Button text, link text

#### ✅ **DO:**
- Use clear text layers (not flattened images)
- Make button text readable
- Use proper text hierarchy

#### ❌ **DON'T:**
- Flatten text into images
- Use placeholder text like "Lorem ipsum"
- Hide important text in nested groups

### 3. **Prototype Connections**

#### ✅ **DO:**
- Connect related screens with prototypes
- Set clear transition types
- Use meaningful interaction triggers
- Create complete flow paths

#### ❌ **DON'T:**
- Leave screens unconnected
- Use random transitions
- Create circular flows without clear entry/exit points

### 4. **Naming Patterns**

#### Recommended Patterns:

**Screens:**
```
[Feature] Screen
[Feature] Screen V2 (for updates)
[Feature] Screen - [Description]
```

**Popups:**
```
[Action] [Type] Popup
[Action] [Type] Modal
[Action] [Type] Dialog
```

**Flows:**
```
[Feature] Flow Start
[Feature] Flow Step [N]
[Feature] Flow Success
[Feature] Flow Error
```

---

## Example: Complete Figma File Structure

### Scenario: Adding a Battle Pass Feature

```
Figma File: "Battle Pass Feature"

Page: "Battle Pass Screens"
  ├── Frame: "[New] Battle Pass Screen"
  │   └── Text: "Battle Pass" (Header)
  │   └── Text: "View your progress" (Sub text)
  │   └── Button: "Claim Rewards" (CTA)
  │
  ├── Frame: "[New] Battle Pass Rewards Screen"
  │   └── Text: "Your Rewards" (Header)
  │   └── List of rewards
  │
  └── Frame: "Battle Pass Purchase Popup"
      └── Text: "Unlock Premium Pass?" (Header)
      └── Button: "Purchase" (CTA)
      └── Button: "Cancel" (CTA)

Page: "Battle Pass Flows"
  ├── Frame: "Battle Pass Flow - View"
  ├── Frame: "Battle Pass Flow - Claim"
  └── Frame: "Battle Pass Flow - Purchase"

Prototype Connections:
  Battle Pass Screen → Battle Pass Rewards Screen (On Click: "View Rewards")
  Battle Pass Screen → Battle Pass Purchase Popup (On Click: "Purchase")
  Battle Pass Purchase Popup → Battle Pass Screen (On Click: "Cancel")
```

**What the System Generates:**
1. **UI Slide**: "Battle Pass Screen UI"
   - Header: Battle Pass
   - Sub text: View your progress
   - CTA: Claim Rewards
   - Mockup: {{FIGMA_IMAGE:BP_SCREEN_ID}}

2. **UI Slide**: "Battle Pass Rewards Screen UI"
   - Header: Your Rewards
   - Mockup: {{FIGMA_IMAGE:BP_REWARDS_ID}}

3. **UI Slide**: "Battle Pass Purchase Popup UI"
   - Header: Unlock Premium Pass?
   - CTA: Purchase, Cancel
   - Popup Priority: High
   - Mockup: {{FIGMA_IMAGE:BP_POPUP_ID}}

4. **Flow Slide**: "Battle Pass Flow - View"
   - Description: User clicks "View Rewards" → Opens Battle Pass Rewards Screen
   - Mockup: {{FIGMA_IMAGE:BP_FLOW_VIEW_ID}}

5. **Flow Slide**: "Battle Pass Flow - Purchase"
   - Description: User clicks "Purchase" → Opens Purchase Popup → User confirms → Returns to Battle Pass Screen
   - Mockup: {{FIGMA_IMAGE:BP_FLOW_PURCHASE_ID}}

---

## Advanced: Using Figma Components

### Component-Based Screens

If you use Figma Components for reusable elements:

#### ✅ **DO:**
- Keep components as instances within frames
- Name components clearly
- The system will extract text from component instances

#### Example:
```
Frame: "Home Screen"
  ├── Component Instance: "Navigation Bar"
  ├── Component Instance: "User Profile Card"
  └── Component Instance: "Action Button"
```

The system extracts all text from these components.

---

## Troubleshooting

### Issue: Screens Not Being Detected

**Problem:** System doesn't create UI slides for your frames

**Solutions:**
- Ensure frames are at the top level (not nested inside other frames)
- Check that frame names are clear and descriptive
- Verify frames are on a page (not floating)

### Issue: Flows Not Being Detected

**Problem:** System doesn't create flow slides

**Solutions:**
- Ensure prototype connections are set up in Figma
- Check that transitions have proper triggers (On Click, etc.)
- Verify frame names indicate flow relationships

### Issue: Text Not Being Extracted

**Problem:** Headers, CTAs not appearing in spec

**Solutions:**
- Ensure text is in text layers (not flattened)
- Use proper text hierarchy (larger text = header)
- Make button text clear and readable

### Issue: Popups Not Identified

**Problem:** Popups treated as regular screens

**Solutions:**
- Include "Popup", "Modal", or "Dialog" in frame name
- Consider using a dedicated "Popups" page
- Connect popup to parent screen via prototype

---

## Quick Reference Checklist

Before sharing your Figma file:

- [ ] All screens are top-level frames
- [ ] Frame names are clear and descriptive
- [ ] New screens are marked with `[New]` or similar
- [ ] Popups include "Popup", "Modal", or "Dialog" in name
- [ ] Prototype connections are set up for flows
- [ ] Text is in text layers (not flattened)
- [ ] Button text is clear and readable
- [ ] Related screens are grouped on same page
- [ ] Frame names follow consistent naming pattern

---

## Summary

**Key Takeaways:**
1. **Top-level frames = UI Screens** → Name them clearly
2. **Prototype connections = Flows** → Set them up properly
3. **Frame names matter** → Use descriptive, consistent names
4. **Text extraction** → Keep text in text layers
5. **Organization** → Group related screens together

**Naming Patterns:**
- Screens: `[Feature] Screen` or `[Feature] Screen V2`
- Popups: `[Action] [Type] Popup/Modal/Dialog`
- New: Prefix with `[New]` or `NEW:`
- Updates: Use `V2`, `- Updated`, or `- Redesign`

Follow these guidelines and the Spec Maker will accurately identify and document your UI changes, flows, new screens, and popups!
