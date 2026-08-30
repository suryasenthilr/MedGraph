import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
DATA_DIR = BASE_DIR / "data"

class Settings(BaseSettings):
    # App info
    PROJECT_NAME: str = "MedGraph Clinical Decision Support System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Knowledge Graph (Neo4j or Embedded NetworkX)
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "medgraph_password")
    USE_NEO4J_LIVE: bool = os.getenv("USE_NEO4J_LIVE", "false").lower() in ("true", "1", "yes")

    # LLM API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")

    # Vector Store
    CHROMA_PERSIST_DIR: str = str(DATA_DIR / "chroma_db")
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Seed data paths
    KG_SEED_FILE: Path = DATA_DIR / "kg_seed_data.json"
    GUIDELINES_FILE: Path = DATA_DIR / "medical_guidelines.json"
    PUBMED_FILE: Path = DATA_DIR / "pubmed_sample_corpus.json"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
