from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from parser_utils import extract_text_from_pdf, extract_text_from_docx, extract_text_from_doc
import os
import json
import re
from datetime import datetime
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

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
gemini_client = None
if API_KEY:
    try:
        gemini_client = genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"Failed to initialize Gemini Client: {e}")
else:
    print("WARNING: GEMINI_API_KEY not set. AI features will fallback to Regex.")

# ─────────────────────────────────────────────
# MongoDB Setup with Graceful Fallback
# ─────────────────────────────────────────────
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
MONGO_AVAILABLE = False
quizzes_collection = None
users_collection = None
attempts_collection = None

try:
    from pymongo import MongoClient
    from bson import ObjectId
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    mongo_client.server_info()  # Will throw if MongoDB not available
    db = mongo_client["quizgen_db"]
    quizzes_collection = db["quizzes"]
    users_collection = db["users"]
    attempts_collection = db["attempts"]
    try:
        users_collection.create_index("email", unique=True)
    except Exception:
        pass
    MONGO_AVAILABLE = True
    print("[OK] MongoDB Connected Successfully!")
except Exception as e:
    print(f"[WARN] MongoDB not available: {e}")
    print("[INFO] Falling back to local JSON file storage...")

# ─────────────────────────────────────────────
# JSON Fallback Storage (when MongoDB is down)
# ─────────────────────────────────────────────
DB_FILE = os.path.join(os.path.dirname(__file__), "quiz_db.json")

def _load_json_db():
    """Load the full local JSON database."""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"quizzes": [], "users": [], "attempts": [], "current_quiz": {"questions": []}}

def _save_json_db(data: dict):
    """Save the full local JSON database."""
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

# ─────────────────────────────────────────────
# Unified DB Helper Functions
# ─────────────────────────────────────────────

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
    if MONGO_AVAILABLE:
        data_copy = dict(data)
        data_copy["_id"] = "current_quiz"
        quizzes_collection.replace_one({"_id": "current_quiz"}, data_copy, upsert=True)
    else:
        jdb = _load_json_db()
        jdb["current_quiz"] = data
        _save_json_db(jdb)

def load_from_db():
    if MONGO_AVAILABLE:
        quiz = quizzes_collection.find_one({"_id": "current_quiz"})
        if quiz:
            del quiz["_id"]
            return quiz
        return {"questions": []}
    else:
        jdb = _load_json_db()
        return jdb.get("current_quiz", {"questions": []})

# ─────────────────────────────────────────────
# Gemini AI Analysis
# ─────────────────────────────────────────────

def analyze_chunk_with_gemini(text_chunk):
    """Analyzes a single chunk of text with Gemini."""
    if not gemini_client:
        return []
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
    chunk_size = 5000
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    all_questions = []
    print(f"Total Chunks to process: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}...")
        chunk_results = analyze_chunk_with_gemini(chunk)
        all_questions.extend(chunk_results)
    return all_questions

# ─────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "mongo_available": MONGO_AVAILABLE,
        "storage_mode": "MongoDB" if MONGO_AVAILABLE else "Local JSON Fallback"
    }

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

        analysis_type = "AI Chunked"
        try:
            questions = analyze_full_document(text)
        except Exception as ai_err:
            print(f"AI failed, using fallback regex: {ai_err}")
            from parser_utils import parse_quiz_content
            questions = parse_quiz_content(text)
            analysis_type = "Fallback Regex"

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
    if "created_at" not in data:
        data["created_at"] = datetime.utcnow().isoformat()
    if "title" not in data:
        data["title"] = data.get("filename", "Untitled Quiz")

    if MONGO_AVAILABLE:
        result = quizzes_collection.insert_one(data)
        data_copy = dict(data)
        data_copy["_id"] = "current_quiz"
        quizzes_collection.replace_one({"_id": "current_quiz"}, data_copy, upsert=True)
        return {"message": "Quiz saved successfully", "quiz_id": str(result.inserted_id)}
    else:
        jdb = _load_json_db()
        quiz_id = f"quiz_{len(jdb['quizzes'])+1}_{int(datetime.utcnow().timestamp())}"
        data["_id"] = quiz_id
        jdb["quizzes"].append(data)
        jdb["current_quiz"] = dict(data)
        _save_json_db(jdb)
        return {"message": "Quiz saved successfully (local)", "quiz_id": quiz_id}

@app.get("/quizzes")
async def get_all_quizzes():
    if MONGO_AVAILABLE:
        quizzes = list(quizzes_collection.find({"_id": {"$ne": "current_quiz"}}).sort("created_at", -1))
        for q in quizzes:
            q["_id"] = str(q["_id"])
        return quizzes
    else:
        jdb = _load_json_db()
        return list(reversed(jdb.get("quizzes", [])))

@app.get("/faculty-quizzes")
async def get_faculty_quizzes(email: str):
    if MONGO_AVAILABLE:
        quizzes = list(quizzes_collection.find({"faculty_email": email, "_id": {"$ne": "current_quiz"}}).sort("created_at", -1))
        for q in quizzes:
            q["_id"] = str(q["_id"])
        return quizzes
    else:
        jdb = _load_json_db()
        return [q for q in reversed(jdb.get("quizzes", [])) if q.get("faculty_email") == email]

@app.get("/get-quiz")
async def get_quiz():
    return load_from_db()

@app.post("/submit-attempt")
async def submit_attempt(data: dict):
    data["timestamp"] = datetime.utcnow().isoformat()
    if MONGO_AVAILABLE:
        attempts_collection.insert_one(data)
    else:
        jdb = _load_json_db()
        jdb["attempts"].append(data)
        _save_json_db(jdb)
    return {"message": "Attempt saved"}

@app.get("/student-attempts")
async def get_student_attempts(email: str):
    if MONGO_AVAILABLE:
        attempts = list(attempts_collection.find({"student_email": email}).sort("timestamp", -1))
        for a in attempts:
            a["_id"] = str(a["_id"])
        return attempts
    else:
        jdb = _load_json_db()
        return [a for a in reversed(jdb.get("attempts", [])) if a.get("student_email") == email]

@app.post("/signup")
async def signup(user: UserCreate):
    if MONGO_AVAILABLE:
        if users_collection.find_one({"email": user.email, "role": user.role}):
            raise HTTPException(status_code=400, detail="User already exists for this role.")
        new_user = user.dict()
        users_collection.insert_one(new_user)
        del new_user["_id"]
        return new_user
    else:
        jdb = _load_json_db()
        existing = [u for u in jdb["users"] if u.get("email") == user.email and u.get("role") == user.role]
        if existing:
            raise HTTPException(status_code=400, detail="User already exists for this role.")
        new_user = user.dict()
        jdb["users"].append(new_user)
        _save_json_db(jdb)
        return new_user

@app.post("/signin")
async def signin(user: UserLogin):
    # Fallback for seeded admin
    if user.role == "admin" and user.email == "admin@gmail.com" and user.password == "admin123":
        return {"name": "SYSTEM ADMIN", "email": "admin@gmail.com", "role": "admin", "picture": ""}

    if MONGO_AVAILABLE:
        db_user = users_collection.find_one({"email": user.email, "password": user.password, "role": user.role})
        if db_user:
            del db_user["_id"]
            return db_user
    else:
        jdb = _load_json_db()
        matched = [u for u in jdb["users"] if u.get("email") == user.email and u.get("password") == user.password and u.get("role") == user.role]
        if matched:
            return matched[0]

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
