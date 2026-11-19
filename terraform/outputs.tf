output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}

output "ecr_backend_url" {
  value = module.ecr.backend_repo_url
}

output "ecr_frontend_url" {
  value = module.ecr.frontend_repo_url
}

output "rds_endpoint" {
  value = module.rds.db_endpoint
}

output "db_secret_name" {
  value = module.rds.secret_name
}
