# Figma Integration: How It Works and How to Set Up Frames & Flows

This guide explains how the Spec Maker reads your Figma file, what the AI receives, and how to structure frames and flows so the AI can add mockups and flows to the spec.

---

## 1. How the Figma Integration Works (End-to-End)

```
You enter: Figma Personal Access Token + Figma File URL
        ↓
Spec Maker calls Figma REST API (GET file, GET images)
        ↓
Backend extracts: (1) frame list + names, (2) text inside each frame, (3) prototype transitions, (4) image URLs per frame
        ↓
A structured summary + "AVAILABLE MOCKUPS" list is sent to the AI with your prompt
        ↓
AI writes the spec and uses placeholders: {{FIGMA_IMAGE:FRAME_ID}}
        ↓
Backend replaces each placeholder with the actual image (or a link to Figma)
        ↓
You get the spec (markdown/PPTX) with embedded mockups and flow descriptions
```

**What you need:**
- **Figma Personal Access Token** — From Figma: Settings → Account → Personal access tokens. The token is used for all API calls.
- **Figma File URL** — The shareable link to the file, e.g. `https://www.figma.com/design/Abc123/My-File` or `https://www.figma.com/file/Abc123/My-File`. The app extracts the file key from this URL.

---

## 2. How Files Are Read (Technical)

### 2.1 API Calls

1. **Get file**  
   `GET https://api.figma.com/v1/files/{file_key}`  
   Returns the full file JSON: pages, frames, layers, and prototype data.

2. **Get images**  
   `GET https://api.figma.com/v1/images/{file_key}?ids=id1,id2,...&format=png&scale=2`  
   Returns image URLs for the given node IDs (one URL per top-level frame).

### 2.2 What Gets Extracted (from `figma.py`)

- **Pages**  
  Each page in the file is traversed.

- **Top-level frames only**  
  Only direct children of a page whose `type === "FRAME"` are used.  
  → **Each top-level frame = one “screen” or “flow step”** the AI can reference.

- **Per frame we collect:**
  - **id** — Node ID (e.g. `"123:456"`). Used for `{{FIGMA_IMAGE:123:456}}` and for image URLs.
  - **name** — Frame name. Becomes the screen/flow name in the spec (e.g. “Login Screen”, “Purchase Flow – Confirm”).
  - **text_content** — All text from TEXT nodes inside the frame (recursive). The AI uses this for Header, Sub text, CTA, etc.
  - **transitions** — From the frame’s prototype: currently the code reads **one** transition per frame (`transitionNodeID`). That gives “this frame goes to that frame” for flows.

- **Images**  
  For every top-level frame ID we call the images API and get a PNG URL.  
  Those URLs are what get embedded (or linked) when the AI writes `{{FIGMA_IMAGE:FRAME_ID}}`.

- **Deep links**  
  For each frame we build:  
  `https://www.figma.com/design/{file_key}?node-id={encoded_id}`  
  So the spec can link “View in Figma” even if the image fails.

### 2.3 What the AI Actually Sees

The generator builds a **Figma block** that is sent to the AI. It looks conceptually like this:

```text
Figma Data (simplified):
{
  "pages": [
    {
      "name": "Screens",
      "frames": [
        {
          "id": "123:456",
          "name": "Login Screen",
          "text_content": ["Login", "Enter email", "Sign In"],
          "transitions": ["789:012"]
        },
        {
          "id": "789:012",
          "name": "Home Screen",
          "text_content": ["Home", "Welcome back"],
          "transitions": []
        }
      ]
    }
  ]
}

AVAILABLE MOCKUPS (Use these Frame IDs to reference images):
- Frame ID: 123:456 (Image Available)
- Frame ID: 789:012 (Image Available)
```

Instructions to the AI include:
- Treat each top-level frame as a **UI screen**; use the frame **name** as the screen name.
- Use **text_content** to fill Header, Sub text, CTA.
- Use **transitions** to describe flows (which frame leads to which).
- For images, use **exactly** `{{FIGMA_IMAGE:FRAME_ID}}` with the IDs from the list.

So: **how files are read** = “file API → extract top-level frames, their names, text, and one transition each → images API → one summary JSON + list of frame IDs”. The AI never sees the raw Figma file; it only sees this summary and the list of available mockup IDs.

---

## 3. How to Create Frames and Flows So the AI Can Use Them

### 3.1 Frames = Screens or Flow Steps

- **One top-level frame = one thing the AI can reference** (one UI screen or one step in a flow).
- Put each screen or flow step as its **own top-level frame** on a page (not nested inside another frame that you want to count as a separate screen).

**Good:**
- Page “Screens” → Frame “Login Screen”, Frame “Home Screen”, Frame “Shop Screen”.
- Page “Flows” → Frame “Onboarding Step 1”, Frame “Onboarding Step 2”, Frame “Onboarding Step 3”.

**Bad:**
- One big frame “All Screens” containing frames “Login”, “Home”, “Shop” → only “All Screens” is seen; “Login”/“Home”/“Shop” are not separate screens for the AI.

