# QubitLab Production Deployment Guide

This guide provides comprehensive, step-by-step instructions for deploying and operating the **QubitLab** quantum computing learning platform in production on Amazon Web Services (AWS) using Terraform and GitHub Actions.

---

## 1. High-Level Architecture

```mermaid
flowchart TD
    subgraph Clients["Users / Browsers (Desktop & Mobile)"]
        UserBrowser["Web Browser (React 19 SPA)"]
    end

    subgraph AWSCloud["AWS Cloud (us-east-1)"]
        subgraph Edge["Edge & Ingress Layer"]
            CloudFront["Amazon CloudFront (CDN)\nHTTPS / Caching / SPA Fallback"]
            ACM["AWS Certificate Manager (ACM)\nSSL/TLS Certificates"]
            Route53["Amazon Route 53 (DNS)\nOptional Custom Domain"]
        end

        subgraph S3Static["Static Web Assets"]
            S3Frontend["S3 Bucket (Frontend SPA)\nPrivate with OAC Access"]
        end

        subgraph VPC["Virtual Private Cloud (10.0.0.0/16)"]
            subgraph PublicSubnets["Public Subnets (AZ-a & AZ-b)"]
                ALB["Application Load Balancer (ALB)\nPorts 80 / 443\n300s Idle Timeout\nSticky Routing for WebSockets"]
                NATGW["NAT Gateway\nOutbound Internet for Private Subnets"]
            end

            subgraph PrivateSubnets["Private Subnets (AZ-a & AZ-b)"]
                ECS["AWS ECS Fargate\nFastAPI + Uvicorn (Port 8000)\nNon-root qubitlab user\nStateful In-Memory WebSocket Manager"]
                RDS[("Amazon RDS PostgreSQL 16\ngp3 20-100GB Storage Autoscaling\nAutomated Daily Snapshots\nDeletion Protection")]
                Redis[("Amazon ElastiCache Redis 7\nCache & Rate Limiting")]
            end
        end

        subgraph Ops["Observability & Secrets Management"]
            CWLogs["CloudWatch Logs & Metric Alarms"]
            SecretsManager["AWS Secrets Manager\nDB URL, JWT Secret, AI API Keys"]
            ECR["Amazon ECR (Immutable Image Tags)"]
        end

        subgraph S3Storage["Application Storage"]
            S3App["S3 Bucket (RAG Documents & Syllabus)"]
        end
    end

    subgraph External["External Services"]
        GoogleSTUN["Google STUN Servers\n(WebRTC Voice Calls)"]
        AIProvider["AI Provider (OpenAI / Gemini)\nAI Tutor & RAG Explanations"]
    end

    %% Ingress Flows
    UserBrowser -->|HTTPS: Load UI Bundle| CloudFront
    CloudFront -->|Origin Request| S3Frontend
    UserBrowser -->|REST API & WebSockets /ws| ALB
    ALB -->|Forward Port 8000| ECS

    %% Backend Flows
    ECS -->|Async SQL (asyncpg)| RDS
    ECS -->|Cache / Sessions| Redis
    ECS -->|Fetch Encrypted Credentials| SecretsManager
    ECS -->|Push Logs & Metrics| CWLogs
    ECS -->|Document Storage| S3App
    ECS -.->|Outbound HTTPS via NAT| AIProvider
    UserBrowser -.->|STUN Traversal| GoogleSTUN
```

---

## 2. Prerequisites

Before starting deployment, ensure you have:

1. **AWS Account**: An active AWS account with permissions for VPC, IAM, ECS, RDS, ElastiCache, S3, CloudFront, ECR, and Secrets Manager.
2. **AWS CLI v2**: Installed and authenticated locally:
   ```bash
   aws sts get-caller-identity
   ```
3. **Terraform (>= 1.5.0)** or **OpenTofu (>= 1.6.0)** installed locally.
4. **Docker Engine**: Installed and running locally.
5. **Node.js (v20+ or v22+) & Python 3.11** installed locally.
6. **GitHub Repository**: Admin access to configure GitHub Actions secrets and variables.

---

## 3. Production Environment & Secrets Reference

### Backend Secrets (Managed in AWS Secrets Manager)
All production backend secrets are stored encrypted in AWS Secrets Manager under secret `${project_name}-${environment}-app-secrets` and injected dynamically into the ECS Task:

