import json
from typing import Dict, Any, List
from pathlib import Path
from .base import BaseAgent
from config import settings

class ClinicalGuidelineAgent(BaseAgent):
    """
    Clinical Guideline Agent:
    Synthesizes formal clinical guidelines (KDIGO, ADA, CHEST, WHO, NICE)
    and maps them to evidence grades (Class I/IIa/III, Level A/B/C).
    """
    def __init__(self):
        super().__init__(name="Clinical Guideline Agent", role="Evidence-Based Guideline Specialist")
        self.guidelines = []
        self._load_guidelines()

    def _load_guidelines(self):
        gl_path = Path(settings.GUIDELINES_FILE)
        if gl_path.exists():
            with open(gl_path, "r", encoding="utf-8") as f:
                self.guidelines = json.load(f)

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        planner_data = state.get("planner_output", {})
        entities = planner_data.get("entities", {})
        query = state.get("query", "").lower()

        search_tokens = set([query])
        for key in ["drugs", "diseases", "symptoms"]:
            for item in entities.get(key, []):
                search_tokens.add(item.lower())

        matched_recommendations = []
        for gl in self.guidelines:
            org = gl.get("organization", "Guideline")
            title = gl.get("title", "")
            for rec in gl.get("recommendations", []):
                rec_text = rec.get("text", "").lower()
                rec_kws = [k.lower() for k in rec.get("keywords", [])]

                match = False
                for token in search_tokens:
                    if any(token in kw or kw in token for kw in rec_kws) or token in rec_text:
                        match = True
                        break

                if match:
                    matched_recommendations.append({
                        "organization": org,
                        "guideline_title": title,
                        "code": rec.get("code", ""),
                        "text": rec.get("text", ""),
                        "evidence_grade": rec.get("evidence_grade", "Class I, Level A")
                    })

        return {
            "guideline_output": {
                "guidelines_found": len(matched_recommendations),
                "recommendations": matched_recommendations
            }
        }
