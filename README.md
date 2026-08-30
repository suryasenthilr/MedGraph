# MedGraph 🩺 — Adaptive Reasoning Graph (ARG) Clinical Decision Support System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![UN SDG 3](https://img.shields.io/badge/UN%20SDG-3%20Good%20Health-16845B.svg)](https://sdgs.un.org/goals/goal3)

> **MedGraph** is a Generative-AI clinical decision support system that replaces rigid, static pipelines with **Adaptive Reasoning Graphs (ARG)**. It dynamically classifies clinical query complexity ($1/5$ to $5/5$), synthesizes a tailored Directed Acyclic Graph (DAG) of specialized medical agents, traverses structured medical ontologies (Knowledge Graph) and literature (PubMed RAG), and performs multi-source evidence verification to prevent AI hallucinations and adverse drug interactions.

---

## 🌍 UN Sustainable Development Goals (SDGs) Alignment

MedGraph directly addresses the United Nations Sustainable Development Goals:

* 🩺 **SDG 3 — Good Health and Well-Being (Primary Direct Alignment)**:
  * Empowers healthcare providers with verified, evidence-grounded decision support.
  * Reduces adverse drug-drug interactions (DDI) and diagnostic errors via structured contraindication reasoning.
  * Improves clinical accessibility to updated medical guidelines (KDIGO, ADA, CHEST, WHO).
* 💡 **SDG 9 — Industry, Innovation and Infrastructure (Supporting)**:
  * Delivers a novel neuro-symbolic multi-agent architecture combining parametric LLMs with structured knowledge graphs and dynamic DAG workflow synthesis.
* 🤝 **SDG 10 — Reduced Inequalities (Supporting)**:
  * Democratizes access to specialized clinical decision intelligence across resource-constrained clinics.
* ⚖️ **SDG 16 — Peace, Justice and Strong Institutions / Responsible AI (Supporting)**:
  * Ensures transparent, accountable AI reasoning with full citation provenance, multi-source conflict reconciliation, and audit trails.
* 🌐 **SDG 17 — Partnerships for the Goals (Supporting)**:
  * Harmonizes heterogeneous open medical knowledge ontologies (SNOMED CT, DrugBank, PubMed, WHO).

---

## 🧠 Core Architecture & Specialized Agents

```text
User Medical Query
       │
       ▼
[ Planner Agent ] ──▶ Classifies Intent & Complexity Score (1/5 to 5/5)
       │
       ▼ (Dynamic DAG Synthesis)
 ┌─────────────────────────────────────────────────────────────┐
 │  • Simple Query (1/5):  [RAG] ───────────────▶ [Response]   │
 │  • Guideline (3/5):     [RAG] ──▶ [Guideline] ──▶ [Verifier] │
 │  • Complex Poly (5/5):  [RAG + KG] ──▶ [Safety + Guideline] │
 │                         ──▶ [Verifier Agent] ──▶ [Response] │
 └─────────────────────────────────────────────────────────────┘
```

MedGraph orchestrates **7 specialized clinical agents**:
1. **Planner Agent (`planner.py`)**: Entity extraction (drugs, diseases, labs), intent classification, and calibrated complexity scoring ($1/5$ to $5/5$).
2. **Medical RAG Agent (`retrieval_agent.py`)**: Hybrid vector retrieval across indexed PubMed biomedical literature.
3. **Knowledge Graph Agent (`kg_agent.py`)**: Multi-hop graph traversal over disease contraindications, drug targets, and metabolic pathways.
4. **Drug Safety Agent (`drug_safety_agent.py`)**: Dedicated pharmacovigilance specialist detecting high-risk DDIs, organ toxicity thresholds, and recommending safe therapeutic alternatives.
5. **Clinical Guideline Agent (`guideline_agent.py`)**: Maps clinical conditions to official clinical practice guidelines (KDIGO 2024, ADA 2024, CHEST 2023, WHO).
6. **Evidence Verification Agent (`verifier_agent.py`)**: Cross-source conflict audit reconciling literature vs. knowledge graph triples and computing grounding confidence scores.
7. **Response Generation Agent (`response_agent.py`)**: Synthesizes verified recommendations with Markdown tables, provenance citations, and safety disclaimers.

---

## 📊 Comparative Experimental Evaluation (Benchmark Suite)

| Metric / Architecture | Baseline 1: LLM-Only | Baseline 2: Traditional RAG | Baseline 3: Fixed Multi-Agent | **Proposed MedGraph (ARG)** |
| :--- | :--- | :--- | :--- | :--- |
| **Routing Policy** | Parametric Only | Single-Pass Fixed | Static (All 7 Agents) | **Dynamic Query DAG** |
| **Grounding Quality** | 58.0% | 78.0% | 92.0% | **96.0% (Highest)** |
| **Safety Catch Rate** | 50.0% (Hallucination risk) | 75.0% (Misses KG paths) | 100.0% | **100.0% (Zero missed DDIs)** |
| **Average Latency** | ~1200 ms | ~2100 ms | ~5800 ms (High overhead) | **~2800 ms (52% Faster than B3)** |
| **Resource Efficiency** | 1 LLM Call | 2 Invocations | 7 Fixed Invocations | **3.5 Avg Invocations (Optimal)** |

