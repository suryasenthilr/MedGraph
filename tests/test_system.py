import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from medgraph.knowledge_graph import kg_instance
from medgraph.rag import vector_store_instance
from medgraph.agents import (
    PlannerAgent,
    RetrievalAgent,
    KnowledgeGraphAgent,
    DrugSafetyAgent,
    ClinicalGuidelineAgent,
    EvidenceVerificationAgent,
    ResponseAgent
)
from medgraph.graph import execute_medgraph_query, arg_engine
from medgraph.benchmark import benchmark_evaluator

def test_knowledge_graph_stats_and_queries():
    stats = kg_instance.get_graph_stats()
    assert stats["total_nodes"] > 10
    assert stats["total_edges"] > 10

    # Test DDI query: Warfarin + Ibuprofen
    ddi = kg_instance.find_interactions(["Warfarin", "Ibuprofen"])
    assert len(ddi) > 0
    assert ddi[0]["severity"] == "MAJOR"

    # Test Contraindication query: Ibuprofen in CKD
    ci = kg_instance.find_contraindications(["Ibuprofen"], ["Chronic Kidney Disease"])
    assert len(ci) > 0
    assert "CONTRAINDICATED" in ci[0]["severity"]

    # Test Subgraph
    subgraph = kg_instance.get_entity_subgraph(["Warfarin", "Ibuprofen"])
    assert len(subgraph["nodes"]) > 0
    assert len(subgraph["edges"]) > 0

def test_vector_store_rag():
    results = vector_store_instance.search("Warfarin bleeding risk with NSAIDs", top_k=3)
    assert len(results) > 0
    assert any("warfarin" in r["content"].lower() or "bleeding" in r["content"].lower() for r in results)

def test_planner_adaptive_routing():
    planner = PlannerAgent()

    # Simple Query
    simple_state = {"query": "What are the symptoms of dengue fever?"}
    simple_res = planner.run(simple_state)
    p_out = simple_res["planner_output"]
    assert p_out["complexity_score"] <= 2
    assert "retrieval_agent" in p_out["arg_plan"]["active_agents"]

    # Complex Query
    complex_state = {"query": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?"}
    complex_res = planner.run(complex_state)
    p_out2 = complex_res["planner_output"]
    assert p_out2["complexity_score"] >= 4
    assert "kg_agent" in p_out2["arg_plan"]["active_agents"]
    assert "drug_safety_agent" in p_out2["arg_plan"]["active_agents"]
    assert "verifier_agent" in p_out2["arg_plan"]["active_agents"]

def test_end_to_end_adaptive_query():
    query = "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?"
    state = execute_medgraph_query(query, mode="adaptive")

    assert state["mode"] == "adaptive"
    assert state["total_latency_ms"] > 0
    assert len(state["execution_trace"]) >= 5
    assert "final_response" in state
    assert len(state["final_response"]["answer_markdown"]) > 50

def test_benchmark_suite_execution():
    results = benchmark_evaluator.run_benchmark()
    assert "summary" in results
    assert "comparison_chart_data" in results
    assert len(results["comparison_chart_data"]) == 4

    summary = results["summary"]
    assert "adaptive" in summary
    assert "baseline_llm" in summary
    assert "baseline_rag" in summary
    assert "baseline_fixed_multiagent" in summary
    assert summary["adaptive"]["grounding_accuracy_pct"] >= 90.0

if __name__ == "__main__":
    print("Running MedGraph Automated Test Suite...")
    test_knowledge_graph_stats_and_queries()
    print("[PASS] Knowledge Graph Tests Passed")
    test_vector_store_rag()
    print("[PASS] Vector Store RAG Tests Passed")
    test_planner_adaptive_routing()
    print("[PASS] Planner & Dynamic ARG Routing Tests Passed")
    test_end_to_end_adaptive_query()
    print("[PASS] End-to-End Adaptive Execution Tests Passed")
    test_benchmark_suite_execution()
    print("[PASS] Benchmark Suite Evaluation Tests Passed")
    print("\nALL MEDGRAPH TESTS PASSED SUCCESSFULLY! 100% READY.")