### 3.2 Naming Frames (Screen Names in the Spec)

- **Frame name = screen name** in the spec (e.g. “## Login Screen UI”, “## Home Screen UI”).
- Use clear, descriptive names:  
  “Login Screen”, “Purchase Confirmation Popup”, “Onboarding – Email Step”.
- For popups/modals, include “Popup”, “Modal”, or “Dialog” so the AI (and your team) can treat them as overlays.
- For flow steps, names that indicate sequence help:  
  “Checkout – Cart”, “Checkout – Payment”, “Checkout – Success”.

### 3.3 Text the AI Will Read (Header, Sub text, CTA)

- All **text layers** inside a frame are collected into `text_content` (recursive).
- The AI is told to use this for “Header”, “Sub text”, “CTA”.
- **Use real text layers** (not flattened images or text baked into bitmaps) so the API can read them.
- Order in the array is the order they appear in the tree; the AI infers what’s “header” vs “CTA” from context and size. Clear hierarchy (e.g. one big title, one subtitle, one button) helps.

So: **how to create frames** = one frame per screen/step, clear names, and important copy as text layers inside that frame.

### 3.4 Flows (How the AI Knows “A → B”)

- **Flows** are derived from Figma **prototype connections**: “when the user does something on frame A, go to frame B.”
- The code today only reads **one** transition per frame (`transitionNodeID`). So for each frame we get at most one “next” frame.
- **In Figma:** use the Prototype tab and set “On click” (or other trigger) to navigate to another frame. That creates the link the backend reads.
- **Naming:** name frames so the flow is obvious, e.g. “Login Screen” → “Home Screen”, “Cart Screen” → “Checkout – Payment”. The AI uses frame names + transitions to write “User clicks X → [Frame name]” and can attach the right mockup to each step.

If you have multiple exits from one frame (e.g. “Login” → “Home” and “Login” → “Forgot Password”), the current implementation only exposes one of them. You can still document the other in the spec text; the AI just won’t see it as a second transition from that frame.

### 3.5 Summary: Checklist for “AI-Friendly” Frames and Flows

- **One screen or flow step = one top-level frame.**
- **Name frames** clearly; names become spec headings and flow step labels.
- **Use text layers** for titles, subtitles, and buttons (no flattened text).
- **Use Figma Prototype** to connect frames (one main “next” per frame is fully supported).
- **Optional:** one page for “Screens”, one for “Flows” or “Popups” so structure is clear when you read the JSON.

---

## 4. How the AI Creates New Mocks and Flows in the Spec

- The AI **does not create new Figma frames**. It only **references** the frames you already created.
- It **does** create **new spec content**:
  - **UI slides:** one “## &lt;Screen Name&gt; UI” per frame you have, with Header/Sub text/CTA filled from `text_content` and a mockup placeholder `{{FIGMA_IMAGE:FRAME_ID}}`.
  - **Flow slides:** “## &lt;Flow name&gt; Flow” with a short step-by-step description and, where relevant, `{{FIGMA_IMAGE:FRAME_ID}}` for the key frames in that flow.
- **Placeholder replacement:** after the AI returns the spec, the backend replaces every `{{FIGMA_IMAGE:FRAME_ID}}` (or `{FIGMA_IMAGE:FRAME_ID}`) with:
  - The PNG image from the images API (embedded in markdown/export), or
  - A “View in Figma” link if the image URL wasn’t available.

So: **how to create frames and flows such that the AI can read and add them to the spec** = create the frames and connections in Figma as above; the AI then “creates” the corresponding UI and flow slides in the spec and inserts the mockup images/links using those frame IDs.

---

## 5. Quick Reference

| You want … | Do this in Figma | What the AI gets |
|------------|------------------|-------------------|
| A screen in the spec | One top-level frame, clear name, text in text layers | Name, text_content, one transition (if set), image URL |
| A flow in the spec | Connect frames with Prototype (e.g. On click → next frame) | Pairs (frame A → frame B) from transitionNodeID |
| Mockup image in the spec | Same top-level frame; image API is called for it | Placeholder {{FIGMA_IMAGE:id}} replaced with image or link |
| Popup/modal | Frame name contains “Popup”/“Modal”/“Dialog” | Same as any frame; naming helps AI treat it as overlay |

---

## 6. Where This Is Implemented

- **Figma API and extraction:** `backend/app/services/figma.py`  
  - `get_file()`, `get_images()`, `extract_flows()`, `_extract_text_from_node()`, `parse_file_key()`.
- **Use in generation:** `backend/app/services/generator.py`  
  - Builds `figma_content` and “AVAILABLE MOCKUPS”, passes to the prompt, then replaces `{{FIGMA_IMAGE:...}}` in the generated text.
- **Structure/naming best practices:** `FIGMA_STRUCTURE_GUIDE.md` (complementary to this technical guide).

If you want, the next step can be to extend the extraction (e.g. multiple transitions per frame or reading overlay type) and document that in this same guide.
