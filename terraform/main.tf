terraform {
  required_providers {
    databricks = {
      source  = "databricks/databricks"
      version = "~> 1.112"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ============================================================
# PROVIDERS
# ============================================================

# Account-level — criar workspace, metastore
provider "databricks" {
  alias         = "mws"
  host          = "https://accounts.cloud.databricks.com"
  account_id    = var.databricks_account_id
  client_id     = var.client_id
  client_secret = var.client_secret
}

# Workspace-level — Unity Catalog, Lakebase, App
provider "databricks" {
  host          = databricks_mws_workspaces.this.workspace_url
  client_id     = var.client_id
  client_secret = var.client_secret
}

provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}
data "aws_caller_identity" "current" {}

# ============================================================
# NETWORKING — VPC /20 (4096 IPs)
# ============================================================

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.prefix}-vpc"
  cidr = "10.4.0.0/20"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)

  enable_dns_hostnames = true
  enable_nat_gateway   = true
  single_nat_gateway   = true
  create_igw           = true

  # 2 subnets privadas /22 = 1024 IPs cada (clusters Databricks)
  private_subnets = ["10.4.0.0/22", "10.4.4.0/22"]

  # 1 subnet pública /24 = 254 IPs (NAT Gateway)
  public_subnets = ["10.4.8.0/24"]

  manage_default_security_group = true
  default_security_group_name   = "${var.prefix}-sg"

  default_security_group_egress = [{
    cidr_blocks = "0.0.0.0/0"
  }]
  default_security_group_ingress = [{
    description = "Allow all internal TCP and UDP"
    self        = true
  }]

  tags = {
    Project     = "engie-permisos-trabajo"
    Environment = "demo"
    ManagedBy   = "terraform"
  }
}

# VPC Endpoints obrigatórios
module "vpc_endpoints" {
  source  = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  version = "~> 5.0"

  vpc_id             = module.vpc.vpc_id
  security_group_ids = [module.vpc.default_security_group_id]

  endpoints = {
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = flatten([module.vpc.private_route_table_ids, module.vpc.public_route_table_ids])
      tags            = { Name = "${var.prefix}-s3-vpce" }
    }
    sts = {
      service             = "sts"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
      tags                = { Name = "${var.prefix}-sts-vpce" }
    }
    kinesis-streams = {
      service             = "kinesis-streams"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
      tags                = { Name = "${var.prefix}-kinesis-vpce" }
    }
  }
}

# Registrar rede no Databricks
resource "databricks_mws_networks" "this" {
  provider           = databricks.mws
  account_id         = var.databricks_account_id
  network_name       = "${var.prefix}-network"
  security_group_ids = [module.vpc.default_security_group_id]
  subnet_ids         = module.vpc.private_subnets
  vpc_id             = module.vpc.vpc_id
}

# ============================================================
# IAM — Cross-Account Role
# ============================================================

data "databricks_aws_assume_role_policy" "this" {
  provider    = databricks.mws
  external_id = var.databricks_account_id
}

data "databricks_aws_crossaccount_policy" "this" {
  provider    = databricks.mws
  policy_type = "customer"
}

resource "aws_iam_role" "cross_account" {
  name               = "${var.prefix}-crossaccount"
  assume_role_policy = data.databricks_aws_assume_role_policy.this.json
}

resource "aws_iam_role_policy" "cross_account" {
  name   = "${var.prefix}-policy"
  role   = aws_iam_role.cross_account.id
  policy = data.databricks_aws_crossaccount_policy.this.json
}

resource "databricks_mws_credentials" "this" {
  provider         = databricks.mws
  account_id       = var.databricks_account_id
  credentials_name = "${var.prefix}-creds"
  role_arn         = aws_iam_role.cross_account.arn
  depends_on       = [aws_iam_role_policy.cross_account]
}

# Aguardar propagação IAM
resource "time_sleep" "wait_for_iam" {
  depends_on      = [aws_iam_role.cross_account]
  create_duration = "15s"
}

