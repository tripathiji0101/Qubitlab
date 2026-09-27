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

  # backend "s3" {
  #   bucket         = "qubitlab-terraform-state-REPLACE_ME"
  #   key            = "environments/dev/terraform.tfstate"
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
  environment                = "dev"
  project_name               = "qubitlab"
  backend_cpu                = 512
  backend_memory             = 1024
  backend_desired_count      = 1
  container_image_tag        = var.container_image_tag
  db_instance_class          = "db.t4g.micro"
  enable_deletion_protection = false
  db_backup_retention_period = 1
  enable_redis               = true
  redis_node_type            = "cache.t4g.micro"
  enable_custom_domain       = false
  ai_provider                = var.ai_provider
  ai_api_key                 = var.ai_api_key
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

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC deployment"
  value       = module.qubitlab.github_actions_role_arn
}
