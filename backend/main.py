from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from parser_utils import extract_text_from_pdf, extract_text_from_docx, extract_text_from_doc
import os
import json
import re
from google import genai
from pymongo import MongoClient
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
API_KEY = os.environ.get("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=API_KEY)

# Configure MongoDB
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["quizgen_db"]
quizzes_collection = db["quizzes"]
users_collection = db["users"]

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

def save_to_db(data):
    quizzes_collection.replace_one({"_id": "current_quiz"}, data, upsert=True)

def load_from_db():
    quiz = quizzes_collection.find_one({"_id": "current_quiz"})
    if quiz:
        del quiz["_id"]
        return quiz
    return {"questions": []}

def analyze_chunk_with_gemini(text_chunk):
    """Analyzes a single chunk of text with Gemini."""
    prompt = f"""
    Extract all MCQs from this text chunk. 
    Identify the correct answer based on bold/underline formatting or context.
    Return ONLY a JSON list of objects:
    [
      {{"question": "...", "options": ["...", "...", "...", "..."], "answer": "..."}}
    ]
    TEXT:
    {text_chunk}
    """
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return []
    except Exception as e:
        print(f"Chunk Analysis Error: {e}")
        return []

def analyze_full_document(text):
    """Splits large text into chunks and combines results."""
    # Split by ~5000 characters to stay within token limits and get detailed extraction
    chunk_size = 5000 
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    
    all_questions = []
    print(f"Total Chunks to process: {len(chunks)}")
    
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}...")
        chunk_results = analyze_chunk_with_gemini(chunk)
        all_questions.extend(chunk_results)
        
    return all_questions

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    content = await file.read()
    
    try:
        ext = filename.lower()
        if ext.endswith(".pdf"):
            text = extract_text_from_pdf(content)
        elif ext.endswith(".docx"):
            text = extract_text_from_docx(content)
        elif ext.endswith(".doc"):
            text = extract_text_from_doc(content, filename)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {filename}")
            
        # Analyze using chunking to handle 100+ questions
        analysis_type = "AI Chunked"
        try:
            questions = analyze_full_document(text)
        except Exception as ai_err:
            print(f"AI failed, using fallback regex: {ai_err}")
            from parser_utils import parse_quiz_content
            questions = parse_quiz_content(text)
            analysis_type = "Fallback Regex"
            
        # If AI returned no questions (due to key error/quota), use local regex parser
        if not questions:
            print("AI returned 0 questions. Applying local fallback regex parser...")
            from parser_utils import parse_quiz_content
            questions = parse_quiz_content(text)
            analysis_type = "Fallback Regex (AI Quota/Key Error)"
            
        return {
            "filename": filename,
            "total_questions": len(questions),
            "questions": questions,
            "analysis_type": analysis_type
        }
    except Exception as e:
        print(f"Major Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-quiz")
async def save_quiz(data: dict):
    save_to_db(data)
    return {"message": "Quiz saved successfully"}

@app.get("/get-quiz")
async def get_quiz():
    return load_from_db()

@app.post("/signup")
async def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email, "role": user.role}):
        raise HTTPException(status_code=400, detail="User already exists for this role.")
    
    new_user = user.dict()
    users_collection.insert_one(new_user)
    
    del new_user["_id"]
    return new_user

@app.post("/signin")
async def signin(user: UserLogin):
    # Fallback for seeded admin
    if user.role == "admin" and user.email == "admin@gmail.com" and user.password == "admin123":
        return {"name": "SYSTEM ADMIN", "email": "admin@gmail.com", "role": "admin", "picture": ""}

    db_user = users_collection.find_one({"email": user.email, "password": user.password, "role": user.role})
    if db_user:
        del db_user["_id"]
        return db_user
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Serve static files and React app
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        index_path = "frontend/dist/index.html"
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
