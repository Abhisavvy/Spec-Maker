# Making Spec Maker Usable by Others

## Overview

You have several ways to let others use Spec Maker. Choose based on **who** will use it and **how much** you want to manage.

---

## Option 1: Share the Repo (Others Run Locally) — Easiest

**Best for:** Teammates, a few people who are okay running it on their machine.

**How it works:** They clone the repo and run it locally (same as your setup).

**Steps for them:**
1. Clone: `git clone https://github.com/Abhisavvy/Spec-Maker.git`
2. Follow `SETUP_NEW_MACHINE.md`
3. Add their own `GEMINI_API_KEY` in `backend/.env`
4. Add their own specs in `data/gdds/` and `data/slides/`

**Pros:** No server, no cost, full control, no shared API key  
**Cons:** Each person installs Python and runs the app; not a single shared URL

---

## Option 2: Deploy to a Cloud Platform (Single Shared URL)

**Best for:** One link everyone uses (e.g. team or company).

**Catch:** Your app stores files on disk. Most free/cheap hosts have **ephemeral disk** (files disappear on restart). So you either:
- Use a **persistent volume** (if the platform supports it), or
- Add **file upload** and store files in cloud storage (e.g. S3), or
- Accept that uploaded/generated files are temporary (fine for “try it out” only).

### 2a. Render (Free tier)

- Deploy backend as a **Web Service**.
- Set `GEMINI_API_KEY` in Environment.
- **Limitation:** Disk is ephemeral; restarts wipe `data/`. Good for demos or if you add external storage later.

**Steps:**
1. Push code to GitHub (already done).
2. Go to [render.com](https://render.com) → New → Web Service.
3. Connect repo `Abhisavvy/Spec-Maker`.
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `GEMINI_API_KEY` = your key.
6. Deploy. You get a URL like `https://spec-maker-xxx.onrender.com`.

### 2b. Railway

- Similar to Render: connect GitHub, set root to `backend`, set start command and `GEMINI_API_KEY`.
- Can add a **volume** for `data/` so files persist (paid feature).

### 2c. Fly.io

- Good for always-on, low-cost VMs. You can attach a **volume** for `data/` so specs and uploads persist.

---

## Option 3: Run on a VPS (Your Own Server)

**Best for:** Full control, persistent files, one URL for many users.

**How it works:** You rent a small server (e.g. DigitalOcean, Linode, AWS), install Python, run the app, and optionally put Nginx in front and use a domain.

**Rough steps:**
1. Create a droplet/instance (e.g. Ubuntu).
2. SSH in, install Python 3.10+, clone repo, create venv, install deps.
3. Create `backend/.env` with `GEMINI_API_KEY`.
4. Run with:  
   `uvicorn main:app --host 0.0.0.0 --port 8000`  
   Or use systemd so it restarts on reboot.
5. Open port 8000 (or 80 with Nginx) and point a domain to the server IP.

**Pros:** Persistent disk, one shared URL, you control everything  
**Cons:** You maintain the server and security

---

## Option 4: Docker (Easy for Others to Run)

**Best for:** “One command” to run the app on any machine (laptop or server).

A `Dockerfile` is included. From the **project root** (Spec-Maker/):

**Build:**
```bash
docker build -t spec-maker .
```

**Run:**
```bash
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key_here spec-maker
```

Then open **http://localhost:8000**.

**With persistent data** (so gdds/slides survive container restarts):
```bash
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  spec-maker
```

**Pros:** Same setup everywhere; easy to run on a server or locally  
**Cons:** Users need Docker installed

---

## Recommendation by Use Case

| Use case | Option |
|----------|--------|
| Just my team, everyone has Python | **Option 1** – share repo + `SETUP_NEW_MACHINE.md` |
| One link for everyone, demo only (files can be temporary) | **Option 2a** – Render free tier |
| One link, files must persist | **Option 2b/2c** (Railway/Fly.io with volume) or **Option 3** (VPS) |
| “Run anywhere” (laptop or server) | **Option 4** – Docker |

---

## Making the App “Multi-User” Friendly

Right now, everyone shares the same `data/` (same specs, same uploads). If you want each person to have their own space without touching the code too much, you can:

1. **Keep it single-user but documented**  
   - One deployed instance, one shared API key, one `data/` folder.  
   - Document that it’s a shared environment.

2. **Add simple “user” or “workspace” later**  
   - e.g. URL param or dropdown: `?user=alice` and store files under `data/users/alice/`.  
   - No login required at first; you can add auth later if needed.

3. **Let each team run its own instance**  
   - Each team deploys once (Docker or cloud) and uses its own API key and data.

---

## Quick Start: Render (Get a URL in ~10 Minutes)

1. **Prepare the backend to use `PORT`:**

   In `backend/main.py` you already run with uvicorn. On Render, set the start command to:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
   (Render sets `PORT` automatically.)

2. **On Render:**  
   New → Web Service → Connect `Abhisavvy/Spec-Maker` → Root: `backend` → Add `GEMINI_API_KEY` → Deploy.

3. **Share the URL** (e.g. `https://spec-maker-xxx.onrender.com`) with others.

4. **Optional:** Add a `Procfile` or document in README that the start command is:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
   ```
   so it works both locally and on Render.

---

## Summary

- **Easiest for others (no server):** Share repo + `SETUP_NEW_MACHINE.md` (Option 1).  
- **Easiest “one link”:** Deploy to Render (Option 2a).  
- **Most flexible and reusable:** Add Docker (Option 4) so the same app runs the same way for everyone.

If you tell me your preference (e.g. “one shared link on Render” or “Docker so we can run it on our server”), I can outline the exact file changes (e.g. `Dockerfile`, `render.yaml`, or start command) step by step.
