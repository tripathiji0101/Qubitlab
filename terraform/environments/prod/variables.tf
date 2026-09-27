variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "github_repository" {
  type    = string
  default = "tripathiji0101/Qubitlab"
}

variable "container_image_tag" {
  type        = string
  description = "Immutable git commit SHA tag"
  default     = "latest"
}

variable "enable_custom_domain" {
  type    = bool
  default = false
}

variable "domain_name" {
  type    = string
  default = ""
}

variable "certificate_arn" {
  type    = string
  default = ""
}

variable "ai_provider" {
  type    = string
  default = "gemini"
}

variable "ai_api_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "ai_model" {
  type    = string
  default = "gemini-2.0-flash"
}
