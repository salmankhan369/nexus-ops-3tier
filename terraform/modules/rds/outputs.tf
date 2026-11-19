output "db_endpoint" { value = aws_db_instance.mysql.address }
output "secret_name" { value = aws_secretsmanager_secret.db_creds.name }
