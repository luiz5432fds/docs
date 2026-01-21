$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "build"
$innoPath = "C:/Program Files (x86)/Inno Setup 6/ISCC.exe"

if (-not (Test-Path $innoPath)) {
    throw "Inno Setup not found at $innoPath"
}

if (-not (Test-Path $buildDir)) {
    throw "Build directory not found. Run build_release.ps1 first."
}

& $innoPath (Join-Path $root "installer/installer.iss")
