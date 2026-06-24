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
    """Extracts text from a Word .docx document, preserving bold markers for answer detection."""
    doc = Document(io.BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        line = ""
        for run in para.runs:
            if run.bold:
                # Mark bold text with ** so regex can detect correct answers
                line += f"**{run.text}**"
            else:
                line += run.text
        if line.strip():
            full_text.append(line)
    
    # Also extract from tables (MCQs often in tables)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                cell_text = cell.text.strip()
                if cell_text:
                    full_text.append(cell_text)
    
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
    Improved fallback parser using regex if AI fails.
    Detects answers from:
    - Bold markers (**Answer**)
    - Answer key lines (Answer: C, Ans: B, Correct: A)
    - Starred/marked options (*C) opt)
    """
    questions = []
    lines = text.split('\n')
    current_q = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Question pattern (e.g. "1. What is..." or "1) What is...")
        if re.match(r'^\d+[\.\)]\s+\S', line):
            if current_q and len(current_q["options"]) >= 2:
                questions.append(current_q)
            # Clean question text
            q_text = re.sub(r'\*\*', '', line)  # Remove bold markers
            current_q = {"question": q_text, "options": [], "answer": ""}
        
        # Options pattern (e.g. "A) Option" or "A. Option")
        elif re.match(r'^[A-Da-d][\.\)]\s*', line) and current_q:
            # Check if this option is marked as bold (correct answer)
            is_bold = '**' in line
            clean_option = re.sub(r'\*\*', '', line).strip()
            current_q["options"].append(clean_option)
            if is_bold and not current_q["answer"]:
                current_q["answer"] = clean_option
        
        # Answer key line (e.g. "Answer: C" or "Ans: B" or "Correct Answer: A)")
        elif re.match(r'^(Answer|Ans|Correct\s*Answer)\s*[:\-]?\s*[A-Da-d]', line, re.IGNORECASE) and current_q:
            match = re.search(r'[A-Da-d][\.\)]?', line)
            if match and current_q["options"]:
                letter = match.group().rstrip('.)').upper()
                # Find option matching this letter
                for opt in current_q["options"]:
                    if opt.upper().startswith(letter):
                        current_q["answer"] = opt
                        break
    
    # Add the last question
    if current_q and len(current_q["options"]) >= 2:
        questions.append(current_q)
    
    return questions
