module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
}

module "eks" {
  source             = "./modules/eks"
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_app_subnet_ids
}

module "rds" {
  source                   = "./modules/rds"
  project_name             = var.project_name
  vpc_id                   = module.vpc.vpc_id
  private_db_subnet_ids    = module.vpc.private_db_subnet_ids
  eks_node_security_groups = [module.eks.node_security_group_id]
}
