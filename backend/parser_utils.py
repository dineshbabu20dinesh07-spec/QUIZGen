import fitz  # PyMuPDF
from docx import Document
import re
import io
import os

# We'll try to import textract for .doc support
try:
    import textract
except ImportError:
    textract = None

def extract_text_from_pdf(file_bytes):
    """Extracts text from a PDF file using PyMuPDF."""
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_bytes):
    """Extracts text from a Word .docx document."""
    doc = Document(io.BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

def extract_text_from_doc(file_bytes, filename):
    """Extracts text from legacy .doc files using textract."""
    if textract is None:
        return "Error: textract library not installed for .doc support."
    
    # textract usually needs a physical file, so we save it temporarily
    temp_filename = f"temp_{filename}"
    with open(temp_filename, "wb") as f:
        f.write(file_bytes)
    
    try:
        text = textract.process(temp_filename).decode('utf-8')
        return text
    except Exception as e:
        return f"Error extracting .doc: {str(e)}"
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def parse_quiz_content(text):
    """
    Fallback parser using regex if AI fails.
    """
    questions = []
    lines = text.split('\n')
    current_q = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
            
        # Question pattern (e.g. 1. What is...)
        if re.match(r'^\d+[\.\)]', line):
            if current_q and len(current_q["options"]) >= 2:
                questions.append(current_q)
            current_q = {"question": line, "options": [], "answer": ""}
        
        # Options pattern (e.g. A) Option)
        elif re.match(r'^[A-Da-d][\.\)]', line) and current_q:
            current_q["options"].append(line)
            
    if current_q and len(current_q["options"]) >= 2:
        questions.append(current_q)
        
    return questions
