# QubitLab Infrastructure as Code (Terraform)

This directory contains the production-grade Terraform configuration for deploying QubitLab to Amazon Web Services (AWS).

---

## Architecture Overview

```
                      Internet
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
 Amazon CloudFront (CDN)       Application Load Balancer (ALB)
        │                                 │ (Ports 80/443, Stickiness)
        ▼                                 ▼
 Amazon S3 (SPA Frontend)       AWS ECS Fargate (FastAPI Backend)
                                          │
                        ┌─────────────────┼─────────────────┐
                        ▼                 ▼                 ▼
                  Amazon RDS        ElastiCache         Amazon S3
                PostgreSQL 16         Redis 7            Storage
```

- **Networking**: VPC across 2 Availability Zones with isolated Public and Private subnets, Internet Gateway, and NAT Gateway.
- **Compute**: ECS Fargate running non-root FastAPI container with health check on `/health` and deployment circuit breaker rollback.
- **Load Balancing**: Application Load Balancer with 300s idle timeout and sticky session routing for WebSockets.
- **Database**: Amazon RDS PostgreSQL 16 in private subnets with automated backups, storage autoscaling, and deletion protection in production.
- **Cache**: Amazon ElastiCache Redis 7 for real-time state, session caching, and rate limiting.
- **Storage & CDN**: CloudFront CDN with S3 Origin Access Control (OAC) serving the React SPA with client-side routing fallback.
- **Registry**: Amazon ECR repositories with image vulnerability scanning on push and lifecycle policies for immutable tags.
- **Secrets**: AWS Secrets Manager storing encrypted database credentials, JWT secrets, and AI keys.
- **Security & IAM**: Least privilege IAM roles for ECS execution, task runtime, and GitHub Actions OIDC deployment (no long-lived access keys).

---

## Directory Structure

```
terraform/
├── versions.tf               # Terraform and provider version constraints
├── providers.tf              # AWS provider configuration and global tags
├── variables.tf              # Configurable variables with sensible defaults
├── locals.tf                 # Local naming conventions and tags
├── network.tf                # VPC, subnets, IGW, NAT GW, route tables
├── compute.tf                # ECS cluster, task definition, service, ALB
├── database.tf               # RDS PostgreSQL 16 instance & subnet group
├── redis.tf                  # ElastiCache Redis 7 replication group
├── storage.tf                # S3 buckets and CloudFront distribution
├── registry.tf               # ECR repositories and lifecycle policies
├── security.tf               # Security groups and least-privilege IAM roles
├── secrets.tf                # AWS Secrets Manager credentials
├── monitoring.tf             # CloudWatch log groups and metric alarms
├── outputs.tf                # Exported DNS, endpoints, and ARNs
├── terraform.tfvars.example  # Example variables template
├── environments/
│   ├── dev/                  # Development environment module caller
│   └── prod/                 # Production environment module caller
└── README.md                 # This guide
```

---

## Prerequisites

1. **AWS CLI** (version 2.x) configured with appropriate administrative permissions:
   ```bash
   aws configure
   ```
2. **Terraform** (>= 1.5.0) or **OpenTofu** (>= 1.6.0).
3. (Optional) Custom domain and ACM certificate ARN if enabling HTTPS with a custom domain.

---

## Remote State Setup (S3 + DynamoDB)

Before deploying to production, create an S3 bucket and DynamoDB table for remote state storage:

```bash
# 1. Create S3 bucket for state
aws s3api create-bucket \
  --bucket qubitlab-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --region us-east-1

# Enable versioning on state bucket
aws s3api put-bucket-versioning \
  --bucket qubitlab-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --versioning-configuration Status=Enabled

# 2. Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name qubitlab-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Uncomment the `backend "s3"` block in `versions.tf` (or `environments/prod/main.tf`) with your bucket name.

---

## Local Usage & Deployment

### 1. Format and Validate Code
```bash
terraform fmt -check -recursive .
terraform init -backend=false
terraform validate
```

### 2. Plan Infrastructure
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform plan -out=tfplan
```

### 3. Apply Infrastructure
```bash
terraform apply tfplan
```

---

## Security Best Practices Followed

1. **Sensitive State & No Hardcoded Secrets**: Secrets are not hardcoded in source/configuration; passwords and tokens are dynamically generated and stored in AWS Secrets Manager, and Terraform state must be treated as sensitive.
2. **Private Networking**: Database and Redis instances are deployed in private subnets with no public IP allocation.
3. **Least Privilege**: Application container and CI/CD roles have strict, minimal permission scopes.
4. **State Protection**: State files are excluded from Git via `.gitignore`.
5. **Deletion Protection**: RDS deletion protection is enabled by default in production.
