variable "databricks_account_id" {
  description = "Databricks Account ID"
  type        = string
}

variable "client_id" {
  description = "Service Principal Client ID"
  type        = string
}

variable "client_secret" {
  description = "Service Principal Client Secret"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "prefix" {
  description = "Prefixo para nomear recursos"
  type        = string
  default     = "engie-pt"
}
