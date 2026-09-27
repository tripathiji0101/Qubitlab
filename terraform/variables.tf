variable "aws_region" {
  description = "AWS region for QubitLab infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name prefix used for naming resources"
  type        = string
  default     = "qubitlab"
}

# ── Networking ──
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# ── Compute / ECS Fargate ──
variable "backend_cpu" {
  description = "Fargate CPU units for backend task (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "backend_memory" {
  description = "Fargate memory for backend task (in MiB)"
  type        = number
  default     = 2048
}

variable "backend_desired_count" {
  description = "Desired number of ECS tasks (default 1 for in-memory WebSocket room state)"
  type        = number
  default     = 1
}

variable "container_image_tag" {
  description = "Immutable Docker image tag (e.g. git commit SHA). Avoid relying on 'latest' in production."
  type        = string
  default     = "latest"
}

# ── Database (RDS PostgreSQL) ──
variable "db_instance_class" {
  description = "RDS PostgreSQL instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum storage limit for auto-scaling in GB"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "qubitlab"
}

variable "db_username" {
  description = "Master username for PostgreSQL database"
  type        = string
  default     = "qubitlab_admin"
}

variable "enable_deletion_protection" {
  description = "Enable RDS deletion protection (recommended true for production)"
  type        = bool
  default     = true
}

variable "db_backup_retention_period" {
  description = "Automated backup retention period in days"
  type        = number
  default     = 7
}

# ── Redis (ElastiCache) ──
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "enable_redis" {
  description = "Whether to provision managed ElastiCache Redis"
  type        = bool
  default     = true
}

# ── Domain & HTTPS ──
variable "enable_custom_domain" {
  description = "Whether to attach custom domain and ACM certificate to CloudFront / ALB"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for QubitLab (e.g. qubitlab.dev)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of AWS ACM Certificate (required if enable_custom_domain is true)"
  type        = string
  default     = ""
}

# ── Application Secrets & AI ──
variable "ai_provider" {
  description = "AI provider for Quantum Tutor (e.g. openai, gemini)"
  type        = string
  default     = ""
}

variable "ai_api_key" {
  description = "API key for AI Tutor provider (stored securely in Secrets Manager)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ai_model" {
  description = "AI model name"
  type        = string
  default     = "gpt-4o-mini"
}

# ── CI/CD & GitHub OIDC ──
variable "github_repository" {
  description = "GitHub repository in 'owner/repo' format for OIDC trust relationship"
  type        = string
  default     = "tripathiji0101/Qubitlab"
}
