# ─────────────────────────────────────────────────────────────
# QubitLab Infrastructure Outputs
# ─────────────────────────────────────────────────────────────

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "health_check_url" {
  description = "Public URL to verify backend health"
  value       = "http://${aws_lb.main.dns_name}/health"
}

output "cloudfront_domain_name" {
  description = "Domain name of CloudFront distribution serving the React frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_s3_bucket" {
  description = "S3 bucket for frontend SPA assets"
  value       = aws_s3_bucket.frontend.id
}

output "storage_s3_bucket" {
  description = "S3 bucket for RAG documents and user uploads"
  value       = aws_s3_bucket.storage.id
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend Docker images"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend Docker images"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "Endpoint address of PostgreSQL RDS instance"
  value       = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  description = "Primary endpoint address of ElastiCache Redis cluster"
  value       = var.enable_redis ? aws_elasticache_replication_group.redis[0].primary_endpoint_address : null
}

output "secrets_manager_secret_arn" {
  description = "ARN of AWS Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "ecs_cluster_name" {
  description = "Name of ECS Cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of ECS Backend Service"
  value       = aws_ecs_service.backend.name
}

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC deployment"
  value       = aws_iam_role.github_actions_cd.arn
}
