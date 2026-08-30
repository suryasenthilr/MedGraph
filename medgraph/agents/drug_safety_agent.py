from typing import Dict, Any, List
from .base import BaseAgent

class DrugSafetyAgent(BaseAgent):
    """
    Drug Safety Agent:
    Specialized agent for deep medication-related safety:
    - Drug-Drug Interaction severity analysis
    - Disease-specific contraindications (Renal/Hepatic/Ulcer)
    - Organ toxicity risk assessment
    - Recommended safe therapeutic alternatives
    """
    def __init__(self):
        super().__init__(name="Drug Safety Agent", role="Pharmacovigilance & Medication Safety Specialist")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        planner_data = state.get("planner_output", {})
        entities = planner_data.get("entities", {})
        drugs = entities.get("drugs", [])
        diseases = entities.get("diseases", [])

        kg_data = state.get("kg_output", {})
        interactions = kg_data.get("interactions", [])
        contraindications = kg_data.get("contraindications", [])

        safety_alerts = []
        overall_risk = "LOW"

        # Evaluate interactions
        for inter in interactions:
            sev = inter.get("severity", "MODERATE")
            if sev == "MAJOR":
                overall_risk = "CRITICAL"
            elif sev == "MODERATE" and overall_risk != "CRITICAL":
                overall_risk = "MODERATE"

            safety_alerts.append({
                "category": "Drug-Drug Interaction",
                "severity": sev,
                "title": f"Interaction: {inter.get('drug_1')} + {inter.get('drug_2')}",
                "description": inter.get("description", ""),
                "action": "Avoid combination or require strict clinical monitoring"
            })

        # Evaluate contraindications
        for ci in contraindications:
            sev = ci.get("severity", "CONTRAINDICATED")
            overall_risk = "CRITICAL"
            safety_alerts.append({
                "category": "Drug-Disease Contraindication",
                "severity": sev,
                "title": f"Contraindication: {ci.get('drug')} in {ci.get('disease')}",
                "description": ci.get("description", ""),
                "action": "Do not administer; select renal/safe alternative"
            })

        # Heuristic alternative recommendations
        safe_alternatives = []
        drugs_lower = [d.lower() for d in drugs]
        if "ibuprofen" in drugs_lower or "naproxen" in drugs_lower:
            if "chronic kidney disease" in [d.lower() for d in diseases] or "warfarin" in drugs_lower:
                safe_alternatives.append({
                    "indication": "Analgesia / Antipyresis",
                    "drug": "Paracetamol (Acetaminophen)",
                    "max_dose": "2g / day",
                    "rationale": "Does not impair renal prostaglandin synthesis or inhibit platelet COX-1; safe in CKD and anticoagulated patients."
                })

        return {
            "drug_safety_output": {
                "overall_risk_level": overall_risk,
                "safety_alerts": safety_alerts,
                "safe_alternatives": safe_alternatives,
                "requires_renal_dose_adjustment": any("kidney" in d.lower() or "ckd" in d.lower() for d in diseases)
            }
        }
