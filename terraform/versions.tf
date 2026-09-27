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

  # Remote backend configuration template for AWS S3 + DynamoDB state locking.
  # To enable remote state:
  # 1. Create an S3 bucket (e.g. qubitlab-terraform-state-<account_id>)
  # 2. Create a DynamoDB table with partition key 'LockID' (String)
  # 3. Uncomment this block and run: terraform init -migrate-state
  #
  # backend "s3" {
  #   bucket         = "qubitlab-terraform-state-REPLACE_ME"
  #   key            = "qubitlab/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "qubitlab-terraform-locks"
  #   encrypt        = true
  # }
}
