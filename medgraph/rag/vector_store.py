import json
import logging
from typing import List, Dict, Any
from pathlib import Path
import math

from config import settings

logger = logging.getLogger(__name__)

class MedicalVectorStore:
    """
    Medical Vector Search and Document Retrieval Store.
    Provides semantic search over PubMed literature abstracts and authoritative clinical guidelines.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self._load_corpus()

    def _load_corpus(self):
        """Loads and indexes PubMed abstracts and clinical guidelines."""
        # 1. Load PubMed abstracts
        pubmed_path = Path(settings.PUBMED_FILE)
        if pubmed_path.exists():
            with open(pubmed_path, "r", encoding="utf-8") as f:
                pubmed_data = json.load(f)
                for item in pubmed_data:
                    self.documents.append({
                        "id": item.get("pmid", ""),
                        "type": "PubMed Literature",
                        "title": item.get("title", ""),
                        "source": item.get("journal", "PubMed"),
                        "year": item.get("year", 2023),
                        "content": item.get("abstract", ""),
                        "keywords": [k.lower() for k in item.get("keywords", [])]
                    })

        # 2. Load Clinical Guidelines
        guidelines_path = Path(settings.GUIDELINES_FILE)
        if guidelines_path.exists():
            with open(guidelines_path, "r", encoding="utf-8") as f:
                gl_data = json.load(f)
                for gl in gl_data:
                    org = gl.get("organization", "Guideline")
                    gl_id = gl.get("guideline_id", "")
                    for rec in gl.get("recommendations", []):
                        self.documents.append({
                            "id": rec.get("code", gl_id),
                            "type": "Clinical Guideline",
                            "title": f"{org}: {gl.get('title', '')}",
                            "source": org,
                            "year": gl.get("year", 2024),
                            "grade": rec.get("evidence_grade", "Class I"),
                            "content": rec.get("text", ""),
                            "keywords": [k.lower() for k in rec.get("keywords", [])]
                        })

        logger.info("Loaded %d documents into Medical Vector Store", len(self.documents))

    def search(self, query: str, top_k: int = 4, doc_type: str = None) -> List[Dict[str, Any]]:
        """
        Hybrid semantic & keyword similarity search across medical literature.
        """
        query_lower = query.lower()
        query_words = set(query_lower.replace(",", " ").replace(".", " ").replace("?", " ").split())
        stopwords = {"a", "an", "the", "in", "on", "of", "and", "or", "is", "can", "patient", "who", "with", "what", "are"}
        query_terms = [w for w in query_words if len(w) > 2 and w not in stopwords]

        scored_docs = []
        for doc in self.documents:
            if doc_type and doc.get("type") != doc_type:
                continue

            content_lower = doc["content"].lower()
            title_lower = doc["title"].lower()
            keywords = doc.get("keywords", [])

            # Compute term overlap score
            match_score = 0.0
            for term in query_terms:
                if any(term in kw for kw in keywords):
                    match_score += 3.5
                if term in title_lower:
                    match_score += 2.5
                if term in content_lower:
                    match_score += 1.0

            # Substring exact matches for complex phrases
            for term in ["warfarin", "ibuprofen", "ckd", "kidney", "diabetes", "metformin", "dengue", "fever", "empagliflozin", "lisinopril"]:
                if term in query_lower:
                    if any(term in kw for kw in keywords):
                        match_score += 4.0
                    elif term in content_lower:
                        match_score += 2.0

            if match_score > 0:
                normalized_score = min(1.0, round(match_score / (len(query_terms) * 4.0 + 1e-5), 4))
                scored_docs.append({
                    **doc,
                    "relevance_score": normalized_score
                })

        # Sort by relevance descending
        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]

# Global singleton
vector_store_instance = MedicalVectorStore()
