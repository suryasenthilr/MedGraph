import time
import logging
from typing import Dict, Any, List
from .state import MedGraphState
from medgraph.agents import (
    PlannerAgent,
    RetrievalAgent,
    KnowledgeGraphAgent,
    DrugSafetyAgent,
    ClinicalGuidelineAgent,
    EvidenceVerificationAgent,
    ResponseAgent
)

logger = logging.getLogger(__name__)

class AdaptiveReasoningGraphEngine:
    """
    Executes the dynamic Adaptive Reasoning Graph (ARG) orchestrated via LangGraph concepts.
    The Planner determines the query-specific workflow at runtime, and only the required
    specialized clinical agents are activated and executed.
    """
    def __init__(self):
        self.planner = PlannerAgent()
        self.retriever = RetrievalAgent()
        self.kg_agent = KnowledgeGraphAgent()
        self.drug_safety = DrugSafetyAgent()
        self.guideline_agent = ClinicalGuidelineAgent()
        self.verifier = EvidenceVerificationAgent()
        self.response_agent = ResponseAgent()

        self.agent_registry = {
            "planner_agent": self.planner,
            "retrieval_agent": self.retriever,
            "kg_agent": self.kg_agent,
            "drug_safety_agent": self.drug_safety,
            "guideline_agent": self.guideline_agent,
            "verifier_agent": self.verifier,
            "response_agent": self.response_agent
        }

    def execute(self, query: str) -> MedGraphState:
        """Runs the complete Adaptive Reasoning Graph pipeline for a given clinical query."""
        overall_start = time.time()
        state: MedGraphState = {
            "query": query,
            "mode": "adaptive",
            "execution_trace": [],
            "total_latency_ms": 0.0,
            "agents_invoked_count": 0,
            "active_agent_ids": []
        }

        # Step 1: Always execute Planner Agent first
        p_res = self.planner.execute(state)
        state["planner_output"] = p_res.get("planner_output", {})
        state["execution_trace"].append({
            "agent_id": "planner_agent",
            "agent_name": "Planner Agent",
            "role": self.planner.role,
            "status": "completed",
            "latency_ms": p_res.get("latency_ms", 0),
            "summary": f"Complexity: {state['planner_output'].get('complexity_score')}/5 ({state['planner_output'].get('complexity_level')}). Intent: {state['planner_output'].get('intent')}"
        })

        arg_plan = state["planner_output"].get("arg_plan", {})
        active_agents = arg_plan.get("active_agents", ["planner_agent", "retrieval_agent", "response_agent"])
        state["active_agent_ids"] = active_agents

        # Step 2: Dynamically execute required agents in the selected plan
        for agent_id in active_agents:
            if agent_id == "planner_agent":
                continue  # Already executed

            agent_instance = self.agent_registry.get(agent_id)
            if not agent_instance:
                continue

            agent_res = agent_instance.execute(state)

            # Map result back to state keys
            if agent_id == "retrieval_agent":
                state["retrieval_output"] = agent_res.get("retrieval_output", {})
                summary = f"Retrieved {len(state['retrieval_output'].get('documents', []))} medical literature documents"
            elif agent_id == "kg_agent":
                state["kg_output"] = agent_res.get("kg_output", {})
                summary = f"Extracted {state['kg_output'].get('total_facts_retrieved', 0)} structured KG relations"
            elif agent_id == "drug_safety_agent":
                state["drug_safety_output"] = agent_res.get("drug_safety_output", {})
                risk = state["drug_safety_output"].get("overall_risk_level", "LOW")
                summary = f"Risk Level: {risk}. Generated {len(state['drug_safety_output'].get('safety_alerts', []))} safety alerts"
            elif agent_id == "guideline_agent":
                state["guideline_output"] = agent_res.get("guideline_output", {})
                summary = f"Matched {state['guideline_output'].get('guidelines_found', 0)} clinical guideline recommendations"
            elif agent_id == "verifier_agent":
                state["verifier_output"] = agent_res.get("verifier_output", {})
                conf = state["verifier_output"].get("confidence_level", "HIGH")
                summary = f"Multi-Source Reconciliation: Confidence {conf} (Grounding: {state['verifier_output'].get('grounding_score', 0.95)})"
            elif agent_id == "response_agent":
                state["final_response"] = agent_res.get("final_response", {})
                summary = "Generated evidence-grounded clinical decision synthesis"
            else:
                summary = "Executed agent"

            state["execution_trace"].append({
                "agent_id": agent_id,
                "agent_name": agent_instance.name,
                "role": agent_instance.role,
                "status": "completed",
                "latency_ms": agent_res.get("latency_ms", 0),
                "summary": summary
            })

        total_time = round((time.time() - overall_start) * 1000, 2)
        state["total_latency_ms"] = total_time
        state["agents_invoked_count"] = len(active_agents)

        return state

# Global singleton
arg_engine = AdaptiveReasoningGraphEngine()
