import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from backend root or parent
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'codebuddy-super-secret-jwt-key-2025')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'codebuddy-jwt-signing-secret-key-9876')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_EXPIRES_HOURS', '24')))

    # Default to sqlite if MySQL is not specified
    # For MySQL: mysql+pymysql://root:password@localhost:3306/codebuddy
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'codebuddy.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if 'mysql' in os.getenv('DATABASE_URL', '') else {}

    # Judge0 Code Execution
    # Supports public Judge0 CE or RapidAPI Judge0
    JUDGE0_API_URL = os.getenv('JUDGE0_API_URL', 'https://judge0-ce.p.rapidapi.com')
    JUDGE0_API_KEY = os.getenv('JUDGE0_API_KEY', '')
    JUDGE0_API_HOST = os.getenv('JUDGE0_API_HOST', 'judge0-ce.p.rapidapi.com')

    # AI Coding Assistant
    AI_API_KEY = os.getenv('AI_API_KEY', '')
    AI_API_PROVIDER = os.getenv('AI_API_PROVIDER', 'auto') # 'gemini', 'openai', 'claude', or 'auto'
    AI_MODEL = os.getenv('AI_MODEL', 'gemini-1.5-flash')

    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
