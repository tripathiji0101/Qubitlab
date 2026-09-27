variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "github_repository" {
  type    = string
  default = "tripathiji0101/Qubitlab"
}

variable "container_image_tag" {
  type    = string
  default = "latest"
}

variable "ai_provider" {
  type    = string
  default = ""
}

variable "ai_api_key" {
  type      = string
  default   = ""
  sensitive = true
}
