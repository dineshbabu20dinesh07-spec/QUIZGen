from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, APIRouter, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from parser_utils import extract_text_from_pdf, extract_text_from_docx, extract_text_from_doc
import os
import json
import re
from datetime import datetime, timedelta
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

# ─────────────────────────────────────────────
# Import our new modules
# ─────────────────────────────────────────────
from auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from rbac import require_role, require_admin, require_superadmin, get_role_permissions
from tenants import (
    get_domain_id,
    get_all_allowed_origins,
    create_domain as create_domain_record,
    get_all_domains,
    get_domain_by_id,
    init_tenants,
    DEFAULT_DOMAIN,
)
from api_keys import (
    generate_api_key,
    list_api_keys,
    revoke_api_key,
    require_api_key,
    init_api_keys,
)

load_dotenv()

app = FastAPI(
    title="QUIZGen API",
    description="AI-powered quiz generation platform with multi-tenant support",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─────────────────────────────────────────────
# MongoDB Setup with Graceful Fallback
# ─────────────────────────────────────────────
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
MONGO_AVAILABLE = False
quizzes_collection = None
users_collection = None
attempts_collection = None
domains_collection = None
api_keys_collection = None

try:
    from pymongo import MongoClient
    from bson import ObjectId
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    mongo_client.server_info()
    db = mongo_client["quizgen_db"]
    quizzes_collection = db["quizzes"]
    users_collection = db["users"]
    attempts_collection = db["attempts"]
    domains_collection = db["domains"]
    api_keys_collection = db["api_keys"]

    # Indexes
    try:
        users_collection.create_index([("email", 1), ("domain_id", 1)], unique=True)
        api_keys_collection.create_index("key", unique=True)
        domains_collection.create_index("domain_id", unique=True)
    except Exception:
        pass

    # Seed default domain if not present
    if not domains_collection.find_one({"domain_id": "default"}):
        domains_collection.insert_one(DEFAULT_DOMAIN)

    MONGO_AVAILABLE = True
    print("[OK] MongoDB Connected Successfully!")
except Exception as e:
    print(f"[WARN] MongoDB not available: {e}")
    print("[INFO] Falling back to local JSON file storage...")

# Inject DB into tenant and api_key modules
init_tenants(domains_collection, MONGO_AVAILABLE)
init_api_keys(api_keys_collection, MONGO_AVAILABLE)

# ─────────────────────────────────────────────
# CORS — Dynamically loaded from domain registry
# ─────────────────────────────────────────────
allowed_origins = get_all_allowed_origins()

# Always include these production + local origins
PRODUCTION_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://quiz-gen-two.vercel.app",
    "https://quizgen-2.onrender.com",
    "https://quiz-gen-two-git-main-dineshbabu20dinesh07-4145.vercel.app",
]

# Add any env-configured extra origins
EXTRA_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "")
if EXTRA_ORIGINS:
    PRODUCTION_ORIGINS += [o.strip() for o in EXTRA_ORIGINS.split(",") if o.strip()]

# Merge all
for origin in PRODUCTION_ORIGINS:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,      # Required for cookies!
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Configure Gemini
# ─────────────────────────────────────────────
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
# JSON Fallback Storage (when MongoDB is down)
# ─────────────────────────────────────────────
DB_FILE = os.path.join(os.path.dirname(__file__), "quiz_db.json")

def _load_json_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"quizzes": [], "users": [], "attempts": [], "current_quiz": {"questions": []}}

def _save_json_db(data: dict):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

# ─────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    role: str
    domain_id: Optional[str] = "default"

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class GoogleLogin(BaseModel):
    email: str
    name: str
    role: str
    picture: Optional[str] = ""

class DomainCreate(BaseModel):
    domain_id: str
    name: str
    allowed_origins: list
    plan: str = "basic"

class APIKeyCreate(BaseModel):
    owner_email: str
    owner_role: str
    label: str = ""

# ─────────────────────────────────────────────
# Gemini AI Analysis
# ─────────────────────────────────────────────