| Secret Key | Description | Format / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL asyncpg connection string | `postgresql+asyncpg://qubitlab_admin:<PASSWORD>@<RDS_ENDPOINT>:5432/qubitlab` |
| `DATABASE_PASSWORD` | Master password for PostgreSQL | Auto-generated 32-character random string |
| `JWT_SECRET_KEY` | HMAC-SHA256 signature key for auth | Auto-generated 64-character random string |
| `AI_PROVIDER` | AI backend provider | `"openai"` or `"gemini"` |
| `AI_API_KEY` | API key for LLM tutor | `sk-...` |
| `AI_MODEL` | LLM model identifier | `"gpt-4o-mini"` or `"gemini-1.5-flash"` |

### Backend Non-Sensitive Variables (ECS Task Environment)
| Variable | Production Value | Purpose |
|---|---|---|
| `APP_NAME` | `QubitLab` | Service identifier |
| `ENVIRONMENT` | `production` | Enforces production mode (disables auto-init DB, enables SELECT 1 health probe) |
| `DEBUG` | `false` | Disables debug mode and verbose stack traces |
| `PORT` | `8000` | ASGI listening port |
| `REDIS_URL` | `redis://<ELASTICACHE_ENDPOINT>:6379/0` | Session caching & rate limiting |
| `LOG_LEVEL` | `INFO` | Structured JSON log verbosity |
| `CORS_ORIGINS` | Comma-separated list | Allowed origins for web security |

### Frontend Build-Time Environment (`VITE_*`)
> **SECURITY WARNING:** Anything prefixed with `VITE_` is compiled directly into browser client code. NEVER put private keys, database passwords, or AI secret keys in `VITE_` variables.

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base endpoint for REST API calls | `https://api.yourdomain.com/api/v1` or ALB DNS |
| `VITE_WS_URL` | Base endpoint for WebSockets | `wss://api.yourdomain.com` or `ws://<ALB_DNS>` |
| `VITE_ICE_SERVERS` | (Optional) Custom WebRTC STUN/TURN JSON | Default Google STUN servers used if omitted |

---

## 4. Terraform Infrastructure Setup

### Step 1: Bootstrap S3 Remote State & DynamoDB Locking
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 1. Create S3 Bucket for Terraform State
aws s3api create-bucket \
  --bucket "qubitlab-terraform-state-${AWS_ACCOUNT_ID}" \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket "qubitlab-terraform-state-${AWS_ACCOUNT_ID}" \
  --versioning-configuration Status=Enabled

# 2. Create DynamoDB Table for Distributed State Locking
aws dynamodb create-table \
  --table-name "qubitlab-terraform-locks" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Initialize & Validate Terraform
```bash
cd terraform

# Uncomment the backend block in versions.tf with your S3 bucket name
terraform init
terraform fmt -check -recursive .
terraform validate
```

### Step 3: Configure Variables and Plan
```bash
cp terraform.tfvars.example terraform.tfvars
# Update terraform.tfvars with your GitHub repository and optional domain settings

terraform plan -out=tfplan
```

### Step 4: Apply Infrastructure
```bash
terraform apply tfplan
```
*Note output values: ALB DNS, ECR URLs, S3 Buckets, and the GitHub Actions Role ARN.*

---

## 5. GitHub Actions CI/CD Setup

### 1. GitHub OpenID Connect (OIDC) Authentication
QubitLab uses **GitHub OIDC** to authenticate GitHub Actions directly with AWS IAM without storing long-lived, permanent access keys in the repository.

1. The GitHub OIDC Identity Provider (`https://token.actions.githubusercontent.com` with audience `sts.amazonaws.com`) is explicitly managed by Terraform (`aws_iam_openid_connect_provider.github`).
   - If this provider already exists in your AWS account, either set `create_oidc_provider = false` in your Terraform variables, or import it into state:
     ```bash
     terraform import aws_iam_openid_connect_provider.github[0] arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com
     ```
2. The Terraform module creates the role `qubitlab-prod-github-actions-cd-role` (`aws_iam_role.github_actions_cd`) with trust policy strictly scoped to the `main` branch and targeted environment:
   ```json
   "token.actions.githubusercontent.com:sub": [
     "repo:tripathiji0101/Qubitlab:ref:refs/heads/main",
     "repo:tripathiji0101/Qubitlab:environment:prod"
   ]
   ```

### 2. Configure GitHub Secrets & Variables
In your GitHub Repository, navigate to **Settings** → **Secrets and variables** → **Actions**:

