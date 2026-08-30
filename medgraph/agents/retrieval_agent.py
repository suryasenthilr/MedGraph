from typing import Dict, Any
from .base import BaseAgent
from medgraph.rag import vector_store_instance

class RetrievalAgent(BaseAgent):
    """
    Retrieval Agent (RAG):
    Searches peer-reviewed medical literature (PubMed / PMC) and clinical documents
    for evidence relevant to the clinical question and entities.
    """
    def __init__(self):
        super().__init__(name="Retrieval Agent", role="PubMed / Medical Literature RAG")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        query = state.get("query", "")
        planner_data = state.get("planner_output", {})
        entities = planner_data.get("entities", {})

        # Build expanded query with extracted medical entities
        terms = [query]
        for key in ["drugs", "diseases", "symptoms"]:
            terms.extend(entities.get(key, []))
        expanded_query = " ".join(terms)

        retrieved_docs = vector_store_instance.search(expanded_query, top_k=4)

        return {
            "retrieval_output": {
                "documents": retrieved_docs,
                "document_count": len(retrieved_docs),
                "top_sources": [doc.get("source") for doc in retrieved_docs]
            }
        }