# ============================================================
# S3 — Root Bucket
# ============================================================

resource "aws_s3_bucket" "root" {
  bucket        = "${var.prefix}-rootbucket"
  force_destroy = true
  tags          = { Project = "engie-permisos-trabajo" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "root" {
  bucket = aws_s3_bucket.root.bucket
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "root" {
  bucket                  = aws_s3_bucket.root.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "databricks_aws_bucket_policy" "this" {
  provider = databricks.mws
  bucket   = aws_s3_bucket.root.bucket
}

resource "aws_s3_bucket_policy" "root" {
  bucket     = aws_s3_bucket.root.id
  policy     = data.databricks_aws_bucket_policy.this.json
  depends_on = [aws_s3_bucket_public_access_block.root]
}

resource "databricks_mws_storage_configurations" "this" {
  provider                   = databricks.mws
  account_id                 = var.databricks_account_id
  bucket_name                = aws_s3_bucket.root.bucket
  storage_configuration_name = "${var.prefix}-storage"
}

# ============================================================
# WORKSPACE
# ============================================================

resource "databricks_mws_workspaces" "this" {
  provider                 = databricks.mws
  account_id               = var.databricks_account_id
  aws_region               = var.region
  workspace_name           = var.prefix
  credentials_id           = databricks_mws_credentials.this.credentials_id
  storage_configuration_id = databricks_mws_storage_configurations.this.storage_configuration_id
  network_id               = databricks_mws_networks.this.network_id
  depends_on               = [time_sleep.wait_for_iam]
}

# ============================================================
# UNITY CATALOG
# ============================================================

resource "databricks_metastore" "this" {
  provider      = databricks.mws
  name          = "${var.prefix}-metastore"
  region        = var.region
  force_destroy = true
}

resource "databricks_metastore_assignment" "this" {
  provider     = databricks.mws
  metastore_id = databricks_metastore.this.id
  workspace_id = databricks_mws_workspaces.this.workspace_id
}

resource "databricks_catalog" "engie" {
  name       = "engie_catalog"
  comment    = "Catalogo ENGIE Mexico — Permisos de Trabajo"
  depends_on = [databricks_metastore_assignment.this]
}

resource "databricks_schema" "permisos" {
  catalog_name = databricks_catalog.engie.name
  name         = "permisos_trabajo"
}

# ============================================================
# LAKEBASE — PostgreSQL Autoscaling
# ============================================================

resource "databricks_postgres_project" "engie_pt" {
  project_id = "engie-pt-db"
  spec = {
    pg_version   = 17
    display_name = "ENGIE Permisos de Trabajo"
  }
  depends_on = [databricks_metastore_assignment.this]
}

resource "databricks_postgres_branch" "production" {
  branch_id = "production"
  parent    = databricks_postgres_project.engie_pt.name
  spec = {
    no_expiry = true
  }
}

resource "databricks_postgres_endpoint" "primary" {
  endpoint_id = "primary"
  parent      = databricks_postgres_branch.production.name
  spec = {
    endpoint_type = "ENDPOINT_TYPE_READ_WRITE"
  }
}

# ============================================================
# DATABRICKS APP
# ============================================================

resource "databricks_app" "engie_pt" {
  name        = "engie-permisos-trabajo"
  description = "Sistema de Permisos de Trabajo HSE — ENGIE Mexico"

  resources = [
    {
      name = "lakebase"
      database = {
        database_name = "engie_pt"
        instance_name = databricks_postgres_project.engie_pt.name
        permission    = "CAN_CONNECT_AND_CREATE"
      }
    }
  ]

  compute_size = "MEDIUM"
}

# ============================================================
# OUTPUTS
# ============================================================

output "workspace_url" {
  value = databricks_mws_workspaces.this.workspace_url
}

output "app_url" {
  value = databricks_app.engie_pt.url
}

output "lakebase_host" {
  value = databricks_postgres_endpoint.primary.status[0].hosts.host
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
