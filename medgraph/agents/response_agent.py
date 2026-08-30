import json
from typing import Dict, Any, List
from .base import BaseAgent
from medgraph.llm import llm_client

class ResponseAgent(BaseAgent):
    """
    Response Generation Agent:
    Synthesizes the validated multi-agent evidence into a clear, grounded,
    clinically rigorous response for healthcare professionals with full provenance.
    """
    def __init__(self):
        super().__init__(name="Response Generation Agent", role="Clinical Decision Synthesizer")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        query = state.get("query", "")
        planner_data = state.get("planner_output", {})
        retrieval_data = state.get("retrieval_output", {})
        kg_data = state.get("kg_output", {})
        safety_data = state.get("drug_safety_output", {})
        guideline_data = state.get("guideline_output", {})
        verifier_data = state.get("verifier_output", {})

        # Prepare evidence context for the LLM
        evidence_summary = []

        # 1. Knowledge Graph Evidence
        if kg_data:
            interactions = kg_data.get("interactions", [])
            contraindications = kg_data.get("contraindications", [])
            if interactions:
                evidence_summary.append("### Structured Knowledge Graph - Drug Interactions:")
                for i in interactions:
                    evidence_summary.append(f"- {i.get('drug_1')} + {i.get('drug_2')}: [{i.get('severity')}] {i.get('description')}")
            if contraindications:
                evidence_summary.append("### Structured Knowledge Graph - Contraindications:")
                for c in contraindications:
                    evidence_summary.append(f"- {c.get('drug')} in {c.get('disease')}: [{c.get('severity')}] {c.get('description')}")

        # 2. Drug Safety Evidence
        if safety_data:
            alerts = safety_data.get("safety_alerts", [])
            alts = safety_data.get("safe_alternatives", [])
            if alerts:
                evidence_summary.append("### Drug Safety Assessment:")
                for a in alerts:
                    evidence_summary.append(f"- [{a.get('severity')}] {a.get('title')}: {a.get('description')}")
            if alts:
                evidence_summary.append("### Recommended Safe Alternatives:")
                for alt in alts:
                    evidence_summary.append(f"- {alt.get('drug')} (Max: {alt.get('max_dose')}): {alt.get('rationale')}")

        # 3. Clinical Guidelines Evidence
        if guideline_data:
            recs = guideline_data.get("recommendations", [])
            if recs:
                evidence_summary.append("### Authoritative Clinical Guidelines:")
                for r in recs:
                    evidence_summary.append(f"- {r.get('organization')} ({r.get('evidence_grade')}): {r.get('text')}")

        # 4. PubMed Literature
        if retrieval_data:
            docs = retrieval_data.get("documents", [])
            if docs:
                evidence_summary.append("### Retrieved PubMed Literature:")
                for d in docs:
                    evidence_summary.append(f"- [{d.get('id')}] {d.get('title')} ({d.get('source', '')}): {d.get('content')[:280]}...")

        # 5. Verification Status
        if verifier_data:
            conf = verifier_data.get("confidence_level", "HIGH")
            grounding = verifier_data.get("grounding_score", 0.95)
            evidence_summary.append(f"### Evidence Verification Status: Confidence {conf} (Grounding Score: {grounding})")

        context_str = "\n\n".join(evidence_summary)

        system_prompt = (
            "You are MedGraph, an advanced AI-powered Clinical Decision Support System assisting healthcare professionals. "
            "Your task is to answer the user's clinical question using the strictly provided multi-source medical evidence below. "
            "Guidelines:\n"
            "1. Give a clear, unambiguous Executive Summary answer first (e.g. CONTRAINDICATED, SAFE WITH MONITORING, RECOMMENDED).\n"
            "2. Provide step-by-step clinical reasoning referencing the evidence (Drug Interactions, Organ Safety/Contraindications, Clinical Guidelines).\n"
            "3. If applicable, recommend safe therapeutic alternatives.\n"
            "4. Maintain a professional, objective medical tone. Do not hallucinate or invent unreferenced facts.\n"
            "5. Include a standard clinical disclaimer."
        )

        user_prompt = (
            f"Clinical Query: \"{query}\"\n\n"
            f"Validated Evidence Context:\n{context_str}\n\n"
            "Generate a structured, evidence-grounded clinical decision support response."
        )

        llm_response = llm_client.generate(system_prompt, user_prompt, temperature=0.1)

        return {
            "final_response": {
                "answer_markdown": llm_response,
                "confidence_score": verifier_data.get("grounding_score", 0.92),
                "confidence_level": verifier_data.get("confidence_level", "HIGH"),
                "citations": [
                    {"source": d.get("source"), "id": d.get("id"), "title": d.get("title")}
                    for d in retrieval_data.get("documents", [])
                ],
                "disclaimer": "MedGraph is a clinical decision support system designed to assist healthcare professionals. It does not replace individualized clinical judgment or diagnostic evaluation."
            }
        }
