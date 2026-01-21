$ErrorActionPreference = "Stop"

param(
    [string]$JuceDir,
    [string]$JuceVersion = "8.0.6"
)

Write-Host "MM8 Workstation Performance Host bootstrap"
Write-Host "- Ensure Visual Studio 2022 Build Tools (Desktop development with C++)"
Write-Host "- Ensure CMake 3.21+"
Write-Host "- Ensure JUCE 7+ (set JUCE_DIR environment variable)"
Write-Host "- Ensure Inno Setup 6 (for installer packaging)"

$vswherePath = Join-Path $env:ProgramFiles(x86) "Microsoft Visual Studio/Installer/vswhere.exe"
if (-not (Test-Path -LiteralPath $vswherePath)) {
    throw "vswhere.exe not found at $vswherePath. Install Visual Studio Build Tools 2022."
}

if (-not $JuceDir) {
    $JuceDir = $env:JUCE_DIR
}

if (-not $JuceDir) {
    $depsDir = Join-Path $PSScriptRoot "..\\deps"
    if (-not (Test-Path -LiteralPath $depsDir)) {
        New-Item -ItemType Directory -Path $depsDir | Out-Null
    }
    $depsDir = (Resolve-Path -LiteralPath $depsDir).Path
    $JuceDir = Join-Path $depsDir "JUCE"
}

$juceDirExists = Test-Path -LiteralPath $JuceDir
if (-not $juceDirExists) {
    New-Item -ItemType Directory -Path $JuceDir | Out-Null
}

$juceDirNormalized = (Resolve-Path -LiteralPath $JuceDir).Path
$juceModules = Join-Path $juceDirNormalized "modules"
$juceExtras = Join-Path $juceDirNormalized "extras"
$juceCmake = Join-Path $juceDirNormalized "CMakeLists.txt"

if (-not (Test-Path -LiteralPath $juceModules) -or -not (Test-Path -LiteralPath $juceExtras)) {
    Write-Host "JUCE not found. Downloading JUCE $JuceVersion..."
    $zipUrl = "https://github.com/juce-framework/JUCE/archive/refs/tags/$JuceVersion.zip"
    $zipPath = Join-Path $juceDirNormalized "juce.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

    Expand-Archive -LiteralPath $zipPath -DestinationPath $juceDirNormalized -Force
    Remove-Item -LiteralPath $zipPath -Force

    $candidate = Get-ChildItem -LiteralPath $juceDirNormalized -Directory | Where-Object {
        Test-Path -LiteralPath (Join-Path $_.FullName "modules") -and Test-Path -LiteralPath (Join-Path $_.FullName "extras")
    } | Select-Object -First 1

    if (-not $candidate) {
        throw "Failed to locate JUCE after extraction in $juceDirNormalized"
    }

    $juceDirNormalized = $candidate.FullName
    $juceModules = Join-Path $juceDirNormalized "modules"
    $juceExtras = Join-Path $juceDirNormalized "extras"
    $juceCmake = Join-Path $juceDirNormalized "CMakeLists.txt"
}

if (-not (Test-Path -LiteralPath $juceModules) -or -not (Test-Path -LiteralPath $juceExtras) -or -not (Test-Path -LiteralPath $juceCmake)) {
    throw "JUCE_DIR is invalid after bootstrap: $juceDirNormalized"
}

Write-Host "JUCE_DIR validated: $juceDirNormalized"
Write-Host "Set JUCE_DIR with: setx JUCE_DIR `"$juceDirNormalized`""
$env:JUCE_DIR = $juceDirNormalized
if ($env:GITHUB_ENV) {
    Add-Content -LiteralPath $env:GITHUB_ENV "JUCE_DIR=$juceDirNormalized"
}
Write-Host "Bootstrap complete."
