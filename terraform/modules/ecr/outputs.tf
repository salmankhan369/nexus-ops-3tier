output "backend_repo_url" { value = aws_ecr_repository.repos["backend"].repository_url }
output "frontend_repo_url" { value = aws_ecr_repository.repos["frontend"].repository_url }