---

## 📂 Project Structure

```text
MedGraph_AIML/
├── config.py                      # Application settings & environment loader
├── .env.example                   # Example environment configuration
├── data/
│   ├── kg_seed_data.json          # Medical entities (Drugs, Diseases, Symptoms, Labs)
│   ├── medical_guidelines.json    # KDIGO, ADA, CHEST, WHO guideline dataset
│   └── pubmed_sample_corpus.json  # Indexed PubMed biomedical literature
├── medgraph/
│   ├── agents/                    # 7 Specialized AI Agents
│   │   ├── planner.py             # Calibrated complexity scoring & DAG builder
│   │   ├── retrieval_agent.py     # PubMed RAG agent
│   │   ├── kg_agent.py            # Knowledge graph traversal agent
│   │   ├── drug_safety_agent.py   # DDI & organ risk specialist
│   │   ├── guideline_agent.py     # Clinical practice guideline agent
│   │   ├── verifier_agent.py      # Multi-source conflict audit agent
│   │   └── response_agent.py      # Grounded response synthesis
│   ├── knowledge_graph/
│   │   └── graph_db.py            # Dual-mode NetworkX & Neo4j graph engine
│   ├── rag/
│   │   └── vector_store.py        # TF-IDF / Semantic literature vector store
│   ├── llm/
│   │   └── client.py              # Multi-model Groq cascade with fallback
│   ├── graph/
│   │   ├── arg_engine.py          # Dynamic ARG execution runtime
│   │   └── baselines.py           # Baselines 1, 2, 3 comparison pipelines
│   ├── benchmark/
│   │   └── evaluator.py           # 4-way automated evaluation suite
│   └── api/
│       └── app.py                 # FastAPI REST API endpoints
├── frontend/                      # React 18 + Tailwind CSS Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Navigation bar & system status
│   │   │   ├── SdgSidePanel.jsx   # Dedicated UN SDGs impact panel
│   │   │   ├── QueryInput.jsx     # Clinical consultation console & scenario cards
│   │   │   ├── ArgFlowVisualizer.jsx # Dynamic DAG visualizer with step telemetry
│   │   │   ├── EvidenceMatrix.jsx # Multi-source verification audit matrix
│   │   │   ├── ResponseView.jsx   # Markdown clinical recommendation viewer
│   │   │   ├── KgExplorer.jsx     # Interactive Knowledge Graph explorer
│   │   │   └── BenchmarkDashboard.jsx # Comparative Recharts evaluation dashboard
│   │   ├── services/api.js        # Axios API client
│   │   ├── App.jsx                # Root frontend component
│   │   └── index.css              # Custom clinical typography & table styles
│   ├── package.json
│   └── tailwind.config.js
└── tests/
    └── test_system.py             # System & pipeline verification test suite
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**
* **Groq Cloud API Key** (Free from [https://console.groq.com/keys](https://console.groq.com/keys))

---

### Step 1: Clone Repository & Configure Environment

```bash
git clone <repository_url>
cd MedGraph_AIML

# Copy example environment file
cp .env.example .env
```

Open `.env` and configure your Groq API Key:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
KG_BACKEND=memory
```

---

### Step 2: Set Up & Run the FastAPI Backend Server

```bash
# 1. Install Python dependencies
pip install fastapi uvicorn pydantic pydantic-settings python-dotenv groq networkx scikit-learn numpy pytest httpx

# 2. Start FastAPI Server
uvicorn medgraph.api.app:app --host 0.0.0.0 --port 8000 --reload
```

* Backend will be live at: **`http://127.0.0.1:8000`**
* Interactive Swagger API Docs: **`http://127.0.0.1:8000/docs`**

---

### Step 3: Set Up & Run the React Frontend

Open a new terminal window:

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Start Vite Dev Server
npm run dev -- --host 0.0.0.0
```

* Frontend UI will be live at: **`http://localhost:5173`**

---

## 🧪 Running System Tests

To run the automated validation test suite:

```bash
# Run pytest across the entire pipeline
pytest tests/test_system.py -v
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/query` | Executes clinical query through ARG or baseline modes |
| `GET` | `/api/health` | System health check, KG nodes count, LLM status |
| `GET` | `/api/sample-queries` | Returns calibrated clinical scenario queries |
| `GET` | `/api/kg/stats` | Returns entity and relation metrics from Knowledge Graph |
| `GET` | `/api/kg/graph` | Returns all nodes and edges for graph explorer |
| `POST` | `/api/benchmark/run` | Runs 4-way comparative evaluation suite |

### Example Query Request:
```bash
curl -X POST "http://127.0.0.1:8000/api/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?",
       "mode": "adaptive"
     }'
```

---

## 🛡️ Clinical Safety Disclaimer

*MedGraph is an experimental clinical decision support system designed to assist qualified healthcare professionals with evidence-grounded medical insights. It is not intended to replace direct professional medical judgment, diagnosis, or treatment.*
