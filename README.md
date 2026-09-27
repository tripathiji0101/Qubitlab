# QubitLab ⚛️
### Real-Time Collaborative Quantum Computing Platform, Quantum IDE & Cloud Infrastructure

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Terraform](https://img.shields.io/badge/Terraform-AWS_IaC-623CE4?style=flat&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Docker](https://img.shields.io/badge/Docker-Production_Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Pytest](https://img.shields.io/badge/Pytest-138%2F138%20Passing-brightgreen?style=flat&logo=pytest&logoColor=white)](https://pytest.org/)
[![Frontend Tests](https://img.shields.io/badge/Frontend_Tests-19%2F19%20Passing-brightgreen?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

**QubitLab** is an enterprise-grade, interactive quantum computing education and research ecosystem. It combines a drag-and-drop visual circuit simulator, a full-featured code-first **Quantum IDE**, authoritative real-time collaboration rooms, peer-to-peer WebRTC voice calling, university courseware & RAG document search, community discussion forums, gamified quantum curriculum, and reproducible **Terraform AWS infrastructure** with **GitHub Actions CI/CD**.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [1. Quantum Circuit Studio](#1-quantum-circuit-studio)
  - [2. Complete Quantum IDE](#2-complete-quantum-ide)
  - [3. Multi-User Collaboration & WebRTC Voice](#3-multi-user-collaboration--webrtc-voice)
  - [4. Social Network & Direct Chat](#4-social-network--direct-chat)
  - [5. University Multi-Tenancy & RAG Knowledge](#5-university-multi-tenancy--rag-knowledge)
  - [6. Community Discussions & Voting](#6-community-discussions--voting)
  - [7. Gamified Curriculum & Missions](#7-gamified-curriculum--missions)
  - [8. AI Quantum Tutor & What-If Engine](#8-ai-quantum-tutor--what-if-engine)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Layout](#-project-layout)
- [Quickstart Guide](#-quickstart-guide)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-full-stack)
  - [Option B: Local Manual Setup](#option-b-local-manual-setup)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Infrastructure as Code (Terraform)](#-infrastructure-as-code-terraform)
- [CI/CD & Deployment Pipeline](#-cicd--deployment-pipeline)
- [Environment Configuration](#-environment-configuration)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Documentation Directory](#-documentation-directory)

---

## 🌟 Key Features

### 1. 🎛️ Quantum Circuit Studio
- **Multi-Qubit Visual Grid**: Drag-and-drop gate sequencing on up to 20 qubits with custom depth.
- **Rich Gate Palette**:
  - Single-qubit: $H$, $X$, $Y$, $Z$, $S$, $T$, $P(\phi)$
  - Parameterized rotations: $R_x(\theta)$, $R_y(\theta)$, $R_z(\theta)$ with interactive angle sliders
  - Entangling gates: $CNOT$ ($CX$), $CZ$, $SWAP$, Toffoli ($CCX$)
  - Measurements: standard computational $Z$-basis measurements with shot distributions
- **Real-Time Simulation**:
  - Exact statevector amplitude breakdown ($|00\dots\rangle$ to $|11\dots\rangle$)
  - Interactive 3D Bloch sphere visualization
  - Multi-engine export: OpenQASM 2.0/3.0, Qiskit, PennyLane, Cirq, and LaTeX

### 2. ⚡ Complete Quantum IDE
- **Code-First Quantum Programming**: Write native Python quantum algorithms directly in the browser.
- **Multi-Framework Selector**: Run code across **Qiskit Aer**, **PennyLane**, **Google Cirq**, or QubitLab's **Native In-Memory Simulator**.
- **Execution Output & Visual Diagnostics**:
  - Instant terminal stdout/stderr stream
  - Dynamically rendered circuit diagrams generated directly from code
  - Real-time statevector and probability bar charts
  - Measurement outcome histograms across customizable shots ($100$ to $100{,}000$)
  - Bloch sphere state mapping for single qubits
- **AI Debugger Integration**: One-click AI Tutor code review and error explanation.
- **Curated Starter Templates**: Pre-loaded algorithms for Bell State, GHZ State, Quantum Teleportation, Superdense Coding, and Grover's Search.
- **Circuit Studio Bi-Directional Bridge**: Convert visual circuits directly into executable code in any quantum framework.

### 3. 👥 Multi-User Collaboration & WebRTC Voice
- **Instant Rooms & Deep Links**: Create rooms in 1 click; share 6-character codes or direct invite links (`/join/:code`).
- **Live Circuit Synchronization**: Powered by authoritative FastAPI WebSockets with revision sequence tracking and conflict-free updates.
- **Role-Based Access Control (RBAC)**: Owner (administrative controls), Editor (real-time circuit editing), and Viewer (read-only observer).
- **In-Room Chat Sidebar**: Persistent room messaging with presence avatars and active participant indicators.
- **🎙️ WebRTC Peer-to-Peer Voice Calls**: Encrypted P2P audio mesh with zero third-party service fees, live speaking indicators, and mute/unmute toggles.

### 4. 💬 Social Network & Direct Chat
- **User Discovery & Profiles**: Search members by name or email, view profile badges, level progression, and XP.
- **Friendships**: Send, accept, decline, and manage friend requests.
- **1-on-1 Direct Chat**: Instant messaging with unread badges, timestamping, and chat history.
- **Global Presence**: Real-time online/offline indicators across the entire platform.

### 5. 🏛️ University Multi-Tenancy & RAG Knowledge
- **Academic Hierarchy**: Institutional scoping with Universities, Departments, Courses, and Syllabi.
- **Role Scoping**: University Admins, Course Instructors, and Students with tenant data isolation.
- **RAG Document Search**: Ingest quantum courseware, lecture notes, and research papers with semantic search and verified citations.

### 6. 🗣️ Community Discussions & Voting
- **Multi-Scope Discussions**: Filter posts by **Global**, **Friends**, or **University** scope.
- **Threaded Nested Replies**: Deep discussion hierarchies for algorithm analysis and peer troubleshooting.
- **Upvoting & Downvoting**: Community-driven ranking of questions, tutorials, and circuit solutions.

### 7. 🎓 Gamified Curriculum & Missions
- **12 Project Levels / 144 Phases**: Comprehensive step-by-step curriculum spanning Superposition to Shor's Algorithm.
- **36 Milestone Checkpoints**: In-editor challenge validation with automated unit testing.
- **XP, Streaks & Leaderboards**: Experience point progression, daily login streaks, and global leaderboards.

### 8. 🤖 AI Quantum Tutor & "What-If" Engine
- **Context-Aware AI Tutor**: Explains circuits, math formulas, and code errors using OpenAI or Gemini.
- **"What-If" Counterfactual Simulation**: Simulates gate perturbations and explains quantum decoherence effects.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Users / Browsers (Desktop & Mobile)"]
        UserBrowser["Web Browser (React 19 SPA)"]
    end

    subgraph AWSCloud["AWS Cloud (us-east-1)"]
        subgraph Ingress["Ingress & Edge CDN"]
            CF["Amazon CloudFront (CDN)\nHTTPS / Caching / SPA Fallback"]
            ALB["Application Load Balancer (ALB)\nPorts 80 / 443\n300s Timeout & WebSocket Stickiness"]
        end

        subgraph Compute["Containerized Compute (VPC Private Subnet)"]
            ECS["AWS ECS Fargate\nFastAPI + Uvicorn (Port 8000)\nNon-root qubitlab user\nStateful In-Memory Room Hub"]
        end

        subgraph Persistence["Managed Data Stores"]
            RDS[("Amazon RDS PostgreSQL 16\ngp3 20-100GB Auto-Scaling\nAutomated Backups & Deletion Protection")]
            Redis[("Amazon ElastiCache Redis 7\nSession Cache & Rate Limiting")]
            S3App["Amazon S3 Bucket\nRAG Documents & Syllabi"]
            S3Web["Amazon S3 Bucket\nFrontend SPA Static Assets"]
        end

        subgraph SecOps["Security & Observability"]
            Secrets["AWS Secrets Manager\nDB Credentials, JWT Secret, AI Keys"]
            CW["Amazon CloudWatch Logs & Alarms"]
            ECR["Amazon ECR\nImmutable Commit-SHA Image Tags"]
        end
    end

    subgraph External["External Integrations"]
        STUN["Google STUN Servers (stun.l.google.com:19302)"]
        AI["AI Provider (OpenAI / Gemini)"]
    end

    %% Routing
    UserBrowser -->|HTTPS: Static UI Assets| CF
    CF --> S3Web
    UserBrowser -->|REST API & WebSockets /ws| ALB
    ALB --> ECS
    ECS --> RDS
    ECS --> Redis
    ECS --> S3App
    ECS -.-> Secrets
    ECS --> CW
    ECS -.-> AI
    UserBrowser -.-> STUN
```

---

## 💻 Tech Stack

| Domain | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | `19.0.0` | Modern component UI library |
| | TypeScript | `5.7.0` | End-to-end type safety |
| | Vite | `8.2.2` | Lightning-fast build tooling and HMR |
| | Tailwind CSS | `v4.0.0` | High-performance styling with native CSS variables |
| | React Router | `8.3.1` | Client-side routing and deep linking |
| | KaTeX & Marked | `0.18.7` / `18.0.13` | Mathematical formula and Markdown rendering |
| | Recharts | `3.10.1` | Probability amplitudes and measurement charts |
| **Backend** | Python | `3.11` | High-performance backend runtime |
| | FastAPI | `0.115.0` | Asynchronous REST and WebSocket framework |
| | Uvicorn | `0.30.0` | High-concurrency ASGI server |
| | SQLAlchemy | `2.0.35` | Async ORM supporting SQLite and PostgreSQL |
| | Asyncpg | `0.29.0` | High-performance asynchronous PostgreSQL driver |
| | Alembic | `1.13.0` | Database schema migrations and version control |
| | Pydantic | `2.9.0` | Strict data validation and serialization |
| **Quantum** | Qiskit & Qiskit Aer | `1.2.0` / `0.15.0` | IBM Quantum SDK & statevector simulator |
| | PennyLane | `0.38.0` | Differentiable quantum machine learning |
| | Cirq | `1.4.0` | Google Quantum circuit compilation framework |
| **Infrastructure** | Terraform / OpenTofu | `>= 1.5.0` | Infrastructure as Code (AWS VPC, ECS, RDS, ALB, ECR) |
| | Docker | Latest | Multi-stage production container images |
| | Nginx | `1.27-alpine` | High-performance production web server for SPA |
| | GitHub Actions | Latest | Automated CI/CD with AWS OIDC authentication |

---

## 📂 Project Layout

```text
ELRA 2/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # CI: Typecheck, tests, terraform fmt/validate, docker build
│       └── deploy.yml                 # CD: AWS OIDC, commit SHA tag, push to ECR, Alembic, ECS deploy
├── terraform/                         # Terraform AWS Infrastructure as Code
│   ├── versions.tf                    # Provider constraints & S3 remote state
│   ├── providers.tf                   # AWS provider and global tags
│   ├── variables.tf                   # Configurable infrastructure variables
│   ├── locals.tf                      # Naming conventions & tags
│   ├── network.tf                     # VPC, public/private subnets, IGW, NAT GW
│   ├── compute.tf                     # ECS Cluster, Fargate task/service, ALB, target groups
│   ├── database.tf                    # RDS PostgreSQL 16 instance & subnet group
│   ├── redis.tf                       # ElastiCache Redis 7 replication group
│   ├── storage.tf                     # S3 buckets & CloudFront CDN
│   ├── registry.tf                    # ECR repositories with lifecycle policies
│   ├── security.tf                    # Security groups & least-privilege IAM roles
│   ├── secrets.tf                     # AWS Secrets Manager credentials
│   ├── monitoring.tf                  # CloudWatch log groups & metric alarms
│   ├── outputs.tf                     # Exported DNS names, ARNs, and endpoints
│   ├── terraform.tfvars.example       # Example variable configuration
│   ├── environments/
│   │   ├── dev/                       # Development environment caller
│   │   └── prod/                      # Production environment caller
│   └── README.md                      # Complete Terraform reference guide
├── backend/                           # FastAPI Application
│   ├── app/
│   │   ├── api/v1/                    # API route controllers (auth, IDE, rooms, social, etc.)
│   │   ├── core/                      # Settings, security, logging, database engine
│   │   ├── models/                    # SQLAlchemy database models
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   ├── services/                  # Quantum engines & connection managers
│   │   └── main.py                    # Application entry point, lifespan, & /health
│   ├── migrations/                    # Alembic migration revisions
│   ├── tests/                         # 138 backend automated tests
│   ├── Dockerfile                     # Multi-stage non-root Python 3.11 image
│   └── requirements.txt               # Backend dependencies
├── src/                               # React 19 Frontend SPA
│   ├── components/
│   │   ├── ide/                       # Quantum IDE components (CodeEditor, CircuitVisualizer, etc.)
│   │   ├── CollabRoom.tsx             # Real-time collaboration UI (circuit, chat, voice call)
│   │   └── QuantumVisuals.tsx         # Bloch sphere, statevector & histograms
│   ├── pages/                         # Application views (Workspace, Social, Learn, etc.)
│   ├── lib/                           # API, auth context, WebSocket client, simulator
│   └── App.tsx                        # Router and route configurations
├── docs/                              # Production Documentation
│   ├── DEPLOYMENT.md                  # Comprehensive AWS cloud deployment runbook
│   ├── TERRAFORM.md                   # Complete Terraform reference guide
│   └── CICD.md                        # GitHub Actions CI/CD and rollback specifications
├── Dockerfile                         # Production multi-stage frontend Dockerfile (Node 22 + Nginx)
├── nginx.conf                         # Production Nginx SPA configuration with /healthz
├── docker-compose.yml                 # Root full-stack local composition (db, redis, backend, frontend)
└── package.json                       # Frontend dependencies & npm scripts
```

---

## 🚀 Quickstart Guide

### Option A: Docker Compose (Full Stack)
Run the entire production-grade stack (PostgreSQL, Redis, FastAPI backend, and Nginx frontend) with one command:

```bash
docker compose up --build
```
- **Frontend SPA**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Swagger Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option B: Local Manual Setup

#### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env         # Pre-configured for local SQLite
alembic upgrade head         # Run database migrations

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup
```bash
# In a new terminal tab at project root
npm install
npm run dev
```
Open [http://localhost:8443](http://localhost:8443) in your browser.

---

## 🧪 Testing & Quality Assurance

QubitLab includes an exhaustive test suite covering all application layers:

### 1. Backend Pytest Suite (138 Tests)
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```
- **Test Results**: `138 passed in 87.66s (100% pass rate)`
- **Coverage**: Quantum IDE execution, circuit analyzer, goal-aware tutor, discussions, university RAG, interactive curriculum, and security authorization.

### 2. Frontend Unit Tests (19 Tests)
```bash
node backend/tests/test_quantum_ide.mjs
node backend/tests/test_curriculum.mjs
```
- **Test Results**: `19 passed (100% pass rate)`
- **Coverage**: Native Bell state simulation, superposition, GHZ state, syntax highlighter security, starter templates, and curriculum phase structures.

### 3. Frontend TypeScript & Bundle Verification
```bash
npx tsc --noEmit
npm run build
```
- **Result**: `0 errors, production bundle built in 426ms`

### 4. Docker & Terraform Local Validation
```bash
docker compose config
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform validate
terraform fmt -check -recursive terraform/
```
- **Result**: `docker-compose syntax 100% valid; Terraform configuration valid`

---

## ☁️ Infrastructure as Code (Terraform)

The `terraform/` directory manages the complete AWS architecture with zero plaintext secrets:
- **Remote State**: S3 bucket with AES-256 encryption and DynamoDB distributed locking.
- **Environments**: Isolated `dev` (single AZ, cost-optimized) and `prod` (Multi-AZ, deletion protection).
- **Least Privilege IAM**: Separate execution, task, and GitHub Actions OIDC deployment roles.

To plan and deploy:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform plan -out=tfplan
terraform apply tfplan
```
*For complete instructions, see [docs/TERRAFORM.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/TERRAFORM.md).*

---

## 🔄 CI/CD & Deployment Pipeline

QubitLab features an automated, production-tested delivery pipeline powered by GitHub Actions:

1. **Pull Request / Commit**:
   - `frontend-ci`: TypeScript check, Vite build, node unit tests.
   - `backend-ci`: Python 3.11 setup, dependencies, pytest test suite.
   - `terraform-ci`: `tofu fmt -check`, module validation.
   - `docker-ci`: Validates Docker Compose and builds container images.
   - `security-ci`: Automated secret scanning and npm dependency vulnerability audit.
2. **Merge to Main**:
   - Authenticates to AWS via **GitHub OIDC** (no hardcoded keys).
   - Tags Docker images with immutable **Commit SHA** (`qubitlab-backend:<commit-sha>`).
   - Pushes images to Amazon ECR.
   - Runs Alembic database migrations (`alembic upgrade head`) via one-off ECS task.
   - Forces zero-downtime deployment on Amazon ECS Fargate.
   - Polls `/health` until HTTP 200 is confirmed.
3. **Rollback**:
   - Deploy any previous commit SHA in seconds using the GitHub Actions CD `workflow_dispatch` trigger.

*For complete pipeline details, see [docs/CICD.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/CICD.md) and [docs/DEPLOYMENT.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/DEPLOYMENT.md).*

---

## ⚙️ Environment Configuration

| Variable | Scope | Description | Default / Example |
|---|---|---|---|
| `ENVIRONMENT` | Backend | Runtime mode (`development` vs `production`) | `production` |
| `DEBUG` | Backend | Enable verbose debug logs & tracebacks | `false` |
| `DATABASE_URL` | Backend | Database connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Backend | Redis connection string for cache & rate limits | `redis://redis:6379/0` |
| `JWT_SECRET_KEY` | Backend | Secret key for signing authentication tokens | *Injected from AWS Secrets Manager* |
| `CORS_ORIGINS` | Backend | Allowed CORS origins for web requests | `https://app.yourdomain.com` |
| `AI_PROVIDER` | Backend | AI Tutor provider (`openai` or `gemini`) | `openai` |
| `AI_API_KEY` | Backend | API Key for LLM Tutor | *Injected from AWS Secrets Manager* |
| `VITE_API_URL` | Frontend | Public REST API base URL | `https://api.yourdomain.com/api/v1` |
| `VITE_WS_URL` | Frontend | Public WebSocket base URL | `wss://api.yourdomain.com` |

---

## 📡 API Endpoints Overview

| Method | Path | Summary | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Bearer |
| `POST` | `/api/v1/simulations/run` | Execute circuit simulation (visual) | Bearer |
| `POST` | `/api/v1/simulations/ide/run` | Execute Quantum IDE code (Qiskit/PennyLane/Cirq/Native) | Bearer |
| `POST` | `/api/v1/rooms/create` | Create a collaboration room | Bearer |
| `POST` | `/api/v1/rooms/join/{code}` | Join collaboration room via code | Bearer |
| `GET` | `/api/v1/social/friends` | List accepted friends | Bearer |
| `GET` | `/api/v1/discussions` | List threaded discussion posts (global/friends/university) | Bearer |
| `POST` | `/api/v1/discussions` | Create a new discussion post or reply | Bearer |
| `GET` | `/api/v1/university/courses` | List university courses & syllabus | Bearer |
| `POST` | `/api/v1/university/rag/search` | Search RAG quantum knowledge base | Bearer |
| `GET` | `/health` | Production health check (active SQL probe & engine status) | Public |
| `WS` | `/ws/rooms/{room_id}` | Real-time circuit sync, chat & WebRTC voice signaling | Bearer |
| `WS` | `/ws/social` | Global user presence & private direct messaging | Bearer |

---

## 📚 Documentation Directory

- 📖 [docs/DEPLOYMENT.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/DEPLOYMENT.md): Complete AWS cloud deployment runbook.
- 🛠️ [docs/TERRAFORM.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/TERRAFORM.md): Comprehensive Terraform resource reference and safety guide.
- 🚀 [docs/CICD.md](file:///Users/helloteddy/Downloads/ELRA%202/docs/CICD.md): GitHub Actions CI/CD workflows and rollback procedures.
- 📋 [AWS_DEPLOYMENT_PLAN.md](file:///Users/helloteddy/Downloads/ELRA%202/AWS_DEPLOYMENT_PLAN.md): Architectural design and sizing rationale.

---

## 📜 License & Acknowledgments

This project is licensed under the MIT License. Built with ❤️ for the quantum computing community, educators, researchers, and developers worldwide.