def extract_json_from_response(text):
    """Robustly extract JSON array from Gemini response (handles markdown code blocks)"""
    # Remove markdown code block wrappers
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    # Try to find JSON array
    json_match = re.search(r'\[.*\]', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except Exception:
            pass
    # Try to parse the whole text as JSON
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except Exception:
        pass
    return []


def analyze_chunk_with_gemini(text_chunk):
    if not gemini_client:
        return []
    prompt = f"""You are a quiz extraction assistant. Extract all multiple choice questions (MCQs) from the text below.

For each question, identify:
- The question text
- All answer options (A, B, C, D)
- The correct answer (look for bold, underlined, starred, or marked options. If answer key is given like 'Answer: C' use that.)

Return ONLY a valid JSON array like this (no markdown, no explanation):
[
  {{"question": "What is X?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "answer": "A) opt1"}}
]

If no MCQs found, return empty array: []

TEXT TO ANALYZE:
{text_chunk}"""
    
    # Try gemini-2.5-flash first, fallback to gemini-1.5-flash
    for model in ['gemini-2.5-flash', 'gemini-1.5-flash']:
        try:
            response = gemini_client.models.generate_content(
                model=model,
                contents=prompt,
            )
            result = extract_json_from_response(response.text)
            if result:
                print(f"Gemini ({model}) extracted {len(result)} questions")
                return result
        except Exception as e:
            print(f"Gemini {model} error: {e}")
            continue
    return []


def analyze_full_document(text):
    chunk_size = 8000  # Larger chunks = fewer API calls
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    all_questions = []
    print(f"Total Chunks to process: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}/{len(chunks)}...")
        chunk_results = analyze_chunk_with_gemini(chunk)
        all_questions.extend(chunk_results)
    print(f"Total questions extracted by Gemini: {len(all_questions)}")
    return all_questions

# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "2.0.0",
        "mongo_available": MONGO_AVAILABLE,
        "storage_mode": "MongoDB" if MONGO_AVAILABLE else "Local JSON Fallback",
        "features": ["paging", "cookie-auth", "rbac", "multi-domain", "api-keys"],
    }

# ─────────────────────────────────────────────
# AUTH ROUTES (Cookie-based)
# ─────────────────────────────────────────────

@app.post("/signup")
async def signup(user: UserCreate):
    domain_id = user.domain_id or "default"
    hashed_pwd = hash_password(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pwd,
        "phone": user.phone,
        "role": user.role,
        "domain_id": domain_id,
        "created_at": datetime.utcnow().isoformat(),
    }

    if MONGO_AVAILABLE:
        if users_collection.find_one({"email": user.email, "domain_id": domain_id, "role": user.role}):
            raise HTTPException(status_code=400, detail="User already exists for this role.")
        users_collection.insert_one(new_user)
        new_user.pop("_id", None)
    else:
        jdb = _load_json_db()
        existing = [
            u for u in jdb["users"]
            if u.get("email") == user.email
            and u.get("domain_id", "default") == domain_id
            and u.get("role") == user.role
        ]
        if existing:
            raise HTTPException(status_code=400, detail="User already exists for this role.")
        jdb["users"].append(new_user)
        _save_json_db(jdb)

    new_user.pop("password", None)  # Never return password
    return {"message": "Signup successful", "user": new_user}


@app.post("/signin")
async def signin(request: Request, user: UserLogin):
    from fastapi.responses import JSONResponse as JR
    domain_id = get_domain_id(request)

    # Hardcoded superadmin (dev only — remove in production)
    if user.email == "admin@gmail.com" and user.password == "admin123" and user.role == "admin":
        user_data = {"name": "SYSTEM ADMIN", "email": "admin@gmail.com", "role": "admin", "domain_id": "default"}
        token = create_access_token({
            "sub": user_data["email"],
            "role": user_data["role"],
            "domain_id": user_data["domain_id"],
            "name": user_data["name"],
        })
        res = JR(content={"message": "Login successful", "user": user_data})
        res.set_cookie(
            key="session",
            value=token,
            httponly=True,
            samesite="none",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=True,  # Required for cross-domain (Vercel -> Render)
        )
        return res

    # Normal DB lookup
    db_user = None
    if MONGO_AVAILABLE:
        db_user = users_collection.find_one({"email": user.email, "role": user.role, "domain_id": domain_id})
    else:
        jdb = _load_json_db()
        matches = [
            u for u in jdb["users"]
            if u.get("email") == user.email 
            and u.get("role") == user.role
            and u.get("domain_id", "default") == domain_id
        ]
        db_user = matches[0] if matches else None

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password — support both plain-text (legacy) and hashed
    stored_pwd = db_user.get("password", "")
    password_ok = False
    try:
        password_ok = verify_password(user.password, stored_pwd)
    except Exception:
        # Legacy plain-text fallback
        password_ok = (user.password == stored_pwd)

    if not password_ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_data = {
        "name": db_user.get("name", ""),
        "email": db_user.get("email", ""),
        "role": db_user.get("role", ""),
        "domain_id": db_user.get("domain_id", "default"),
    }

    token = create_access_token({
        "sub": user_data["email"],
        "role": user_data["role"],
        "domain_id": user_data["domain_id"],
        "name": user_data["name"],
    })

    res = JR(content={"message": "Login successful", "user": user_data})
    res.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=True,  # Required for cross-domain (Vercel -> Render)
    )
    return res


