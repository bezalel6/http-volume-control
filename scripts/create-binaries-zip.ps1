# PowerShell script to create binaries zip file
# Run this after placing all required executables in the binaries folder

$binariesPath = Join-Path $PSScriptRoot "..\binaries"
$zipPath = Join-Path $PSScriptRoot "..\http-volume-control-binaries.zip"

# Check if binaries exist
$requiredFiles = @("svcl.exe", "GetNir.exe", "extracticon.exe")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $binariesPath $file
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Error: Missing required binaries:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nPlease download all required binaries first. See binaries/README.md for instructions." -ForegroundColor Yellow
    exit 1
}

# Create zip file
Write-Host "Creating zip file..." -ForegroundColor Green
Compress-Archive -Path "$binariesPath\*.exe" -DestinationPath $zipPath -Force

Write-Host "Success! Created: $zipPath" -ForegroundColor Green
Write-Host "You can now distribute this zip file to users." -ForegroundColor Cyan