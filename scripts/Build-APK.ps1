Param(
  [string]$ProjectDir = "app"
)

Write-Host "==> Instalando dependências Flutter"
flutter pub get --directory $ProjectDir

Write-Host "==> Gerando APK release"
flutter build apk --release --target-platform android-arm64 --project-dir $ProjectDir

Write-Host "APK gerado em: $ProjectDir/build/app/outputs/flutter-apk/app-release.apk"
