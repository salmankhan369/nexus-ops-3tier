variable "project_name" { type = string }
variable "vpc_id" { type = string }
variable "private_db_subnet_ids" { type = list(string) }
variable "eks_node_security_groups" { type = list(string) }
