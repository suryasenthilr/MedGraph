from typing import Dict, Any, List
from .base import BaseAgent
from medgraph.knowledge_graph import kg_instance

class KnowledgeGraphAgent(BaseAgent):
    """
    Knowledge Graph Agent:
    Interacts with the persistent Medical Knowledge Graph to retrieve
    deterministic structured clinical relationships (DDI, Contraindications,
    Treatments, Symptoms, Lab tests).
    """
    def __init__(self):
        super().__init__(name="Knowledge Graph Agent", role="Structured Medical Ontology & Graph Reasoning")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        planner_data = state.get("planner_output", {})
        entities = planner_data.get("entities", {})
        drugs = entities.get("drugs", [])
        diseases = entities.get("diseases", [])

        # 1. Drug-Drug Interactions
        interactions = kg_instance.find_interactions(drugs)

        # 2. Contraindications
        contraindications = kg_instance.find_contraindications(drugs, diseases)

        # 3. Symptoms
        symptoms = kg_instance.find_symptoms(diseases)

        # 4. First-line Treatments
        treatments = kg_instance.find_treatments(diseases)

        # 5. Extract interactive visual subgraph
        all_entity_names = drugs + diseases + entities.get("symptoms", [])
        subgraph = kg_instance.get_entity_subgraph(all_entity_names, max_hops=1)

        return {
            "kg_output": {
                "interactions": interactions,
                "contraindications": contraindications,
                "symptoms": symptoms,
                "treatments": treatments,
                "subgraph": subgraph,
                "total_facts_retrieved": len(interactions) + len(contraindications) + len(symptoms) + len(treatments)
            }
        }
