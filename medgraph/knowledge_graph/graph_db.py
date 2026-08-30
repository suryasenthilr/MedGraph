import json
import logging
from typing import Dict, List, Any, Optional
import networkx as nx
from pathlib import Path

from config import settings

logger = logging.getLogger(__name__)

class MedicalKnowledgeGraph:
    """
    Unified Medical Knowledge Graph Engine.
    Supports live Neo4j instances via official driver or high-performance
    in-memory NetworkX graph preloaded with medical ontology & relations.
    """
    def __init__(self, use_neo4j: bool = settings.USE_NEO4J_LIVE):
        self.use_neo4j = use_neo4j
        self.driver = None
        self.nx_graph = nx.MultiDiGraph()
        self.entities_by_name = {}
        self.entities_by_id = {}

        if self.use_neo4j:
            try:
                from neo4j import GraphDatabase
                self.driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
                self.driver.verify_connectivity()
                logger.info("Connected successfully to Live Neo4j instance at %s", settings.NEO4J_URI)
            except Exception as e:
                logger.warning("Failed to connect to live Neo4j: %s. Falling back to embedded in-memory Knowledge Graph.", e)
                self.use_neo4j = False
                self.driver = None

        self._load_seed_data()

    def _load_seed_data(self):
        """Loads seed data from JSON into the graph."""
        seed_path = Path(settings.KG_SEED_FILE)
        if not seed_path.exists():
            logger.warning("KG seed file not found at %s", seed_path)
            return

        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        entities = data.get("entities", [])
        relationships = data.get("relationships", [])

        for ent in entities:
            ent_id = ent["id"]
            name = ent["name"]
            self.entities_by_id[ent_id] = ent
            self.entities_by_name[name.lower()] = ent
            self.nx_graph.add_node(
                ent_id,
                name=name,
                type=ent.get("type", "Entity"),
                category=ent.get("category", ""),
                **{k: v for k, v in ent.items() if k not in ["id", "name", "type", "category"]}
            )

        for rel in relationships:
            src = rel["source"]
            tgt = rel["target"]
            rel_type = rel["type"]
            self.nx_graph.add_edge(
                src,
                tgt,
                type=rel_type,
                severity=rel.get("severity", "INFO"),
                description=rel.get("description", ""),
                **{k: v for k, v in rel.items() if k not in ["source", "target", "type", "severity", "description"]}
            )

        logger.info("Loaded Medical KG with %d entities and %d relationships", len(self.entities_by_id), len(relationships))

    def find_entity(self, name_or_alias: str) -> Optional[Dict[str, Any]]:
        """Finds an entity by fuzzy name lookup."""
        query = name_or_alias.strip().lower()
        if query in self.entities_by_name:
            return self.entities_by_name[query]

        # Substring / fuzzy match
        for name, ent in self.entities_by_name.items():
            if query in name or name in query:
                return ent
        return None

    def find_interactions(self, drug_names: List[str]) -> List[Dict[str, Any]]:
        """Queries drug-drug interactions between a list of drugs."""
        matched_ents = []
        for name in drug_names:
            ent = self.find_entity(name)
            if ent and ent.get("type") == "Drug":
                matched_ents.append(ent)

        interactions = []
        if len(matched_ents) < 2:
            # Check individual drug against all known major interactions
            for ent in matched_ents:
                ent_id = ent["id"]
                for _, tgt, edge_data in self.nx_graph.edges(ent_id, data=True):
                    if edge_data.get("type") == "INTERACTS_WITH":
                        tgt_ent = self.entities_by_id.get(tgt, {})
                        interactions.append({
                            "drug_1": ent["name"],
                            "drug_2": tgt_ent.get("name", tgt),
                            "severity": edge_data.get("severity", "MODERATE"),
                            "description": edge_data.get("description", ""),
                            "source_node": ent,
                            "target_node": tgt_ent
                        })
            return interactions

        # Multi-drug interaction matrix
        for i in range(len(matched_ents)):
            for j in range(i + 1, len(matched_ents)):
                id1 = matched_ents[i]["id"]
                id2 = matched_ents[j]["id"]

                # Check edge in both directions
                for (u, v, d1, d2) in [(id1, id2, matched_ents[i], matched_ents[j]), (id2, id1, matched_ents[j], matched_ents[i])]:
                    if self.nx_graph.has_edge(u, v):
                        edge_dict = self.nx_graph.get_edge_data(u, v)
                        for key, edge_data in edge_dict.items():
                            if edge_data.get("type") == "INTERACTS_WITH":
                                interactions.append({
                                    "drug_1": d1["name"],
                                    "drug_2": d2["name"],
                                    "severity": edge_data.get("severity", "MAJOR"),
                                    "description": edge_data.get("description", ""),
                                    "source_node": d1,
                                    "target_node": d2
                                })

        return interactions

    def find_contraindications(self, drug_names: List[str], disease_names: List[str]) -> List[Dict[str, Any]]:
        """Finds contraindications between specified drugs and disease states."""
        drug_ents = [self.find_entity(d) for d in drug_names]
        disease_ents = [self.find_entity(d) for d in disease_names]

        drug_ents = [d for d in drug_ents if d]
        disease_ents = [d for d in disease_ents if d]

        results = []
        for drug in drug_ents:
            drug_id = drug["id"]
            for _, tgt, edge_data in self.nx_graph.edges(drug_id, data=True):
                if edge_data.get("type") == "CONTRAINDICATED_IN":
                    tgt_ent = self.entities_by_id.get(tgt, {})
                    # Check if target disease matches any input disease or return all if none specified
                    if not disease_ents or any(tgt == d["id"] for d in disease_ents):
                        results.append({
                            "drug": drug["name"],
                            "disease": tgt_ent.get("name", tgt),
                            "severity": edge_data.get("severity", "CONTRAINDICATED"),
                            "description": edge_data.get("description", "")
                        })

        return results

    def find_symptoms(self, disease_names: List[str]) -> List[Dict[str, Any]]:
        """Queries symptoms associated with diseases."""
        disease_ents = [self.find_entity(d) for d in disease_names if self.find_entity(d)]
        symptoms = []
        for dis in disease_ents:
            dis_id = dis["id"]
            for _, tgt, edge_data in self.nx_graph.edges(dis_id, data=True):
                if edge_data.get("type") == "HAS_SYMPTOM":
                    symptom_ent = self.entities_by_id.get(tgt, {})
                    symptoms.append({
                        "disease": dis["name"],
                        "symptom": symptom_ent.get("name", tgt),
                        "frequency": edge_data.get("frequency", "COMMON"),
                        "description": edge_data.get("description", "")
                    })
        return symptoms

    def find_treatments(self, disease_names: List[str]) -> List[Dict[str, Any]]:
        """Queries recommended drugs / treatments for diseases."""
        disease_ents = [self.find_entity(d) for d in disease_names if self.find_entity(d)]
        treatments = []
        for dis in disease_ents:
            dis_id = dis["id"]
            # Look for incoming TREATS edges (Drug -> TREATS -> Disease)
            for src, _, edge_data in self.nx_graph.in_edges(dis_id, data=True):
                if edge_data.get("type") == "TREATS":
                    drug_ent = self.entities_by_id.get(src, {})
                    treatments.append({
                        "disease": dis["name"],
                        "drug": drug_ent.get("name", src),
                        "first_line": edge_data.get("first_line", False),
                        "description": edge_data.get("description", "")
                    })
        return treatments

    def get_entity_subgraph(self, entity_names: List[str], max_hops: int = 1) -> Dict[str, Any]:
        """Extracts an interactive visual subgraph for the matched entities."""
        matched_ids = set()
        for name in entity_names:
            ent = self.find_entity(name)
            if ent:
                matched_ids.add(ent["id"])

        if not matched_ids:
            # Return a default subset of high-importance nodes
            matched_ids = set(list(self.entities_by_id.keys())[:8])

        subgraph_nodes = set(matched_ids)
        for _ in range(max_hops):
            neighbors = set()
            for node_id in subgraph_nodes:
                if node_id in self.nx_graph:
                    neighbors.update(self.nx_graph.successors(node_id))
                    neighbors.update(self.nx_graph.predecessors(node_id))
            subgraph_nodes.update(neighbors)

        nodes = []
        for nid in subgraph_nodes:
            if nid in self.entities_by_id:
                ent = self.entities_by_id[nid]
                nodes.append({
                    "id": nid,
                    "label": ent["name"],
                    "type": ent.get("type", "Concept"),
                    "category": ent.get("category", "")
                })

        edges = []
        for u in subgraph_nodes:
            for v in subgraph_nodes:
                if self.nx_graph.has_edge(u, v):
                    edge_dict = self.nx_graph.get_edge_data(u, v)
                    for _, edge_data in edge_dict.items():
                        edges.append({
                            "source": u,
                            "target": v,
                            "type": edge_data.get("type", "RELATED_TO"),
                            "severity": edge_data.get("severity", ""),
                            "description": edge_data.get("description", "")
                        })

        return {"nodes": nodes, "edges": edges}

    def get_graph_stats(self) -> Dict[str, Any]:
        """Returns statistics of the Knowledge Graph."""
        type_counts = {}
        for ent in self.entities_by_id.values():
            t = ent.get("type", "Other")
            type_counts[t] = type_counts.get(t, 0) + 1

        rel_counts = {}
        for _, _, edge_data in self.nx_graph.edges(data=True):
            r = edge_data.get("type", "OTHER")
            rel_counts[r] = rel_counts.get(r, 0) + 1

        return {
            "total_nodes": self.nx_graph.number_of_nodes(),
            "total_edges": self.nx_graph.number_of_edges(),
            "node_distribution": type_counts,
            "relationship_distribution": rel_counts,
            "engine": "Neo4j (Live)" if self.use_neo4j else "Embedded Medical KG (NetworkX)"
        }

# Global singleton
kg_instance = MedicalKnowledgeGraph()
