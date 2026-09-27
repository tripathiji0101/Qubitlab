# ─────────────────────────────────────────────────────────────
# QubitLab Secrets Management (AWS Secrets Manager)
# ─────────────────────────────────────────────────────────────

# Generate cryptographically secure passwords & tokens
resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Central Secret Container for QubitLab
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${local.name_prefix}-app-secrets"
  description             = "Production credentials and API keys for QubitLab (${var.environment})"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app-secrets"
  })
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    DATABASE_USER     = var.db_username
    DATABASE_PASSWORD = random_password.db_password.result
    DATABASE_NAME     = var.db_name
    DATABASE_HOST     = aws_db_instance.postgres.address
    DATABASE_PORT     = "5432"
    DATABASE_URL      = "postgresql+asyncpg://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
    JWT_SECRET_KEY    = random_password.jwt_secret.result
    JWT_ALGORITHM     = "HS256"
    AI_PROVIDER       = var.ai_provider
    AI_API_KEY        = var.ai_api_key
    AI_MODEL          = var.ai_model
  })
}
