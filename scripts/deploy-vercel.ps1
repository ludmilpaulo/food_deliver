param(
  [switch]$Production
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
  npm install -g vercel
}

Write-Host "Running production build locally first..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$deployArgs = @("deploy")
if ($Production) {
  $deployArgs += "--prod"
}

Write-Host ""
Write-Host "Vercel project settings (first deploy only):" -ForegroundColor Yellow
Write-Host "  Root Directory: food_deliver"
Write-Host "  Framework: Next.js"
Write-Host ""
Write-Host "Set these Environment Variables in Vercel (Production + Preview):" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_BASE_API=https://kudya-api.onrender.com"
Write-Host "  NEXT_PUBLIC_APP_URL=https://www.sdkudya.com"
Write-Host "  NEXT_PUBLIC_GOOGLE_API_KEY=<your Google Maps key>"
Write-Host ""

& vercel @deployArgs
