# PowerShell script to create deployment ZIP
$ErrorActionPreference = "Stop"

# Read manifest for version info
$manifest = Get-Content "manifest.json" | ConvertFrom-Json
$projectName = $manifest.key
$version = $manifest.version

# Get git hash
try {
    $gitHash = (git rev-parse --short HEAD).Trim()
} catch {
    Write-Warning "Could not get git hash, using timestamp"
    $gitHash = [DateTimeOffset]::Now.ToUnixTimeSeconds().ToString()
}

# Create releases directory
$releasesDir = "releases"
if (-not (Test-Path $releasesDir)) {
    New-Item -ItemType Directory -Path $releasesDir | Out-Null
}

# Define archive name
$archiveName = "$projectName-v$version-$gitHash.zip"
$archivePath = Join-Path $releasesDir $archiveName

Write-Host "📦 Creating ChurchTools extension package..." -ForegroundColor Cyan
Write-Host "   Extension: $($manifest.name)" -ForegroundColor Gray
Write-Host "   Key: $projectName" -ForegroundColor Gray
Write-Host "   Version: $version" -ForegroundColor Gray
Write-Host "   Git Hash: $gitHash" -ForegroundColor Gray
Write-Host "   Archive: $archiveName" -ForegroundColor Gray

# Check if dist exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist directory not found. Run `npm run build:legacy` first." -ForegroundColor Red
    exit 1
}

# Check if manifest.json exists in dist
if (-not (Test-Path "dist/manifest.json")) {
    Write-Host "❌ Error: manifest.json not found in dist." -ForegroundColor Red
    exit 1
}
Write-Host "✓ manifest.json found in dist/" -ForegroundColor Green

# Remove old archive if exists
if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

# Create ZIP using PowerShell
try {
    Compress-Archive -Path "dist\*" -DestinationPath $archivePath -Force
    
    Write-Host "✅ Package created successfully!" -ForegroundColor Green
    Write-Host "📁 Location: $archivePath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Upload the ZIP file to your ChurchTools instance"
    Write-Host "   2. Go to Admin → Extensions → Upload Extension"
    Write-Host "   3. Select the ZIP file and install"
    Write-Host ""
    
    # Show file size
    $fileSize = (Get-Item $archivePath).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "📊 Package size: $fileSizeMB MB" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating package: $_" -ForegroundColor Red
    exit 1
}
