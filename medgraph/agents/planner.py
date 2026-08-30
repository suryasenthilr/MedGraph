import re
from typing import Dict, Any, List
from .base import BaseAgent
from medgraph.knowledge_graph import kg_instance

class PlannerAgent(BaseAgent):
    """
    Planner Agent: The brain of the Adaptive Reasoning Graph (ARG).
    Analyzes the user's clinical query, classifies intent, extracts medical entities,
    computes complexity, and dynamically constructs the runtime reasoning DAG.
    """
    def __init__(self):
        super().__init__(name="Planner Agent", role="Dynamic Workflow & ARG Synthesizer")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        query = state.get("query", "").strip()

        # 1. Entity Extraction
        entities = self._extract_entities(query)

        # 2. Intent Classification
        intent = self._classify_intent(query, entities)

        # 3. Complexity Scoring (1 to 5)
        complexity_score, complexity_level = self._evaluate_complexity(query, entities, intent)

        # 4. Dynamic ARG Workflow Construction
        arg_plan = self._construct_arg_workflow(intent, entities, complexity_score)

        return {
            "planner_output": {
                "intent": intent,
                "entities": entities,
                "complexity_score": complexity_score,
                "complexity_level": complexity_level,
                "arg_plan": arg_plan,
                "rationale": arg_plan["rationale"]
            }
        }

    def _extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extracts medical drugs, diseases, symptoms, and tests from the query."""
        q_lower = query.lower()
        extracted = {
            "drugs": [],
            "diseases": [],
            "symptoms": [],
            "tests": []
        }

        # Match against KG known entities
        for ent_id, ent in kg_instance.entities_by_id.items():
            name = ent["name"]
            name_lower = name.lower()

            pattern = r'\b' + re.escape(name_lower) + r'\b'
            if re.search(pattern, q_lower) or (name_lower in q_lower and len(name_lower) > 4):
                ent_type = ent.get("type")
                if ent_type == "Drug" and name not in extracted["drugs"]:
                    extracted["drugs"].append(name)
                elif ent_type == "Disease" and name not in extracted["diseases"]:
                    extracted["diseases"].append(name)
                elif ent_type == "Symptom" and name not in extracted["symptoms"]:
                    extracted["symptoms"].append(name)
                elif ent_type == "LabTest" and name not in extracted["tests"]:
                    extracted["tests"].append(name)

        # Clinical alias heuristics
        if "diabetic" in q_lower or "diabetes" in q_lower:
            if "Diabetes Mellitus Type 2" not in extracted["diseases"]:
                extracted["diseases"].append("Diabetes Mellitus Type 2")

        if "kidney disease" in q_lower or "ckd" in q_lower or "renal" in q_lower:
            if "Chronic Kidney Disease" not in extracted["diseases"]:
                extracted["diseases"].append("Chronic Kidney Disease")

        if "dengue" in q_lower and "Dengue Fever" not in extracted["diseases"]:
            extracted["diseases"].append("Dengue Fever")

        return extracted

    def _classify_intent(self, query: str, entities: Dict[str, List[str]]) -> str:
        """Classifies clinical intent."""
        q_lower = query.lower()
        num_drugs = len(entities["drugs"])
        num_diseases = len(entities["diseases"])

        # Check symptom/presentation inquiry first if no drugs are being evaluated
        if ("symptom" in q_lower or "sign" in q_lower or "presentation" in q_lower or "what is" in q_lower or "what are" in q_lower) and num_drugs == 0:
            return "disease_symptoms"

        if any(w in q_lower for w in ["safely use", "take together", "interact", "safe to take", "can i take", "contraindicated", "side effect", "adverse"]):
            return "drug_safety"

        if any(w in q_lower for w in ["guideline", "recommendation", "recommendations", "kdigo", "ada", "who", "first line", "treatment protocol", "management"]):
            return "clinical_guidelines"

        if num_drugs >= 2 or (num_drugs >= 1 and num_diseases >= 1):
            return "drug_safety"

        if num_diseases >= 1 and not entities["drugs"]:
            return "disease_inquiry"

        return "general_medical"

    def _evaluate_complexity(self, query: str, entities: Dict[str, List[str]], intent: str) -> (int, str):
        """
        Calibrated Clinical Complexity Scale (1 to 5):
        - Score 1: Simple single-condition or symptom query (e.g. Dengue symptoms)
        - Score 2: Low-moderate diagnostic or basic disease workup
        - Score 3: Moderate guideline recommendation or single-drug dosing query (e.g. Metformin in eGFR)
        - Score 4: Complex multi-drug or single-drug comorbidity interaction
        - Score 5: Critical polypharmacy multi-morbidity with high organ risk (e.g. Warfarin + Ibuprofen + CKD)
        """
        q_lower = query.lower()
        num_drugs = len(entities["drugs"])
        num_diseases = len(entities["diseases"])

        # Rule 1: Simple symptom / informational queries with zero drugs
        if intent in ["disease_symptoms", "disease_inquiry", "general_medical"] and num_drugs == 0:
            score = 1

        # Rule 2: Guideline / renal dosing recommendations with 1 drug/disease
        elif intent == "clinical_guidelines":
            score = 3
            if num_drugs >= 2 or num_diseases >= 2:
                score = 4

        # Rule 3: Drug safety queries
        elif intent == "drug_safety":
            score = 2
            if num_drugs >= 2:
                score += 2
            elif num_drugs == 1:
                score += 1

            if num_diseases >= 1:
                score += 1

            if any(k in q_lower for k in ["bleeding", "kidney", "renal", "dialysis", "contraindicated", "toxicity", "severe", "warfarin"]):
                score += 1
        else:
            score = 2

        score = max(1, min(5, score))
        levels = {
            1: "Simple",
            2: "Low-Moderate",
            3: "Moderate",
            4: "Complex",
            5: "Critical Multi-Morbidity"
        }
        return score, levels[score]

    def _construct_arg_workflow(self, intent: str, entities: Dict[str, List[str]], complexity: int) -> Dict[str, Any]:
        """
        Dynamically constructs the Adaptive Reasoning Graph (nodes, edges, active agents).
        """
        if complexity == 1 and intent in ["disease_symptoms", "disease_inquiry", "general_medical"]:
            # Simple Path: Planner -> Retrieval -> Response Generator
            active_agents = ["planner_agent", "retrieval_agent", "response_agent"]
            nodes = [
                {"id": "planner_agent", "label": "Planner Agent", "type": "orchestrator", "status": "completed"},
                {"id": "retrieval_agent", "label": "Medical RAG Agent", "type": "retriever", "status": "pending"},
                {"id": "response_agent", "label": "Response Generator", "type": "generator", "status": "pending"}
            ]
            edges = [
                {"from": "planner_agent", "to": "retrieval_agent"},
                {"from": "retrieval_agent", "to": "response_agent"}
            ]
            rationale = "Simple single-topic inquiry (Complexity 1/5). Dynamically pruned heavy graph and drug safety engines, routing directly through Medical Literature RAG and Response Generation to minimize latency."

        elif complexity <= 3 and intent == "clinical_guidelines":
            # Guideline Path: Planner -> Retrieval -> Guideline Agent -> Verification -> Response
            active_agents = ["planner_agent", "retrieval_agent", "guideline_agent", "verifier_agent", "response_agent"]
            nodes = [
                {"id": "planner_agent", "label": "Planner Agent", "type": "orchestrator", "status": "completed"},
                {"id": "retrieval_agent", "label": "Medical RAG Agent", "type": "retriever", "status": "pending"},
                {"id": "guideline_agent", "label": "Clinical Guideline Agent", "type": "specialist", "status": "pending"},
                {"id": "verifier_agent", "label": "Evidence Verification", "type": "verifier", "status": "pending"},
                {"id": "response_agent", "label": "Response Generator", "type": "generator", "status": "pending"}
            ]
            edges = [
                {"from": "planner_agent", "to": "retrieval_agent"},
                {"from": "retrieval_agent", "to": "guideline_agent"},
                {"from": "guideline_agent", "to": "verifier_agent"},
                {"from": "verifier_agent", "to": "response_agent"}
            ]
            rationale = "Moderate guideline recommendation query (Complexity 3/5). Selectively activating Medical RAG, Clinical Guideline Agent (KDIGO/ADA), and Evidence Verification to validate recommendation cutoffs."

        else:
            # Complex Full Adaptive Reasoning Graph
            # Planner -> [RAG, KG, Drug Safety, Guideline Agent] -> Verification -> Response
            active_agents = [
                "planner_agent",
                "retrieval_agent",
                "kg_agent",
                "drug_safety_agent",
                "guideline_agent",
                "verifier_agent",
                "response_agent"
            ]
            nodes = [
                {"id": "planner_agent", "label": "Planner Agent", "type": "orchestrator", "status": "completed"},
                {"id": "retrieval_agent", "label": "Medical RAG Agent", "type": "retriever", "status": "pending"},
                {"id": "kg_agent", "label": "Knowledge Graph Agent", "type": "knowledge_graph", "status": "pending"},
                {"id": "drug_safety_agent", "label": "Drug Safety Agent", "type": "specialist", "status": "pending"},
                {"id": "guideline_agent", "label": "Clinical Guideline Agent", "type": "specialist", "status": "pending"},
                {"id": "verifier_agent", "label": "Evidence Verification Agent", "type": "verifier", "status": "pending"},
                {"id": "response_agent", "label": "Response Generator", "type": "generator", "status": "pending"}
            ]
            edges = [
                {"from": "planner_agent", "to": "retrieval_agent"},
                {"from": "planner_agent", "to": "kg_agent"},
                {"from": "kg_agent", "to": "drug_safety_agent"},
                {"from": "retrieval_agent", "to": "guideline_agent"},
                {"from": "drug_safety_agent", "to": "verifier_agent"},
                {"from": "guideline_agent", "to": "verifier_agent"},
                {"from": "verifier_agent", "to": "response_agent"}
            ]
            rationale = f"Critical multi-morbidity and polypharmacy query (Complexity {complexity}/5). Dynamically provisioning parallel Medical RAG, Knowledge Graph traversal, Pharmacovigilance Drug Safety, Clinical Guidelines, and Multi-Source Evidence Reconciliation."

        return {
            "active_agents": active_agents,
            "nodes": nodes,
            "edges": edges,
            "rationale": rationale
        }
