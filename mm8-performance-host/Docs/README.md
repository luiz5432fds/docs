# MM8 Workstation Performance Host

Host de plugins VST3 inspirado no workflow do Yamaha MM8. O projeto usa JUCE com CMake e organiza instrumentos em **Performances (16 Layers) → Banks → Setlists**.

## Requisitos

- Windows 10/11
- Visual Studio 2022 (Desktop development with C++)
- CMake 3.21+
- JUCE 7+ (defina `JUCE_DIR` ao configurar)

## Appliance Mode (sem mouse)

- O app inicia em tela cheia por padrão.
- Navegação por Performance/Bank/Layer deve ser feita via MM8 ou controlador MIDI.
- A primeira execução auto-configura MIDI e áudio (MM8/ASIO4ALL) e grava em `settings.json`.

## Como compilar (Visual Studio 2022)

```bash
powershell -ExecutionPolicy Bypass -File scripts\bootstrap.ps1
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DJUCE_DIR=C:/dev/JUCE
cmake --build build --config Release
```

O executável estará em `build/MM8WorkstationPerformanceHostApp_artefacts/Release`.

## Instalador (Inno Setup)

Use o template em `installer/installer.iss`.

### Gerar instalador em 1 comando

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1
powershell -ExecutionPolicy Bypass -File scripts\package_installer.ps1
```

## Como escanear VST3

O scanner inicial usa as pastas em `config/plugin_paths.json`.

## Como selecionar ASIO4ALL

1. Abra as configurações de áudio do app.
2. Selecione **ASIO4ALL** como driver.
3. Ajuste buffer e sample rate (padrão recomendado: 48kHz / 256).

## Conectar o MM8 ou Roland XPS-10 e usar MIDI Learn

1. Conecte o MM8 ou Roland XPS-10 via USB-MIDI.
2. Abra **MIDI** para ver input e testar botões/knobs.
3. Use **Capture/Learn** nos controles virtuais para mapear controles não enviados pelo MM8.

## Criar Performance 16-layer

1. Abra **Performance**.
2. Ative até 16 layers.
3. Defina canal MIDI, key range, velocity range e transpose.
4. Salve a Performance.

## MM8 Factory Order (Voice List)

Use `Resources/mm8-factory-order.json` para manter a ordem do MM8.