#### Repository Secrets
| Secret Name | Value |
|---|---|
| `AWS_ROLE_ARN` | Value of Terraform output `github_actions_role_arn` (e.g. `arn:aws:iam::<ACCOUNT_ID>:role/qubitlab-prod-github-actions-cd-role`). *Do not hardcode or commit this value to source control.* |

#### Repository Variables
| Variable Name | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `VITE_API_URL` | Production API URL (e.g. `https://api.yourdomain.com/api/v1` or `http://<ALB_DNS>/api/v1`) |
| `VITE_WS_URL` | Production WebSocket URL (e.g. `wss://api.yourdomain.com` or `ws://<ALB_DNS>`) |
| `FRONTEND_S3_BUCKET` | Output `frontend_s3_bucket` from Terraform |
| `CLOUDFRONT_DISTRIBUTION_ID` | Output `cloudfront_distribution_id` from Terraform |
| `BACKEND_HEALTHCHECK_URL` | Output `health_check_url` from Terraform (e.g. `http://<ALB_DNS>/health`) |
| `MIGRATION_SUBNET_ID` | Private Subnet ID for running one-off ECS migration tasks |
| `BACKEND_SG_ID` | Backend Security Group ID for running one-off ECS migration tasks |

---

## 6. Database Migrations (Alembic)

QubitLab uses **Alembic** for safe database schema migrations.
All 24 relational tables are defined in migrations:
- `001_initial_schema`: Users, circuits, levels, challenges, achievements.
- `002_add_discussion_tables`: Discussion posts, nested threads, votes.
- `003_add_university_and_rag_tables`: Universities, departments, courses, syllabi, RAG documents.

### Running Migrations in Production:
1. **Automated (CD Pipeline)**:
   The CD workflow triggers an ECS one-off task using the newly deployed image:
   ```bash
   aws ecs run-task \
     --cluster qubitlab-prod-cluster \
     --task-definition qubitlab-prod-backend \
     --launch-type FARGATE \
     --overrides '{"containerOverrides": [{"name": "backend", "command": ["alembic", "upgrade", "head"]}]}'
   ```
2. **Manual (From Bastion or Local VPN with RDS access)**:
   ```bash
   cd backend
   export DATABASE_URL="postgresql+asyncpg://qubitlab_admin:<PASSWORD>@<RDS_ENDPOINT>:5432/qubitlab"
   alembic upgrade head
   ```

> **SAFETY RULE:** Never run `Base.metadata.drop_all()` or delete migration versions in production. Always create forward-only migration scripts (`alembic revision --autogenerate -m "description"`).

---

## 7. Rollback Procedure

QubitLab uses **immutable Docker image tags** tagged with the Git commit SHA (e.g. `qubitlab-backend:8f31c2a`).

### To Roll Back Application Containers:
If a newly deployed image introduces a bug or regression:

1. Identify the previous known-good commit SHA (e.g. `a1b2c3d`).
2. Navigate to **Actions** → **QubitLab CD** in GitHub.
3. Click **Run workflow**:
   - Environment: `prod`
   - Image Tag: `a1b2c3d`
   - Run Migrations: `false` (do not run unneeded migrations during application rollback)
4. GitHub Actions will pull the verified image `qubitlab-backend:a1b2c3d` from ECR and force an ECS zero-downtime deployment.
5. The ECS deployment circuit breaker will monitor the roll-forward; if the new container does not pass `/health` within 3 minutes, ECS automatically rolls back to the prior task definition.

### Database Rollback Note:
Database rollbacks and application container rollbacks are separate concerns. Never automatically downgrade a database migration while user data is being written. If a schema change must be reverted, inspect the migration down-revision carefully before running `alembic downgrade -1`.

---

## 8. Health Check & Verification

QubitLab provides an active production health check endpoint at `/health`.

In production (`ENVIRONMENT=production`), this endpoint performs an active SQL probe:
```python
SELECT 1;
```
Expected HTTP 200 JSON Response:
```json
{
  "status": "healthy",
  "service": "QubitLab",
  "environment": "production",
  "quantum_engines": [
    "Qiskit Aer Simulator",
    "PennyLane Quantum Engine",
    "Google Cirq Simulator"
  ],
  "database": "connected"
}
```
If the database connection is lost, it returns `"status": "degraded"` with `"database": "unreachable"`.
The ALB health check matcher requires HTTP 200, automatically keeping degraded tasks from serving traffic until recovered.
