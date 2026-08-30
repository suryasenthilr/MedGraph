from typing import TypedDict, Dict, Any, List, Optional

class MedGraphState(TypedDict, total=False):
    # User Input
    query: str
    mode: str  # "adaptive", "baseline_llm", "baseline_rag", "baseline_fixed_multiagent"

    # Agent outputs
    planner_output: Dict[str, Any]
    retrieval_output: Dict[str, Any]
    kg_output: Dict[str, Any]
    drug_safety_output: Dict[str, Any]
    guideline_output: Dict[str, Any]
    verifier_output: Dict[str, Any]
    final_response: Dict[str, Any]

    # Execution telemetry & traces
    execution_trace: List[Dict[str, Any]]
    total_latency_ms: float
    agents_invoked_count: int
    active_agent_ids: List[str]
    error: Optional[str]
