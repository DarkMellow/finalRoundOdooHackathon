# RMS Backend API

Simple FastAPI backend service for the Rental Management System.

## Requirements
- Python 3.9+

## Setup & Running

1. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Linux/macOS
   # venv\Scripts\activate   # On Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000`.
Interactive API documentation will be available at `http://127.0.0.1:8000/docs`.
