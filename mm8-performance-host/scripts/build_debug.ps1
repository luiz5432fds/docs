$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "build"
$appName = "MM8WorkstationPerformanceHostApp.exe"
$juceDir = $env:JUCE_DIR

if (-not $juceDir) {
    $juceDir = "C:/dev/JUCE"
}

if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

$cmake = Get-Command "cmake" -ErrorAction SilentlyContinue
if (-not $cmake) {
    throw "CMake not found. Install CMake 3.21+ and ensure it is on PATH."
}

if (-not (Test-Path -LiteralPath $juceDir)) {
    throw "JUCE_DIR not found at $juceDir. Run scripts\\bootstrap.ps1 or set JUCE_DIR."
}
$juceDirResolved = (Resolve-Path -LiteralPath $juceDir).Path
$juceModules = Join-Path $juceDirResolved "modules"
$juceExtras = Join-Path $juceDirResolved "extras"
$juceCmake = Join-Path $juceDirResolved "CMakeLists.txt"
if (-not (Test-Path -LiteralPath $juceModules) -or -not (Test-Path -LiteralPath $juceExtras) -or -not (Test-Path -LiteralPath $juceCmake)) {
    throw "JUCE_DIR is invalid: $juceDirResolved"
}

$vswherePath = Join-Path $env:ProgramFiles(x86) "Microsoft Visual Studio/Installer/vswhere.exe"
if (-not (Test-Path -LiteralPath $vswherePath)) {
    throw "vswhere.exe not found at $vswherePath. Install Visual Studio Build Tools 2022."
}

$vsInstall = & $vswherePath -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (-not $vsInstall) {
    throw "Visual Studio 2022 Build Tools not found. Install the Desktop development with C++ workload."
}

$vsDevCmd = Join-Path $vsInstall "Common7/Tools/VsDevCmd.bat"
if (-not (Test-Path -LiteralPath $vsDevCmd)) {
    throw "VsDevCmd.bat not found at $vsDevCmd"
}

$configure = "cmake -S `"$root`" -B `"$buildDir`" -G `"Visual Studio 17 2022`" -A x64 -DJUCE_DIR=`"$juceDirResolved`""
$build = "cmake --build `"$buildDir`" --config Debug"
cmd /c "`"$vsDevCmd`" -no_logo -arch=amd64 && $configure && $build"

$artifactDir = Join-Path $buildDir "MM8WorkstationPerformanceHostApp_artefacts/Debug"
if (-not (Test-Path (Join-Path $artifactDir $appName))) {
    $exe = Get-ChildItem -Path $buildDir -Filter *.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($exe) {
        Write-Host "Debug build completed: $($exe.FullName)"
        return
    }
    throw "Build artifact not found under $artifactDir"
}

Write-Host "Debug build completed: $artifactDir\$appName"
