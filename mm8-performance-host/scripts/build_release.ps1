$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "build"
$stagingDir = Join-Path $root "staging"
$appName = "MM8XPSPerformanceManagerApp.exe"

if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

cmake -S $root -B $buildDir -G "Visual Studio 17 2022" -A x64 -DJUCE_DIR="C:/dev/JUCE"
cmake --build $buildDir --config Release

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

$artifactDir = Join-Path $buildDir "MM8XPSPerformanceManagerApp_artefacts/Release"
Copy-Item -Path (Join-Path $artifactDir $appName) -Destination $stagingDir
Copy-Item -Path (Join-Path $root "installer/installer.iss") -Destination $stagingDir

$innoPath = "C:/Program Files (x86)/Inno Setup 6/ISCC.exe"
if (-not (Test-Path $innoPath)) {
    throw "Inno Setup not found at $innoPath"
}

& $innoPath (Join-Path $root "installer/installer.iss")
