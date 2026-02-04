# Setup Spec Maker on a New Machine

## Quick Setup Guide

Follow these steps to get Spec Maker running on a new machine.

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Abhisavvy/Spec-Maker.git

# Navigate into the directory
cd Spec-Maker
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend

```bash
cd backend
```

### 2.2 Create Virtual Environment

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

In the `backend` folder, create a file named `.env`:

```bash
# Mac/Linux
touch .env

# Windows
type nul > .env
```

### 3.2 Add Your API Key

Open `.env` and add:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**To get your API key:**
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key and paste it in `.env`

---

## Step 4: Create Data Directories

```bash
# From the project root (Spec-Maker/)
mkdir -p data/gdds
mkdir -p data/slides
mkdir -p data/edge_cases
mkdir -p data/context_uploads
mkdir -p data/qa_history
mkdir -p data/context_cache
```

**Windows:**
```cmd
mkdir data\gdds
mkdir data\slides
mkdir data\edge_cases
mkdir data\context_uploads
mkdir data\qa_history
mkdir data\context_cache
```

---

## Step 5: Run the Server

### 5.1 Make Sure Virtual Environment is Activated

You should see `(venv)` in your terminal prompt.

### 5.2 Start the Server

```bash
cd backend
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Windows:**
```cmd
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 5.3 Verify It's Running

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Step 6: Open in Browser

Open your browser and go to:
```
http://localhost:8000
```

---

## Troubleshooting

### "GEMINI_API_KEY not found"
- Make sure `.env` file exists in the `backend` folder
- Check that the file contains: `GEMINI_API_KEY=your_key_here`
- Restart the server after adding the key

### "Module not found" errors
- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Port 8000 already in use
- Kill the process: `lsof -ti:8000 | xargs kill -9` (Mac/Linux)
- Or use a different port: `--port 8001`

### "Permission denied" errors
- On Mac/Linux, you might need: `chmod +x venv/bin/activate`
- Or use: `python3 -m venv venv` instead of `python`

---

## Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/Abhisavvy/Spec-Maker.git
cd Spec-Maker

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create .env file with your API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Create data directories
cd ..
mkdir -p data/{gdds,slides,edge_cases,context_uploads,qa_history,context_cache}

# Run server
cd backend
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## What You Get

After setup, you'll have:
- ✅ Full context system (analyzes all existing specs)
- ✅ Token optimization (60-80% reduction)
- ✅ Meeting data integration
- ✅ Spec generation with conflict detection
- ✅ Chat with specs
- ✅ Spec verifier

**No Google Sign-In** - Simple file-based workflow.

---

## Next Steps

1. Add your existing specs to `data/gdds/` and `data/slides/`
2. Click "Check Files" to verify
3. Start generating specs!

---

## Need Help?

- Check `SETUP.md` for more detailed setup instructions
- See `README.md` for project overview
- Review `FULL_CONTEXT_SYSTEM.md` for feature documentation