@app.post("/signin-google")
async def signin_google(request: Request, user_data: GoogleLogin):
    from fastapi.responses import JSONResponse as JR
    domain_id = get_domain_id(request)
    
    # 1. Check if user exists, if not register them
    db_user = None
    if MONGO_AVAILABLE:
        db_user = users_collection.find_one({"email": user_data.email, "role": user_data.role, "domain_id": domain_id})
    else:
        jdb = _load_json_db()
        matches = [
            u for u in jdb["users"]
            if u.get("email") == user_data.email 
            and u.get("role") == user_data.role
            and u.get("domain_id", "default") == domain_id
        ]
        db_user = matches[0] if matches else None
        
    if not db_user:
        # Auto register Google user
        new_user = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hash_password("google-oauth-placeholder-password"),
            "phone": "",
            "role": user_data.role,
            "domain_id": domain_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        if MONGO_AVAILABLE:
            users_collection.insert_one(new_user)
            db_user = new_user
        else:
            jdb = _load_json_db()
            jdb["users"].append(new_user)
            _save_json_db(jdb)
            db_user = new_user
            
    # 2. Create JWT token
    token = create_access_token({
        "sub": db_user.get("email"),
        "role": db_user.get("role"),
        "domain_id": db_user.get("domain_id", "default"),
        "name": db_user.get("name"),
    })
    
    response_user = {
        "name": db_user.get("name"),
        "email": db_user.get("email"),
        "role": db_user.get("role"),
        "domain_id": db_user.get("domain_id", "default"),
        "picture": user_data.picture
    }
    
    res = JR(content={"message": "Google Login successful", "user": response_user})
    res.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=True,  # Required for cross-domain (Vercel -> Render)
    )
    return res


@app.post("/logout")
async def logout():
    from fastapi.responses import JSONResponse as JR
    res = JR(content={"message": "Logged out successfully"})
    res.delete_cookie("session")
    return res


