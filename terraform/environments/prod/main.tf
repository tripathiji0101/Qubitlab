terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Production remote state backend with state locking
  # backend "s3" {
  #   bucket         = "qubitlab-terraform-state-REPLACE_ME"
  #   key            = "environments/prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "qubitlab-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

module "qubitlab" {
  source = "../../"

  aws_region                 = var.aws_region
  environment                = "prod"
  project_name               = "qubitlab"
  backend_cpu                = 1024
  backend_memory             = 2048
  backend_desired_count      = 1
  container_image_tag        = var.container_image_tag
  db_instance_class          = "db.t4g.micro"
  db_allocated_storage       = 20
  db_max_allocated_storage   = 100
  enable_deletion_protection = true
  db_backup_retention_period = 7
  enable_redis               = true
  redis_node_type            = "cache.t4g.micro"
  enable_custom_domain       = var.enable_custom_domain
  domain_name                = var.domain_name
  certificate_arn            = var.certificate_arn
  ai_provider                = var.ai_provider
  ai_api_key                 = var.ai_api_key
  ai_model                   = var.ai_model
  github_repository          = var.github_repository
}

output "alb_dns_name" {
  value = module.qubitlab.alb_dns_name
}

output "health_check_url" {
  value = module.qubitlab.health_check_url
}

output "cloudfront_domain_name" {
  value = module.qubitlab.cloudfront_domain_name
}

output "ecr_backend_repository_url" {
  value = module.qubitlab.ecr_backend_repository_url
}

output "ecr_frontend_repository_url" {
  value = module.qubitlab.ecr_frontend_repository_url
}

output "rds_endpoint" {
  value = module.qubitlab.rds_endpoint
}
