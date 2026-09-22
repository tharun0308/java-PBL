# PowerShell Backend Runner
Set-Location -Path (Join-Path $PSScriptRoot "backend")

Write-Host "Starting SCMS Backend..." -ForegroundColor Cyan
mvn spring-boot:run
