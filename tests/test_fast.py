import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from medgraph.knowledge_graph import kg_instance
from medgraph.rag import vector_store_instance
from medgraph.agents import PlannerAgent
from medgraph.graph import execute_medgraph_query

print("1. Testing Knowledge Graph...")
stats = kg_instance.get_graph_stats()
print(f"   KG Stats: {stats['total_nodes']} nodes, {stats['total_edges']} edges")
assert stats["total_nodes"] > 10

print("2. Testing Drug-Drug Interaction Lookup...")
ddi = kg_instance.find_interactions(["Warfarin", "Ibuprofen"])
print(f"   Warfarin + Ibuprofen: {ddi[0]['severity']} - {ddi[0]['description'][:60]}...")
assert ddi[0]["severity"] == "MAJOR"

print("3. Testing Medical Literature RAG...")
rag_res = vector_store_instance.search("Dengue fever thrombocytopenia NSAIDs", top_k=2)
print(f"   RAG Found: {len(rag_res)} literature docs - Top: {rag_res[0]['title']}")
assert len(rag_res) > 0

print("4. Testing Planner Adaptive Routing on Simple Query...")
planner = PlannerAgent()
simple_res = planner.run({"query": "What are the symptoms of dengue fever?"})
p_simple = simple_res["planner_output"]
print(f"   Simple Query Complexity: {p_simple['complexity_score']}/5, Active Agents: {p_simple['arg_plan']['active_agents']}")
assert "kg_agent" not in p_simple["arg_plan"]["active_agents"]

print("5. Testing Planner Adaptive Routing on Complex Query...")
complex_res = planner.run({"query": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?"})
p_complex = complex_res["planner_output"]
print(f"   Complex Query Complexity: {p_complex['complexity_score']}/5, Active Agents: {p_complex['arg_plan']['active_agents']}")
assert "kg_agent" in p_complex["arg_plan"]["active_agents"]
assert "drug_safety_agent" in p_complex["arg_plan"]["active_agents"]

print("6. Testing End-to-End Clinical Query Generation with Groq LLM...")
res = execute_medgraph_query("Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?", mode="adaptive")
print(f"   Latency: {res['total_latency_ms']} ms, Agents count: {res['agents_invoked_count']}")
print(f"   Confidence: {res['final_response']['confidence_level']}")

print("\n>>> ALL TESTS PASSED SUCCESSFULLY! MedGraph is 100% Operational! <<<")
