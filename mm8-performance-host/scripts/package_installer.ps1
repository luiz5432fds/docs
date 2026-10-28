$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "build"
$innoPath = "C:/Program Files (x86)/Inno Setup 6/ISCC.exe"
$artifactDir = Join-Path $buildDir "MM8WorkstationPerformanceHost_artefacts/Release"
$appName = "MM8 Performance Host.exe"

if (-not (Test-Path $innoPath)) {
    throw "Inno Setup not found at $innoPath"
}

if (-not (Test-Path $buildDir)) {
    throw "Build directory not found. Run build_release.ps1 first."
}

if (-not (Test-Path (Join-Path $artifactDir $appName))) {
    throw "Release executable not found at $artifactDir"
}

& $innoPath (Join-Path $root "installer/installer.iss")
