"""
Vercel Serverless Function — wraps the FastAPI app.
Vercel automatically picks up api/index.py as the /api route handler.
"""

import sys
import os

# Add the backend directory to the Python path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
