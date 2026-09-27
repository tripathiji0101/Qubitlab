# ─────────────────────────────────────────────────────────────
# QubitLab In-Memory Cache (Amazon ElastiCache Redis 7)
# ─────────────────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "redis" {
  count       = var.enable_redis ? 1 : 0
  name        = "${local.name_prefix}-redis-subnet-group"
  description = "Private subnets for QubitLab Redis cluster"
  subnet_ids  = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-subnet-group"
  })
}

resource "aws_elasticache_parameter_group" "redis7" {
  count       = var.enable_redis ? 1 : 0
  name        = "${local.name_prefix}-redis7-params"
  family      = "redis7"
  description = "Custom parameters for ElastiCache Redis 7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = local.common_tags
}

resource "aws_elasticache_replication_group" "redis" {
  count                      = var.enable_redis ? 1 : 0
  replication_group_id       = "${local.name_prefix}-redis"
  description                = "Redis cluster for QubitLab session cache and rate limiting"
  node_type                  = var.redis_node_type
  num_cache_clusters         = var.environment == "prod" ? 2 : 1
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.redis7[0].name
  subnet_group_name          = aws_elasticache_subnet_group.redis[0].name
  security_group_ids         = [aws_security_group.redis[0].id]
  automatic_failover_enabled = var.environment == "prod" ? true : false
  at_rest_encryption_enabled = true
  transit_encryption_enabled = false
  apply_immediately          = var.environment != "prod"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })
}
