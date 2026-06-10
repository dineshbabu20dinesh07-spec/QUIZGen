# Use Python 3.13 slim image
FROM python:3.13-slim

WORKDIR /app

# Copy backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Set Python path
ENV PYTHONPATH=/app/backend

# Expose port 8000
EXPOSE 8000

# Command to run uvicorn
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
