# Fix: API Key Leaked Error

## Error Message
```
403 Your API key was reported as leaked. Please use another API key.
```

## What Happened
Your Gemini API key was detected as leaked (possibly exposed in code, logs, or public repositories) and Google has blocked it for security.

## Solution: Get a New API Key

### Step 1: Get a New API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Select your Google Cloud project (or create a new one)
5. Copy the new API key

### Step 2: Update Your .env File

1. Navigate to your backend folder:
   ```bash
   cd /Users/abhishekdutta/spec-maker/backend
   ```

2. Open or create the `.env` file:
   ```bash
   # On Mac/Linux
   nano .env
   
   # Or use any text editor
   ```

3. Update the API key:
   ```env
   GEMINI_API_KEY=your_new_api_key_here
   ```
   
   Replace `your_new_api_key_here` with your new key from Step 1.

4. Save the file (Ctrl+X, then Y, then Enter if using nano)

### Step 3: Restart the Server

1. Stop the current server (if running):
   - Press `Ctrl+C` in the terminal where the server is running
   - Or kill the process:
     ```bash
     lsof -ti:8000 | xargs kill -9
     ```

2. Restart the server:
   ```bash
   cd /Users/abhishekdutta/spec-maker/backend
   python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

### Step 4: Verify It Works

1. Open http://localhost:8000 in your browser
2. Try generating a spec
3. The error should be gone!

## Security Best Practices

To prevent this from happening again:

1. **Never commit `.env` files to Git**
   - The `.env` file should already be in `.gitignore`
   - Double-check it's not tracked: `git status`

2. **Don't share API keys**
   - Never paste API keys in chat, emails, or public forums
   - Never hardcode keys in source code

3. **Use environment variables**
   - Always use `.env` files (which are gitignored)
   - Never put keys directly in code

4. **Rotate keys regularly**
   - Consider rotating keys every few months
   - If a key is exposed, rotate immediately

5. **Use API key restrictions** (if available)
   - Restrict keys to specific IPs or domains
   - Set usage quotas

## Troubleshooting

### "Still getting 403 error"
- Make sure you saved the `.env` file
- Restart the server completely
- Verify the key is correct (no extra spaces)
- Check the key is active in Google AI Studio

### "Can't find .env file"
- Create it in the `backend` folder
- Make sure it's named exactly `.env` (with the dot)
- On Mac/Linux, files starting with `.` are hidden

### "Server won't start"
- Check Python is installed: `python3 --version`
- Check dependencies: `pip install -r requirements.txt`
- Check port 8000 is free: `lsof -ti:8000`

## Quick Command Reference

```bash
# Navigate to backend
cd /Users/abhishekdutta/spec-maker/backend

# Edit .env file
nano .env

# Kill server on port 8000
lsof -ti:8000 | xargs kill -9

# Start server
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## Need Help?

If you're still having issues:
1. Check the server terminal for error messages
2. Verify your API key at https://aistudio.google.com/apikey
3. Make sure you have quota available in Google Cloud Console
