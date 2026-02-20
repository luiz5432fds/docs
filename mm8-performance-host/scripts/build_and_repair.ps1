$ErrorActionPreference = "Stop"

function Build-Project {
    Write-Host ">>> Iniciando Protocolo de Build Blindado..." -ForegroundColor Cyan

    $configProcess = Start-Process cmake -ArgumentList "-S . -B build -G `"Visual Studio 17 2022`"" -PassThru -NoNewWindow -Wait
    if ($configProcess.ExitCode -ne 0) {
        Write-Error "ERRO CRÍTICO NA CONFIGURAÇÃO. Verifique CMakeLists.txt."
        return $false
    }

    Write-Host ">>> Compilando..." -ForegroundColor Cyan
    $buildProcess = Start-Process cmake -ArgumentList "--build build --config Release" -PassThru -NoNewWindow -Wait

    if ($buildProcess.ExitCode -ne 0) {
        Write-Error "FALHA NA COMPILAÇÃO."
        Write-Host "AUTO-DIAGNÓSTICO: Verifique logs acima para erros de Linker (LNK) ou Sintaxe (C)." -ForegroundColor Yellow
        Write-Host "Ação sugerida: Verificar dependências circulares em .h e uso de ScopedLock."
        return $false
    }

    Write-Host ">>> SUCESSO ABSOLUTO. Build 100%." -ForegroundColor Green
    return $true
}

$success = Build-Project
if (-not $success) {
    exit 1
}