@app.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return current logged-in user info from cookie session."""
    return {
        "email": current_user.get("sub"),
        "role": current_user.get("role"),
        "name": current_user.get("name"),
        "domain_id": current_user.get("domain_id"),
        "permissions": get_role_permissions(current_user.get("role", "")),
    }

# ─────────────────────────────────────────────
# QUIZ ROUTES (with RBAC + Pagination + Domain)
# ─────────────────────────────────────────────

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("faculty", "admin")),  # RBAC ✅
):
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Major Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-quiz")
async def save_quiz(
    data: dict,
    current_user: dict = Depends(require_role("faculty", "admin")),  # RBAC ✅
    domain_id: str = Depends(get_domain_id),                          # Multi-domain ✅
):
    if "created_at" not in data:
        data["created_at"] = datetime.utcnow().isoformat()
    if "title" not in data:
        data["title"] = data.get("filename", "Untitled Quiz")

    data["domain_id"] = domain_id
    data["faculty_email"] = current_user.get("sub")

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
async def get_all_quizzes(
    page: int = Query(default=1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page (max 100)"),
    current_user: dict = Depends(require_role("faculty", "admin")),   # RBAC ✅
    domain_id: str = Depends(get_domain_id),                           # Multi-domain ✅
):
    """Get all quizzes with pagination. Admin sees all, faculty sees own."""
    skip = (page - 1) * page_size
    role = current_user.get("role")
    email = current_user.get("sub")

    if MONGO_AVAILABLE:
        query = {"_id": {"$ne": "current_quiz"}, "domain_id": domain_id}
        if role == "faculty":
            query["faculty_email"] = email     # Faculty sees only own quizzes

        total = quizzes_collection.count_documents(query)
        quizzes = list(
            quizzes_collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        )
        for q in quizzes:
            q["_id"] = str(q["_id"])
    else:
        jdb = _load_json_db()
        all_q = [
            q for q in reversed(jdb.get("quizzes", []))
            if q.get("domain_id", "default") == domain_id
        ]
        if role == "faculty":
            all_q = [q for q in all_q if q.get("faculty_email") == email]
        total = len(all_q)
        quizzes = all_q[skip: skip + page_size]

    return {
        "items": quizzes,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@app.get("/faculty-quizzes")
async def get_faculty_quizzes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(require_role("faculty", "admin")),   # RBAC ✅
    domain_id: str = Depends(get_domain_id),
):
    email = current_user.get("sub")
    skip = (page - 1) * page_size

    if MONGO_AVAILABLE:
        query = {"faculty_email": email, "_id": {"$ne": "current_quiz"}, "domain_id": domain_id}
        total = quizzes_collection.count_documents(query)
        quizzes = list(
            quizzes_collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        )
        for q in quizzes:
            q["_id"] = str(q["_id"])
    else:
        jdb = _load_json_db()
        all_q = [
            q for q in reversed(jdb.get("quizzes", []))
            if q.get("faculty_email") == email and q.get("domain_id", "default") == domain_id
        ]
        total = len(all_q)
        quizzes = all_q[skip: skip + page_size]

    return {
        "items": quizzes,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@app.get("/get-quiz")
async def get_quiz(domain_id: str = Depends(get_domain_id)):
    """Get current quiz (no auth needed — students access this)."""
    if MONGO_AVAILABLE:
        # 1. Try exact current_quiz for this domain
        quiz = quizzes_collection.find_one({"_id": "current_quiz", "domain_id": domain_id})
        if not quiz:
            # 2. Try current_quiz any domain
            quiz = quizzes_collection.find_one({"_id": "current_quiz"})
        if not quiz:
            # 3. Fallback: get the latest quiz saved (any domain)
            quiz = quizzes_collection.find_one(
                {"_id": {"$ne": "current_quiz"}},
                sort=[("created_at", -1)]
            )
        if quiz:
            quiz["_id"] = str(quiz["_id"])
            return quiz
        return {"questions": []}
    else:
        jdb = _load_json_db()
        return jdb.get("current_quiz", {"questions": []})


@app.post("/submit-attempt")
async def submit_attempt(
    data: dict,
    current_user: dict = Depends(require_role("student", "faculty", "admin")),  # RBAC ✅
    domain_id: str = Depends(get_domain_id),
):
    data["timestamp"] = datetime.utcnow().isoformat()
    data["domain_id"] = domain_id
    data["student_email"] = current_user.get("sub")

    if MONGO_AVAILABLE:
        attempts_collection.insert_one(data)
    else:
        jdb = _load_json_db()
        jdb["attempts"].append(data)
        _save_json_db(jdb)
    return {"message": "Attempt saved"}


@app.get("/student-attempts")
async def get_student_attempts(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),                    # RBAC ✅
    domain_id: str = Depends(get_domain_id),
):
    email = current_user.get("sub")
    role = current_user.get("role")
    skip = (page - 1) * page_size

    if MONGO_AVAILABLE:
        query = {"student_email": email, "domain_id": domain_id}
        if role == "admin":
            query = {"domain_id": domain_id}  # Admin sees all attempts

        total = attempts_collection.count_documents(query)
        attempts = list(
            attempts_collection.find(query)
            .sort("timestamp", -1)
            .skip(skip)
            .limit(page_size)
        )
        for a in attempts:
            a["_id"] = str(a["_id"])
    else:
        jdb = _load_json_db()
        all_a = [
            a for a in reversed(jdb.get("attempts", []))
            if a.get("domain_id", "default") == domain_id
        ]
        if role != "admin":
            all_a = [a for a in all_a if a.get("student_email") == email]
        total = len(all_a)
        attempts = all_a[skip: skip + page_size]

    return {
        "items": attempts,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }

# ─────────────────────────────────────────────
# ADMIN — Domain Management (Superadmin)
# ─────────────────────────────────────────────

@app.post("/admin/domains")
async def create_domain(
    domain: DomainCreate,
    current_user: dict = Depends(require_admin),  # RBAC: admin only ✅
):
    domain_data = {
        **domain.dict(),
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = create_domain_record(domain_data)
    return {"message": "Domain created successfully", "domain": result}


@app.get("/admin/domains")
async def list_domains(
    current_user: dict = Depends(require_admin),  # RBAC: admin only ✅
):
    return get_all_domains()

# ─────────────────────────────────────────────
# ADMIN — API Key Management
# ─────────────────────────────────────────────

@app.post("/admin/api-keys")
async def create_api_key(
    key_data: APIKeyCreate,
    current_user: dict = Depends(require_admin),   # RBAC: admin only ✅
    domain_id: str = Depends(get_domain_id),
):
    key = generate_api_key(
        owner_email=key_data.owner_email,
        owner_role=key_data.owner_role,
        domain_id=domain_id,
        label=key_data.label,
    )
    return {
        "message": "API key generated. Store it safely — shown only once!",
        "api_key": key,
    }


@app.get("/admin/api-keys")
async def get_api_keys(
    current_user: dict = Depends(require_admin),   # RBAC: admin only ✅
    domain_id: str = Depends(get_domain_id),
):
    return list_api_keys(domain_id=domain_id)


@app.delete("/admin/api-keys/{key_prefix}")
async def delete_api_key(
    key_prefix: str,
    current_user: dict = Depends(require_admin),   # RBAC: admin only ✅
    domain_id: str = Depends(get_domain_id),
):
    success = revoke_api_key(key_prefix, domain_id)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key revoked successfully"}

# ─────────────────────────────────────────────
# EXTERNAL API v1 (API Key Auth)
# ─────────────────────────────────────────────
api_v1 = APIRouter(prefix="/api/v1", tags=["External API v1"])

@api_v1.get("/quizzes")
async def ext_list_quizzes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    key_user: dict = Depends(require_api_key),     # API Key auth ✅
):
    """External API: List quizzes. Requires X-API-Key header."""
    domain_id = key_user.get("domain_id", "default")
    skip = (page - 1) * page_size

    if MONGO_AVAILABLE:
        query = {"_id": {"$ne": "current_quiz"}, "domain_id": domain_id}
        total = quizzes_collection.count_documents(query)
        quizzes = list(
            quizzes_collection.find(query, {"questions": 0})  # Exclude questions for performance
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        )
        for q in quizzes:
            q["_id"] = str(q["_id"])
    else:
        jdb = _load_json_db()
        all_q = [
            {k: v for k, v in q.items() if k != "questions"}
            for q in reversed(jdb.get("quizzes", []))
            if q.get("domain_id", "default") == domain_id
        ]
        total = len(all_q)
        quizzes = all_q[skip: skip + page_size]

    return {
        "items": quizzes,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@api_v1.get("/quiz/{quiz_id}")
async def ext_get_quiz(
    quiz_id: str,
    key_user: dict = Depends(require_api_key),     # API Key auth ✅
):
    """External API: Get full quiz with questions. Requires X-API-Key header."""
    domain_id = key_user.get("domain_id", "default")

    if MONGO_AVAILABLE:
        try:
            from bson import ObjectId
            quiz = quizzes_collection.find_one(
                {"_id": ObjectId(quiz_id), "domain_id": domain_id}
            )
        except Exception:
            quiz = None
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        quiz["_id"] = str(quiz["_id"])
        return quiz
    else:
        jdb = _load_json_db()
        quiz = next(
            (q for q in jdb.get("quizzes", []) if q.get("_id") == quiz_id and q.get("domain_id", "default") == domain_id),
            None
        )
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        return quiz


@api_v1.get("/health")
async def ext_health():
    """External API health check (no auth needed)."""
    return {"status": "ok", "api_version": "v1"}


app.include_router(api_v1)

# ─────────────────────────────────────────────
# Serve static files and React app
# ─────────────────────────────────────────────
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
