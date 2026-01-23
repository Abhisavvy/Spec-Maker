import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from app.services.generator import GeneratorService
from app.services.parser import DocumentParser
from app.services.analyzer import EdgeCaseAnalyzer

# Load .env file from the backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Also try loading from current directory as fallback
load_dotenv()

app = FastAPI(title="GDD Maker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
GDDS_DIR = os.path.join(DATA_DIR, "gdds")
SLIDES_DIR = os.path.join(DATA_DIR, "slides")
EDGE_CASES_DIR = os.path.join(DATA_DIR, "edge_cases")
CONTEXT_UPLOADS_DIR = os.path.join(DATA_DIR, "context_uploads")

generator_service = GeneratorService()

class GenerateRequest(BaseModel):
    prompt: str
    figma_token: Optional[str] = None
    figma_url: Optional[str] = None

class EnhanceMeetingDataRequest(BaseModel):
    meeting_data: str

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

@app.post("/api/enhance-meeting-data")
def enhance_meeting_data(request: EnhanceMeetingDataRequest):
    """
    Enhances meeting data format to include all required spec sections.
    Automatically fills in missing sections based on existing content.
    """
    try:
        from app.services.meeting_data_enhancer import MeetingDataEnhancer
        enhancer = MeetingDataEnhancer()
        enhanced = enhancer.enhance_meeting_data(request.meeting_data)
        return {"enhanced_data": enhanced}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

from app.services.pptx_generator import PPTXGenerator
from app.services.qa_service import QAService
from app.services.chat_service import SpecChatService
from app.services.verifier import SpecVerifier
import uuid

pptx_generator = PPTXGenerator()
qa_service = QAService()
chat_service = SpecChatService()
verifier_service = SpecVerifier()

class QARequest(BaseModel):
    question: str
    answer: str

class ChatRequest(BaseModel):
    question: str

@app.get("/api/check-files")
def check_files():
    gdds = DocumentParser.load_documents_from_dir(GDDS_DIR)
    slides = DocumentParser.load_documents_from_dir(SLIDES_DIR)
    
    edge_cases_file = None
    if os.path.exists(EDGE_CASES_DIR) and os.listdir(EDGE_CASES_DIR):
        edge_cases_file = os.listdir(EDGE_CASES_DIR)[0]
        
    # Reload chat context when files are checked
    chat_service.load_context(GDDS_DIR, SLIDES_DIR)

    return {
        "gdds": [d["filename"] for d in gdds],
        "slides": [d["filename"] for d in slides],
        "edge_cases": edge_cases_file
    }

@app.post("/api/analyze")
def analyze_prompt(request: GenerateRequest):
    try:
        # Analyze prompt and check for conflicts
        from app.services.context_analyzer import ContextAnalyzer
        
        analyzer = ContextAnalyzer()
        analysis = analyzer.analyze_all_specs(GDDS_DIR, SLIDES_DIR)
        
        # Check for conflicts
        conflicts = analyzer.find_potential_conflicts(request.prompt, analysis)
        
        # Get clarifying questions
        questions = qa_service.analyze_prompt(request.prompt)
        
        return {
            "questions": questions,
            "conflicts": conflicts,
            "context_stats": {
                "total_specs": analysis['stats']['total_specs'],
                "features_found": len(analysis['features'])
            }
        }
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg.lower() or "API_KEY" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid or missing Gemini API key. Please check your .env file.")
        if "quota" in error_msg.lower() or "429" in error_msg or "Quota exceeded" in error_msg:
            raise HTTPException(status_code=429, detail=f"API quota exceeded. {error_msg[:300]}")
        # If analysis fails, return empty questions so generation can proceed
        print(f"Analysis error (proceeding anyway): {e}")
        return {"questions": [], "conflicts": []}

@app.post("/api/save-qa")
def save_qa(request: QARequest):
    qa_service.save_entry(request.question, request.answer)
    return {"status": "saved"}

@app.post("/api/chat")
def chat_specs(request: ChatRequest):
    answer = chat_service.ask_question(request.question)
    return {"answer": answer}

@app.post("/api/clear-chat")
def clear_chat():
    chat_service.clear_history()
    return {"status": "cleared"}

from fastapi import UploadFile, File, Form

@app.post("/api/upload-context")
async def upload_context(file: UploadFile = File(...), description: str = Form(...)):
    # Save file
    file_path = os.path.join(CONTEXT_UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Save description (simple sidecar text file)
    desc_path = file_path + ".desc.txt"
    with open(desc_path, "w") as f:
        f.write(description)
        
    return {"status": "success", "filename": file.filename}

@app.post("/api/verify-spec")
async def verify_spec(file: UploadFile = File(...)):
    """
    Verifies a spec (PDF or PPT) against existing specs.
    Checks for conflicts, gaps, threats, and format issues.
    """
    try:
        # Save uploaded file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Parse the spec file
        spec_content = DocumentParser.parse_file(tmp_path)
        
        # Load all existing specs for context
        all_gdds = DocumentParser.load_documents_from_dir(GDDS_DIR)
        all_slides = DocumentParser.load_documents_from_dir(SLIDES_DIR)
        
        # Build context string from all specs
        context_parts = []
        for doc in all_gdds + all_slides:
            context_parts.append(f"--- SPEC: {doc['filename']} ---\n{doc['content'][:5000]}")  # Limit each spec
        
        all_specs_context = "\n\n".join(context_parts)
        
        # Verify the spec
        result = verifier_service.verify_spec(spec_content, file.filename, all_specs_context)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return result
        
    except Exception as e:
        return {
            "error": f"Verification failed: {str(e)}",
            "conflicts": [],
            "gaps": [],
            "threats": [],
            "format_issues": [],
            "questions": []
        }

@app.post("/api/refresh-context")
def refresh_context():
    """Force refresh the context analysis cache."""
    try:
        from app.services.context_analyzer import ContextAnalyzer
        analyzer = ContextAnalyzer()
        analysis = analyzer.analyze_all_specs(GDDS_DIR, SLIDES_DIR, force_refresh=True)
        return {
            "status": "success",
            "stats": analysis['stats'],
            "features": len(analysis['features']),
            "terminology": len(analysis['terminology'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_gdd(request: GenerateRequest):
    try:
        # 1. Generate Markdown GDD
        gdd_markdown = generator_service.generate_gdd(
            request.prompt, 
            request.figma_token, 
            request.figma_url,
            GDDS_DIR,
            SLIDES_DIR,
            EDGE_CASES_DIR,
            CONTEXT_UPLOADS_DIR
        )
        
        # Check if generation failed due to API key
        if gdd_markdown.startswith("Error:"):
            raise HTTPException(status_code=400, detail=gdd_markdown)
        
        # Clean HTML tags from markdown for display (but keep original for PPTX)
        import re
        # Remove all HTML tags including <b>, </b>, etc. - no bolding needed
        gdd_markdown_clean = re.sub(r'<[^>]+>', '', gdd_markdown)
        
        # 2. Convert to PPTX (use original markdown with HTML tags for PPTX generation)
        filename = f"gdd_{uuid.uuid4()}.pptx"
        output_path = os.path.join("static/generated", filename)
        full_output_path = os.path.join(os.path.dirname(__file__), output_path)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(full_output_path), exist_ok=True)
        
        # Find template
        template_path = None
        if os.path.exists(SLIDES_DIR):
            for f in os.listdir(SLIDES_DIR):
                if f.endswith(".pptx") and not f.startswith("~"):
                    template_path = os.path.join(SLIDES_DIR, f)
                    break
            
        pptx_generator.create_presentation(gdd_markdown, full_output_path, template_path)
        
        return {
            "gdd": gdd_markdown_clean,  # Return cleaned markdown for display
            "pptx_url": f"/static/generated/{filename}"
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg.lower() or "API_KEY" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid or missing Gemini API key. Please check your .env file.")
        if "quota" in error_msg.lower() or "429" in error_msg or "Quota exceeded" in error_msg:
            raise HTTPException(status_code=429, detail=f"API quota exceeded. Please check your Gemini API quota limits. {error_msg[:300]}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {error_msg[:300]}")
