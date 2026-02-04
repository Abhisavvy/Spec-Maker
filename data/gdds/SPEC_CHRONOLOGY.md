# Spec chronology (2020–2025)

The app **cannot** infer when each spec was originally created. Here's what we know and how to add dates.

## What we have today

- **File system dates** on this machine show when files were added/copied (e.g. Dec 2025, Feb 2026), not when the spec was first written.
- **PDF metadata** in these files only has `Title` and `Creator` (Google); there is **no creation or modification date** stored.
- **Git history** only shows “Initial commit” (Nov 2025) for the few PDFs that were ever committed; the rest of the ~50 specs are not in git with per-file history.

So **I don’t know** which spec was created in which year (2020–2025) from the current data.

## How to record chronology

To give the AI (and humans) a clear view of **when** each spec was created and how iterations evolved, you can maintain a **chronology manifest** in this folder.

### Option 1: Simple list (edit this file)

Add a section below with one line per spec: **filename** and **date (year or YYYY-MM)**. You can fill this from memory, from Google Drive “Created” dates, or from your meeting/docs history.

Example:

```text
# Chronology (oldest first) – fill in date created or first version
# Format: YYYY or YYYY-MM  Filename

2020  [oldest spec name if you know it]
2021  ...
2022  ...
2023  ...
2024  ...
2025  ...
```

### Option 2: JSON manifest (for the app to load)

Create a file `spec_dates.json` in this folder with creation or “first version” dates:

```json
{
  "Bonus Tiles .pdf": "2023-06",
  "Bot Gameplay Spec.pdf": "2024-01",
  "Chat V1 Spec.pdf": "2022-11",
  "Word Saga.pdf": "2025-12"
}
```

Use **YYYY** or **YYYY-MM** so we can sort and use “chronological order” in the app later.

### Where dates usually live

- **Google Drive / Slides**: Open the file → File → Version history → see “Created” and edits.
- **Slack/email**: Search for when the spec was first shared.
- **Meeting notes**: If your dashboard or docs have “From: YYYY-MM-DD”, that can approximate creation.

Once you have a list (in this markdown or in `spec_dates.json`), we can add a small loader so the context analyzer and the generator know “this spec is from 2022, this one from 2024” and use that for chronological context and iteration understanding.
