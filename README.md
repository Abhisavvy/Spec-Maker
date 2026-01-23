[SETUP.md](https://github.com/user-attachments/files/23787017/SETUP.md)
# Spec Maker Setup Guide

## 🆕 New: Full Context System

The AI now analyzes **ALL your existing specs** to:
- ✅ Detect conflicts with existing features
- ✅ Use consistent terminology across all specs
- ✅ Reference and integrate with existing systems
- ✅ Maintain quality and style patterns

**See [WHATS_NEW.md](WHATS_NEW.md) for complete details.**

---

Follow these steps to set up the project on a new device (Windows/Mac/Linux).

## 1. Prerequisites
-   **Python 3.10+** installed.
-   **Git** (optional, if you want to use version control).

## 2. Extract Files
1.  Unzip `Spec-Maker-Code-UltraLite.zip` to a folder.
2.  You should see folders like `backend`, `frontend`, `data`, etc.

## 3. Backend Setup
1.  Open a terminal/command prompt.
2.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
3.  Create a virtual environment:
    -   **Mac/Linux**: `python3 -m venv venv`
    -   **Windows**: `python -m venv venv`
4.  Activate the virtual environment:
    -   **Mac/Linux**: `source venv/bin/activate`
    -   **Windows**: `venv\Scripts\activate`
5.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## 4. Environment Variables
1.  In the `backend` folder, create a file named `.env`.
2.  Add your API keys (you need to get these again if you didn't save them):
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

## 5. Run the Server
1.  Make sure your virtual environment is activated.
2.  Run the server:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
3.  The backend is now running at `http://localhost:8000`.

## 6. Frontend Setup
1.  Open the `frontend/index.html` file in any web browser (Chrome, Edge, etc.).
2.  That's it! The frontend connects to the backend automatically.

## Nuances & Troubleshooting
-   **Missing Data**: The `data/gdds` folder might be empty to save space. The system will create files there as you generate them.
-   **Figma Images**: If Figma images fail to load, ensure your `GEMINI_API_KEY` is valid and you have internet access.
-   **Port Conflicts**: If port 8000 is busy, change the port in the `uvicorn` command (e.g., `--port 8001`) and update `frontend/script.js` if necessary (though it usually defaults to localhost:8000).
