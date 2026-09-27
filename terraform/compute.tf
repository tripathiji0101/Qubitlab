# ─────────────────────────────────────────────────────────────
# QubitLab Compute Layer (Amazon ECS Fargate & ALB)
# ─────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = var.environment == "prod" ? "enabled" : "disabled"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-cluster"
  })
}

# ── Application Load Balancer ──
resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  idle_timeout       = 300 # Support stateful WebSocket rooms

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb"
  })
}

# ── Backend Target Group ──
resource "aws_lb_target_group" "backend" {
  name                 = "${local.name_prefix}-backend-tg"
  port                 = 8000
  protocol             = "HTTP"
  vpc_id               = aws_vpc.main.id
  target_type          = "ip"
  deregistration_delay = 30

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  health_check {
    enabled             = true
    path                = "/health"
    port                = "8000"
    protocol            = "HTTP"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend-tg"
  })
}

# ── HTTP Listener (Port 80) ──
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Redirect to HTTPS if custom domain is configured, otherwise forward directly to backend
  default_action {
    type             = var.enable_custom_domain ? "redirect" : "forward"
    target_group_arn = var.enable_custom_domain ? null : aws_lb_target_group.backend.arn

    dynamic "redirect" {
      for_each = var.enable_custom_domain ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

# ── HTTPS Listener (Port 443, Optional for custom domain) ──
resource "aws_lb_listener" "https" {
  count             = var.enable_custom_domain ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ── ECS Backend Task Definition ──
resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name_prefix}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.container_image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:DATABASE_URL::"
        },
        {
          name      = "JWT_SECRET_KEY"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:JWT_SECRET_KEY::"
        },
        {
          name      = "AI_API_KEY"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:AI_API_KEY::"
        }
      ]

      environment = [
        {
          name  = "APP_NAME"
          value = "QubitLab"
        },
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "DEBUG"
          value = var.environment == "prod" ? "false" : "true"
        },
        {
          name  = "PORT"
          value = "8000"
        },
        {
          name  = "REDIS_URL"
          value = var.enable_redis ? "redis://${aws_elasticache_replication_group.redis[0].primary_endpoint_address}:6379/0" : ""
        },
        {
          name  = "CORS_ORIGINS"
          value = var.enable_custom_domain ? "https://${var.domain_name},https://app.${var.domain_name}" : "http://${aws_lb.main.dns_name},https://${aws_cloudfront_distribution.frontend.domain_name}"
        },
        {
          name  = "AI_PROVIDER"
          value = var.ai_provider
        },
        {
          name  = "AI_MODEL"
          value = var.ai_model
        },
        {
          name  = "LOG_LEVEL"
          value = var.environment == "prod" ? "INFO" : "DEBUG"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 20
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend-task"
  })
}

# ── ECS Backend Service ──
resource "aws_ecs_service" "backend" {
  name            = "${local.name_prefix}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_execution_standard,
    aws_iam_role_policy_attachment.ecs_execution_secrets
  ]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-backend-service"
  })
}
