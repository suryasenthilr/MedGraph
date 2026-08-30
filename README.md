# MedGraph 🩺 — Adaptive Reasoning Graph (ARG) Clinical Decision Support System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Groq Cloud](https://img.shields.io/badge/LLM-Groq%20Cloud%20(GPT--OSS%20120B)-f55036.svg)](https://groq.com/)
[![UN SDG 3](https://img.shields.io/badge/UN%20SDG-3%20Good%20Health-16845B.svg)](https://sdgs.un.org/goals/goal3)

> **MedGraph** is an advanced Generative-AI clinical decision support system designed to assist healthcare professionals by replacing rigid, fixed-chain RAG pipelines with **Adaptive Reasoning Graphs (ARG)**. MedGraph dynamically analyzes clinical query complexity, synthesizes a tailored Directed Acyclic Graph (DAG) of specialized medical agents, traverses biomedical ontologies (Knowledge Graph) and peer-reviewed literature (PubMed RAG), and performs multi-source evidence reconciliation to eliminate hallucinations and prevent adverse drug interactions.

---

## 📑 Table of Contents

1. [System Architecture & Workflow Diagram](#-system-architecture--workflow-diagram)
2. [Why Adaptive Reasoning Graphs (ARG)?](#-why-adaptive-reasoning-graphs-arg)
3. [The 7 Specialized Clinical Agents](#-the-7-specialized-clinical-agents)
4. [Technology Stack](#-technology-stack)
5. [UN Sustainable Development Goals (SDGs)](#-un-sustainable-development-goals-sdgs)
6. [Comparative Benchmark Suite (Section 17 Analysis)](#-comparative-benchmark-suite)
7. [Repository Structure](#-repository-structure)
8. [Installation & Quick Start Guide](#-installation--quick-start-guide)
9. [REST API Reference & Endpoints](#-rest-api-reference--endpoints)
10. [Clinical Decision Safety Disclaimer](#-clinical-decision-safety-disclaimer)

---

## 🏛️ System Architecture & Workflow Diagram

Instead of routing every medical query through a static `User → RAG → LLM` pipeline, MedGraph dynamically compiles and executes a query-tailored reasoning topology:

```mermaid
flowchart TD
    UserQuery(["🩺 User Clinical Query"]) --> Planner["🧠 Agent 1: Planner Agent\n• Intent Classification\n• Entity Extraction (Drugs, Diseases, Labs)\n• Complexity Scoring (1/5 to 5/5)"]

    Planner --> Decision{"Complexity & Intent\nRouting Policy"}

    %% Path 1: Simple Symptoms
    Decision -->|"Complexity 1/5\n(Simple / Lookup)"| Path1["⚡ Fast RAG Path"]
    Path1 --> RAG1["📚 Agent 2: PubMed RAG\nVector Search"]
    RAG1 --> Resp1["📝 Agent 7: Response Synthesizer"]

    %% Path 2: Clinical Guidelines
    Decision -->|"Complexity 3/5\n(Protocol / Guideline)"| Path2["📋 Guideline Protocol Path"]
    Path2 --> RAG2["📚 Agent 2: PubMed RAG"]
    RAG2 --> Guide2["📑 Agent 5: Clinical Guidelines\n(KDIGO / ADA / CHEST / WHO)"]
    Guide2 --> Verif2["🛡️ Agent 6: Evidence Verifier"]
    Verif2 --> Resp2["📝 Agent 7: Response Synthesizer"]

    %% Path 3: Complex Polypharmacy / Multimorbidity
    Decision -->|"Complexity 5/5\n(Critical Multi-Morbidity)"| Path3["🔥 Full Neuro-Symbolic ARG Path"]
    Path3 --> RAG3["📚 Agent 2: PubMed RAG"]
    Path3 --> KG3["🕸️ Agent 3: Medical Knowledge Graph\nMulti-Hop Ontological Traversal"]
    
    RAG3 & KG3 --> Safety3["⚠️ Agent 4: Drug Safety Specialist\n• Major DDI Detection\n• Renal / Organ Contraindications\n• Safe Alternative Calculation"]
    RAG3 & KG3 --> Guide3["📑 Agent 5: Clinical Guidelines"]

    Safety3 & Guide3 --> Verif3["🛡️ Agent 6: Evidence Verifier\n• Cross-Source Concordance\n• Conflict Flagging\n• Grounding Score Calculation"]
    Verif3 --> Resp3["📝 Agent 7: Response Synthesizer\n• Evidence-Grounded Markdown Tables\n• Provenance Citations\n• Safety Disclaimers"]

    Resp1 & Resp2 & Resp3 --> FinalOutput(["📊 Final Clinical Recommendation & Telemetry"])

    style UserQuery fill:#11423F,stroke:#1FB6A6,stroke-width:2px,color:#fff
    style Planner fill:#E3F2FA,stroke:#0878B9,stroke-width:2px,color:#163247
    style Path1 fill:#F1F7FB,stroke:#C9D9E4,stroke-width:1px,color:#163247
    style Path2 fill:#F1F7FB,stroke:#C9D9E4,stroke-width:1px,color:#163247
    style Path3 fill:#FFF1F2,stroke:#E11D48,stroke-width:2px,color:#163247
    style FinalOutput fill:#11423F,stroke:#1FB6A6,stroke-width:2px,color:#fff
```

---

## ⚡ Why Adaptive Reasoning Graphs (ARG)?

Traditional Medical AI architectures suffer from two opposite extremes:
1. **Direct LLMs & Fixed RAG**: High speed on simple queries, but prone to dangerous hallucinations and unable to perform deterministic multi-hop reasoning over contraindications.
2. **Fixed Static Multi-Agent Systems**: Invoke every single agent (KG, Safety, Literature, Guidelines, Verifiers) sequentially for every prompt, creating wasteful latency (~6 seconds) and high token consumption for simple definitions.

**The MedGraph Solution**:
MedGraph’s **Adaptive Reasoning Graph (ARG)** dynamically calibrates the reasoning depth:
* **Simple Lookups (1/5)** (*"What are the symptoms of dengue fever?"*) $\rightarrow$ Executes **3 agents** in **< 1.5s**.
* **Clinical Protocols (3/5)** (*"What are ADA/KDIGO recommendations for Metformin in reduced eGFR?"*) $\rightarrow$ Executes **5 agents** in **~2.2s**.
* **Critical Polypharmacy (5/5)** (*"Can a diabetic CKD patient taking Warfarin use Ibuprofen?"*) $\rightarrow$ Activates all **7 agents** with comprehensive pharmacovigilance checks and conflict resolution.

---

## 🤖 The 7 Specialized Clinical Agents

| # | Agent Name | File | Role & Capabilities |
| :-: | :--- | :--- | :--- |
| **1** | **Planner Agent** | [`planner.py`](medgraph/agents/planner.py) | Parses user queries, extracts clinical entities (Drugs, Diseases, Lab tests), classifies clinical intent, assigns complexity score ($1/5$ to $5/5$), and outputs a dynamic execution plan. |
| **2** | **Retrieval Agent (RAG)** | [`retrieval_agent.py`](medgraph/agents/retrieval_agent.py) | Performs hybrid semantic and TF-IDF search over indexed PubMed biomedical literature excerpts to provide peer-reviewed grounding. |
| **3** | **Knowledge Graph Agent** | [`kg_agent.py`](medgraph/agents/kg_agent.py) | Executes multi-hop graph traversals across structured medical ontologies (NetworkX / Neo4j) to detect indirect contraindications and metabolic pathways. |
| **4** | **Drug Safety Agent** | [`drug_safety_agent.py`](medgraph/agents/drug_safety_agent.py) | Pharmacovigilance specialist detecting drug-drug interactions (DDI), renal threshold contraindications (e.g. eGFR cutoffs), and computing safe alternative therapies. |
| **5** | **Clinical Guideline Agent** | [`guideline_agent.py`](medgraph/agents/guideline_agent.py) | Matches patient conditions against official clinical guidelines (KDIGO 2024, ADA 2024, CHEST 2023, WHO) with evidence grading (Grade 1A, Grade 2B). |
| **6** | **Evidence Verifier Agent** | [`verifier_agent.py`](medgraph/agents/verifier_agent.py) | Multi-source reconciliation auditor that detects contradictions between literature and knowledge graph triples, computing a mathematical grounding confidence score ($0-100\%$). |
| **7** | **Response Synthesizer** | [`response_agent.py`](medgraph/agents/response_agent.py) | Assembles the validated evidence into a structured clinical recommendation formatted with Markdown tables, citations, and risk warnings. |

---

## 🛠️ Technology Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MEDGRAPH TECHNOLOGY STACK                       │
├──────────────────┬─────────────────────────────────────────────────────┤
│ Frontend         │ React 18, Vite 5, Tailwind CSS 3.4, Lucide React,    │
│                  │ Recharts, React-Markdown, Remark-GFM                │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Backend API      │ FastAPI, Uvicorn, Pydantic V2, Pydantic-Settings    │
├──────────────────┼─────────────────────────────────────────────────────┤
│ LLM Inference    │ Groq Cloud API (openai/gpt-oss-120b cascade,        │
│                  │ qwen/qwen3.8-27b, openai/gpt-oss-20b)               │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Knowledge Graph  │ NetworkX (Dual-mode in-memory & Neo4j Bolt driver)  │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Literature RAG   │ Scikit-Learn Vector Store, Cosine Similarity Index  │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Testing & QA     │ Pytest, HTTPX, GitHub Actions CI                   │
└──────────────────┴─────────────────────────────────────────────────────┘
```

---

## 🌍 UN Sustainable Development Goals (SDGs)

MedGraph is developed in strong alignment with global healthcare and responsible AI sustainability goals:

* 🩺 **SDG 3 — Good Health and Well-Being (PRIMARY DIRECT ALIGNMENT)**:
  * Empowers healthcare providers with verified, evidence-grounded decision support.
  * Mitigates adverse drug-drug interactions and diagnostic errors via structured contraindication reasoning.
  * Improves clinical accessibility to updated medical guidelines (KDIGO, ADA, CHEST, WHO).
* 💡 **SDG 9 — Industry, Innovation and Infrastructure (SUPPORTING)**:
  * Delivers a novel neuro-symbolic multi-agent architecture combining parametric LLMs with structured knowledge graphs and dynamic DAG workflow synthesis.
* 🤝 **SDG 10 — Reduced Inequalities (SUPPORTING)**:
  * Democratizes access to specialized clinical decision intelligence across resource-constrained clinics.
* ⚖️ **SDG 16 — Peace, Justice and Strong Institutions / Responsible AI (SUPPORTING)**:
  * Ensures transparent, accountable AI reasoning with full citation provenance, multi-source conflict reconciliation, and audit trails.
* 🌐 **SDG 17 — Partnerships for the Goals (SUPPORTING)**:
  * Harmonizes heterogeneous open medical knowledge ontologies (SNOMED CT, DrugBank, PubMed, WHO).

---

## 📊 Comparative Benchmark Suite

The built-in evaluation suite (`POST /api/benchmark/run`) compares the 4 architectural paradigms across clinical accuracy, safety catch rate, and latency:

| Architecture Paradigm | Routing Policy | Grounding Accuracy | Safety Catch Rate | Average Latency | Computational Efficiency |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Baseline 1: LLM-Only** | Parametric Only (No RAG) | 58.0% | 50.0% *(High Hallucination)* | **~1200 ms** | Fast, but clinically unsafe |
| **Baseline 2: Traditional RAG** | Fixed Single-Pass Vector | 78.0% | 75.0% *(Misses Graph Paths)* | ~2100 ms | Good for simple retrieval |
| **Baseline 3: Fixed Multi-Agent** | Static (All 7 Agents Every Time) | 92.0% | 100.0% *(Catches all DDIs)* | ~5800 ms *(High Latency)* | Wasteful on simple lookups |
| **Proposed MedGraph (ARG)** | **Dynamic Query-Specific DAG** | **96.0%** | **100.0% (Zero Missed Risks)** | **~2800 ms** | **Optimal (~50% Token & Latency Savings)** |

---

## 📂 Repository Structure

```text
MedGraph_AIML/
├── README.md                      # Comprehensive system documentation
├── config.py                      # Application settings & environment loader
├── .env.example                   # Example environment configuration
├── requirements.txt               # Python package dependencies
├── data/
│   ├── kg_seed_data.json          # Medical entities (Drugs, Diseases, Symptoms, Labs)
│   ├── medical_guidelines.json    # KDIGO, ADA, CHEST, WHO guideline dataset
│   └── pubmed_sample_corpus.json  # Indexed PubMed biomedical literature
├── medgraph/
│   ├── agents/                    # 7 Specialized AI Agents
│   │   ├── base.py                # Base clinical agent class & tracing
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
│   │   └── vector_store.py        # Literature vector store & similarity index
│   ├── llm/
│   │   └── client.py              # Multi-model Groq cascade with fallback
│   ├── graph/
│   │   ├── arg_engine.py          # Dynamic ARG execution runtime
│   │   ├── baselines.py           # Baselines 1, 2, 3 comparison pipelines
│   │   └── state.py               # Shared AgentState dataclass
│   ├── benchmark/
│   │   ├── evaluator.py           # 4-way automated evaluation suite
│   │   └── test_dataset.py        # Clinical benchmark test scenarios
│   └── api/
│       └── app.py                 # FastAPI REST API server
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
    ├── test_fast.py               # Fast mock pipeline unit tests
    └── test_system.py             # End-to-end multi-agent verification tests
```

---

## 🚀 Installation & Quick Start Guide

### Prerequisites
* **Python 3.10 or higher**
* **Node.js 18+ & npm**
* **Groq Cloud API Key** (Free key at [https://console.groq.com/keys](https://console.groq.com/keys))

---

### Step 1: Clone Repository & Configure Environment

```bash
git clone https://github.com/suryasenthilr/MedGraph.git
cd MedGraph

# Create your .env file
cp .env.example .env
```

Open `.env` and insert your Groq API Key:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
KG_BACKEND=memory
```

---

### Step 2: Launch the FastAPI Backend Server

In **Terminal 1**:

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Start the backend server
uvicorn medgraph.api.app:app --host 0.0.0.0 --port 8000 --reload
```

* **Backend Live Server**: `http://127.0.0.1:8000`
* **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
* **Health Endpoint**: `http://127.0.0.1:8000/api/health`

---

### Step 3: Launch the React Frontend Web Application

In **Terminal 2**:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

* **Web UI Dashboard**: `http://localhost:5173`

---

## 📡 REST API Reference & Endpoints

| HTTP Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, active LLM model, and Knowledge Graph entity counts |
| `GET` | `/api/sample-queries` | Returns pre-configured clinical queries spanning complexities 1 to 5 |
| `GET` | `/api/kg/stats` | Summary statistics of medical nodes and relationship edges |
| `GET` | `/api/kg/graph` | Returns the structured graph nodes and edges for the visual explorer |
| `POST` | `/api/query` | Executes clinical query through Adaptive MedGraph or selected baseline |
| `POST` | `/api/benchmark/run` | Runs the 4-paradigm comparative benchmark evaluation suite |

### Example cURL Request:
```bash
curl -X POST "http://127.0.0.1:8000/api/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?",
       "mode": "adaptive"
     }'
```

---

## 🛡️ Clinical Decision Safety Disclaimer

> **IMPORTANT**: *MedGraph is an experimental clinical decision support research prototype built to demonstrate Adaptive Reasoning Graphs, multi-source conflict verification, and neuro-symbolic AI reasoning. It is designed to assist qualified healthcare professionals with evidence-grounded insights and must **never** be used as a sole substitute for direct clinical judgment, medical diagnosis, or patient-specific treatment planning.*

---

## 📄 License & Attribution

Developed as an open research prototype for Adaptive Clinical AI Reasoning and UN SDG 3 health innovation. Licensed under the [MIT License](LICENSE).
