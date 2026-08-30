import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from config import settings
from medgraph.graph import execute_medgraph_query
from medgraph.knowledge_graph import kg_instance
from medgraph.rag import vector_store_instance
from medgraph.benchmark import benchmark_evaluator, TEST_QUERIES
from medgraph.llm import llm_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("medgraph_api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Adaptive Reasoning Graph (ARG) Clinical Decision Support System API"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str = Field(..., description="Clinical medical question", example="Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?")
    mode: str = Field(default="adaptive", description="Execution mode: adaptive, baseline_llm, baseline_rag, baseline_fixed_multiagent")

@app.get("/api/health")
def health_check():
    stats = kg_instance.get_graph_stats()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": llm_client.active_provider,
        "llm_model": llm_client.model,
        "knowledge_graph": stats,
        "vector_store_documents": len(vector_store_instance.documents)
    }

@app.post("/api/query")
def process_clinical_query(request: QueryRequest):
    """
    Executes a clinical query using Adaptive MedGraph or a selected baseline.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    logger.info("Received query [%s]: %s", request.mode, request.query)
    try:
        state = execute_medgraph_query(request.query, mode=request.mode)
        return {
            "success": True,
            "data": state
        }
    except Exception as e:
        logger.error("Query processing failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sample-queries")
def get_sample_queries():
    """Returns curated clinical queries demonstrating adaptive routing."""
    return {
        "queries": [
            {
                "id": "q1",
                "title": "Complex Polypharmacy & Comorbidity",
                "complexity": "Complex (Level 4-5)",
                "expected_path": "Planner -> RAG + KG -> Drug Safety + Guidelines -> Verification -> Response",
                "text": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?"
            },
            {
                "id": "q2",
                "title": "Simple Disease Presentation",
                "complexity": "Simple (Level 1)",
                "expected_path": "Planner -> Medical RAG -> Response Generator",
                "text": "What are the symptoms and clinical presentation of dengue fever?"
            },
            {
                "id": "q3",
                "title": "Renal Dosing & Guideline Inquiry",
                "complexity": "Moderate (Level 3)",
                "expected_path": "Planner -> RAG -> Guideline Agent -> Verification -> Response",
                "text": "What are the ADA and KDIGO guidelines for Metformin use in patients with reduced eGFR?"
            },
            {
                "id": "q4",
                "title": "Cardiovascular Drug Interaction",
                "complexity": "Moderate-Complex (Level 3-4)",
                "expected_path": "Planner -> KG + Drug Safety -> Verification -> Response",
                "text": "Can a hypertensive patient taking Lisinopril safely take Spironolactone?"
            }
        ]
    }

@app.get("/api/kg/stats")
def get_kg_statistics():
    """Returns Knowledge Graph statistics."""
    return kg_instance.get_graph_stats()

@app.get("/api/kg/graph")
def get_kg_subgraph(entities: Optional[str] = None):
    """
    Returns nodes and edges for interactive frontend visualization.
    If entities query parameter is provided (comma-separated), returns targeted subgraph.
    """
    if entities:
        ent_list = [e.strip() for e in entities.split(",") if e.strip()]
        return kg_instance.get_entity_subgraph(ent_list, max_hops=1)
    else:
        # Return complete graph
        return kg_instance.get_entity_subgraph([], max_hops=2)

@app.post("/api/benchmark/run")
def run_benchmark():
    """
    Runs the 4-mode comparative benchmark evaluation suite.
    """
    logger.info("Executing benchmark suite across %d test cases", len(TEST_QUERIES))
    try:
        results = benchmark_evaluator.run_benchmark()
        return {
            "success": True,
            "benchmark_results": results
        }
    except Exception as e:
        logger.error("Benchmark run failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
