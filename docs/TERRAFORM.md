# QubitLab Terraform Infrastructure Reference

This document details the Infrastructure-as-Code (IaC) configuration for QubitLab, covering AWS resource topologies, security models, environment management, and lifecycle best practices.

---

## 1. Managed Resources Topology

| Category | Resource Name | AWS Service | Purpose |
|---|---|---|---|
| **Networking** | `aws_vpc.main` | VPC | Isolated network (`10.0.0.0/16`) |
| | `aws_subnet.public[*]` | Subnets | 2 Public subnets across AZ-a & AZ-b |
| | `aws_subnet.private[*]` | Subnets | 2 Private subnets across AZ-a & AZ-b |
| | `aws_internet_gateway.main`| IGW | Internet egress/ingress for public subnets |
| | `aws_nat_gateway.main` | NAT Gateway | Outbound internet for private containers |
| **Compute** | `aws_ecs_cluster.main` | ECS | Container orchestration cluster |
| | `aws_ecs_task_definition.backend` | Fargate Task | FastAPI container with health checks |
| | `aws_ecs_service.backend` | ECS Service | Fargate service with circuit breaker |
| | `aws_lb.main` | ALB | Public load balancer with 300s timeout |
| | `aws_lb_target_group.backend` | Target Group | IP target group with sticky sessions |
| **Database** | `aws_db_instance.postgres` | RDS PostgreSQL 16 | Relational database (20-100GB gp3) |
| | `aws_db_subnet_group.postgres` | DB Subnet Group | Private subnet placement |
| **Cache** | `aws_elasticache_replication_group.redis` | ElastiCache Redis 7 | In-memory cache & rate limiting |
| **Storage & CDN** | `aws_s3_bucket.frontend` | S3 | Static React SPA distribution |
| | `aws_s3_bucket.storage` | S3 | RAG documents & courseware uploads |
| | `aws_cloudfront_distribution.frontend` | CloudFront | Global edge CDN with OAC and SPA routing |
| **Registries** | `aws_ecr_repository.backend` | ECR | Container repository for backend |
| | `aws_ecr_repository.frontend` | ECR | Container repository for frontend |
| **Security** | `aws_secretsmanager_secret.app_secrets` | Secrets Manager | Encrypted credentials & tokens |
| | `aws_iam_role.github_actions_cd` | IAM OIDC Role | Temporary federated access for CD |
| | `aws_iam_role.ecs_execution` | IAM Role | ECS agent image pull & secret read |
| | `aws_iam_role.ecs_task` | IAM Role | Container runtime permissions (S3 access) |
| **Monitoring** | `aws_cloudwatch_log_group.backend` | CloudWatch Logs | Structured container logs |
| | `aws_cloudwatch_metric_alarm.alb_5xx` | CloudWatch Alarms| Alerts on 5XX errors |

---

## 2. Directory Layout & Environments

```
terraform/
├── versions.tf          # Terraform >= 1.5, AWS ~> 5.0
├── providers.tf         # AWS Provider definition and default tags
├── variables.tf         # Root module variables
├── locals.tf            # Naming prefixes and common tags
├── network.tf           # VPC, Subnets, IGW, NAT, Route Tables
├── compute.tf           # ECS Cluster, Task, Service, ALB, Target Groups
├── database.tf          # RDS PostgreSQL 16 instance & subnet group
├── redis.tf             # ElastiCache Redis 7 cluster
├── storage.tf           # S3 buckets & CloudFront CDN
├── registry.tf          # ECR Repositories with lifecycle rules
├── security.tf          # Security groups & least-privilege IAM roles
├── secrets.tf           # AWS Secrets Manager secret & random credentials
├── monitoring.tf        # CloudWatch log groups & metric alarms
├── outputs.tf           # Exported ARNs, DNS names, and endpoints
├── terraform.tfvars.example # Example variable settings
└── environments/
    ├── dev/             # Minimal dev environment (single AZ, 1-day backup)
    └── prod/            # Production environment (Multi-AZ, deletion protection)
```

---

## 3. Remote State Architecture

Terraform state contains sensitive resource metadata and must never be committed to Git.
Remote state locking prevents race conditions and concurrent applies:

1. **State Storage**: Amazon S3 bucket with versioning and AES-256 encryption.
2. **State Locking**: Amazon DynamoDB table with primary key `LockID`.
3. **Configuration**:
   ```hcl
   backend "s3" {
     bucket         = "qubitlab-terraform-state-<ACCOUNT_ID>"
     key            = "qubitlab/terraform.tfstate"
     region         = "us-east-1"
     dynamodb_table = "qubitlab-terraform-locks"
     encrypt        = true
   }
   ```

> [!NOTE]
> The S3 backend block is provided as a pre-configured template in `versions.tf` (commented out by default to support offline and local dry-run validation). To enable remote state, bootstrap the S3 bucket and DynamoDB table as shown below and uncomment the backend block.


---

## 4. Environment Comparison

| Parameter | Dev (`environments/dev`) | Production (`environments/prod`) |
|---|---|---|
| **RDS Instance Class** | `db.t4g.micro` | `db.t4g.micro` or `db.t4g.small` |
| **RDS Deletion Protection** | `false` | `true` |
| **RDS Multi-AZ** | `false` | `true` |
| **RDS Backup Retention** | 1 day | 7 days |
| **ECS Task CPU / RAM** | 512 / 1024 MiB | 1024 / 2048 MiB |
| **Redis Replication** | 1 node (single cluster) | 2 nodes (multi-AZ failover) |
| **CloudWatch Log Retention**| 14 days | 30 days |

---

## 5. Terraform Commands Runbook

### Formatting Check
```bash
terraform fmt -check -recursive .
```

### Initialization
```bash
terraform init -backend=false   # Local dry-run
terraform init                  # With remote S3 backend
```

### Validation
```bash
terraform validate
```

### Plan Infrastructure
```bash
terraform plan -var-file=terraform.tfvars -out=tfplan
```

### Apply Infrastructure
```bash
terraform apply tfplan
```

> **CRITICAL SAFETY RULE:**
> `terraform destroy` is strictly prohibited in automated CI/CD pipelines. All changes must be reviewed in a `terraform plan` output prior to application.
