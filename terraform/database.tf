# ─────────────────────────────────────────────────────────────
# QubitLab Relational Database (Amazon RDS PostgreSQL 16)
# ─────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "postgres" {
  name        = "${local.name_prefix}-db-subnet-group"
  description = "Private subnets for QubitLab PostgreSQL database"
  subnet_ids  = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-subnet-group"
  })
}

resource "aws_db_parameter_group" "postgres16" {
  name        = "${local.name_prefix}-pg16-params"
  family      = "postgres16"
  description = "Custom parameters for PostgreSQL 16"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  tags = local.common_tags
}

resource "aws_db_instance" "postgres" {
  identifier                 = "${local.name_prefix}-postgres"
  engine                     = "postgres"
  engine_version             = "16.3"
  instance_class             = var.db_instance_class
  allocated_storage          = var.db_allocated_storage
  max_allocated_storage      = var.db_max_allocated_storage
  storage_type               = "gp3"
  storage_encrypted          = true
  db_name                    = var.db_name
  username                   = var.db_username
  password                   = random_password.db_password.result
  db_subnet_group_name       = aws_db_subnet_group.postgres.name
  vpc_security_group_ids     = [aws_security_group.rds.id]
  parameter_group_name       = aws_db_parameter_group.postgres16.name
  publicly_accessible        = false
  multi_az                   = var.environment == "prod" ? true : false
  deletion_protection        = var.enable_deletion_protection
  backup_retention_period    = var.db_backup_retention_period
  backup_window              = "03:00-04:00"
  maintenance_window         = "sun:04:30-sun:05:30"
  auto_minor_version_upgrade = true
  copy_tags_to_snapshot      = true
  skip_final_snapshot        = var.environment != "prod"
  final_snapshot_identifier  = var.environment == "prod" ? "${local.name_prefix}-postgres-final-snapshot" : null

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-postgres"
  })
}
