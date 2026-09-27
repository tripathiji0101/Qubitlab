# QubitLab CI/CD Pipeline Documentation

This document describes the continuous integration and continuous deployment (CI/CD) pipelines for **QubitLab**, implemented using GitHub Actions, Docker, Amazon ECR, and Amazon ECS.

---

## 1. Pipeline Overview

```
Developer
   │
   ├─► Git Push / Pull Request
   │        │
   │        ▼
   │   GitHub Actions CI (.github/workflows/ci.yml)
   │        ├─► Frontend: npm ci, tsc --noEmit, build, unit tests
   │        ├─► Backend: Python 3.11, pytest, quantum engines
   │        ├─► Terraform: fmt -check, init -backend=false, validate
   │        ├─► Docker: compose config, build frontend & backend
   │        └─► Security: Secret scan, npm audit
   │
   └─► Merge to main
            │
            ▼
       GitHub Actions CD (.github/workflows/deploy.yml)
            ├─► Authenticate AWS via OpenID Connect (OIDC)
            ├─► Tag Docker images with immutable Commit SHA
            ├─► Build & Push images to Amazon ECR
            ├─► Sync static bundle to S3 & invalidate CloudFront
            ├─► Run Alembic database migrations (one-off ECS task)
            ├─► Deploy new task definition to ECS Fargate
            ├─► Wait for ECS service stabilization
            └─► Verify production health check (/health HTTP 200)
```

---

## 2. CI Pipeline (`.github/workflows/ci.yml`)

The CI workflow triggers on any `push` or `pull_request` to `main`, `master`, or `dev`.
It executes five parallel jobs:

### Job 1: `frontend-ci`
- **Node Environment**: Node.js 22 with npm cache.
- **Typecheck**: `npx tsc --noEmit` verifies strict TypeScript compilation with 0 errors.
- **Production Build**: `npm run build` verifies Vite asset bundling and rollups.
- **Unit Tests**:
  - `test_quantum_ide.mjs`: Tests native Bell state, superposition, GHZ state simulation, syntax highlighter safety, and starter templates.
  - `test_curriculum.mjs`: Tests curriculum structure, math formatting, and activity validation across all 12 phases.

### Job 2: `backend-ci`
- **Python Environment**: Python 3.11 with pip cache.
- **Dependency Installation**: `pip install -r backend/requirements.txt`.
- **Pytest Suite**:
  - Runs all unit and API integration tests in `backend/tests/`.
  - Verifies Qiskit Aer, PennyLane, and Google Cirq engines.
  - Verifies discussions, university RAG, goal-aware tutor, circuit analyzer, and quantum IDE endpoints.

### Job 3: `terraform-ci`
- **OpenTofu / Terraform Setup**: Version 1.8+.
- **Formatting**: `tofu fmt -check -recursive terraform/`.
- **Validation**: `tofu -chdir=terraform init -backend=false && tofu -chdir=terraform validate`.

### Job 4: `docker-ci`
- **Docker Buildx**:
  - Verifies `docker compose config` syntax is completely valid.
  - Builds `qubitlab-frontend:ci-test` from root `Dockerfile`.
  - Builds `qubitlab-backend:ci-test` from `backend/Dockerfile`.

### Job 5: `security-ci`
- **Secret Scanning**: Scans for unmasked AWS access keys, private RSA keys, or API tokens in tracked files.
- **Dependency Audit**: `npm audit --audit-level=critical`.

---

## 3. CD Pipeline (`.github/workflows/deploy.yml`)

The CD workflow triggers on `push` to `main` or manually via `workflow_dispatch`.

### 1. AWS Authentication with OpenID Connect (OIDC)
No permanent AWS access keys (`AKIA...`) are stored in GitHub Secrets.
GitHub Actions exchanges an ephemeral JWT token signed by GitHub for temporary AWS credentials using STS `AssumeRoleWithWebIdentity`:
```yaml
- name: Configure AWS Credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ vars.AWS_REGION || 'us-east-1' }}
    audience: sts.amazonaws.com
```

### 2. Immutable Image Tagging
Production images are tagged with the Git commit SHA:
```
<ECR_REGISTRY>/qubitlab-backend:<commit-sha>
<ECR_REGISTRY>/qubitlab-frontend:<commit-sha>
```
The `:latest` tag is also updated for convenience, but the ECS task definition strictly references the immutable commit SHA to enable deterministic rollbacks.

### 3. Database Migration Execution
Before deploying the updated container to active users, Alembic migrations are executed:
```bash
aws ecs run-task \
  --cluster qubitlab-prod-cluster \
  --task-definition qubitlab-prod-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$BACKEND_SG_ID],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides": [{"name": "backend", "command": ["alembic", "upgrade", "head"]}]}'
```

### 4. Zero-Downtime ECS Service Update
ECS Fargate launches the new task container and drains the old container only after the new task passes health checks:
```bash
aws ecs update-service \
  --cluster qubitlab-prod-cluster \
  --service qubitlab-prod-backend-service \
  --force-new-deployment
```

### 5. Automated Health Check Verification
The workflow polls `/health` up to 12 times with 10-second delays.
Deployment succeeds only when the health endpoint returns HTTP 200 with `"status": "healthy"`.

---

## 4. Rollback Runbook

### Scenario: Reverting a Broken Release
If commit `c3d4e5f` causes a regression in production:

1. **Locate Last Known Good Commit SHA**:
   Check Git history for previous healthy release (e.g. `a1b2c3d`).

2. **Trigger Rollback Workflow**:
   - Go to GitHub Repository → **Actions** → **QubitLab CD**.
   - Click **Run workflow**.
   - Set **Target deployment environment**: `prod`.
   - Set **Custom image tag**: `a1b2c3d`.
   - Set **Run Alembic database migrations**: `false`.
   - Click **Run workflow**.

3. **Verification**:
   - CD deploys `qubitlab-backend:a1b2c3d`.
   - Health check probe verifies HTTP 200.
   - Zero downtime experienced by users.

> **DATABASE NOTE:** If the broken release included a forward database migration that cannot run with the old application version, review the migration downgrade script before manually applying `alembic downgrade -1`.
