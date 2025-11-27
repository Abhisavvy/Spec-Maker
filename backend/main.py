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

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

from app.services.pptx_generator import PPTXGenerator
from app.services.qa_service import QAService
from app.services.chat_service import SpecChatService
import uuid

pptx_generator = PPTXGenerator()
qa_service = QAService()
chat_service = SpecChatService()

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
    # Quick check using just the prompt
    questions = qa_service.analyze_prompt(request.prompt)
    return {"questions": questions}

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

@app.post("/api/generate")
def generate_gdd(request: GenerateRequest):
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
    
    # 2. Convert to PPTX
    filename = f"gdd_{uuid.uuid4()}.pptx"
    output_path = os.path.join("static/generated", filename)
    full_output_path = os.path.join(os.path.dirname(__file__), output_path)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(full_output_path), exist_ok=True)
    
    # Find template
    template_path = None
    for f in os.listdir(SLIDES_DIR):
        if f.endswith(".pptx") and not f.startswith("~"):
            template_path = os.path.join(SLIDES_DIR, f)
            break
            
    pptx_generator.create_presentation(gdd_markdown, full_output_path, template_path)
    
    return {
        "gdd": gdd_markdown,
        "pptx_url": f"/static/generated/{filename}"
    }
