# MM8 Workstation Performance Host

Um host de instrumentos virtuais (VST3 obrigatório, VST2 opcional) para transformar o **Yamaha MM8** em uma workstation de performance com 16 layers, inspirado em teclados como Roland XPS-10. O objetivo é **tocar ao vivo sem mouse**, usando apenas os controles do MM8.

## Por que JUCE (decisão de tecnologia)

- **JUCE** oferece hosting de VST3/VST2, áudio ASIO e MIDI nativos no Windows.
- UI customizável com baixa latência e ciclo de desenvolvimento rápido.
- Integração direta com CMake e Visual Studio 2022.

## Arquitetura

```
/src
  /core        (AppState, Logger, Settings, Persistence)
  /audio       (AudioDeviceManager, EngineHost, Mixer, LayerRouter)
  /midi        (MidiDeviceManager, MM8Profile, MappingEngine, ActionDispatcher)
  /plugins     (PluginScanner, EngineRegistry, PluginCache)
  /presets     (PresetScanner, PresetIndex, SnapshotManager)
  /ui          (MM8StyleTheme, Screens, Components)
  /install     (InnoSetupScript.iss, assets, icons)
/scripts
/config
```

## Recursos principais

- **16-layer Performance Mode** com volume, pan, transpose, key range e MIDI channel.
- **VST3 obrigatório**, VST2 opcional quando `JUCE_VST2_SDK_PATH` estiver configurado.
- **ASIO4ALL** auto-detect quando disponível (fallback para WASAPI se necessário).
- **Auto-detect do Yamaha MM8 e Roland XPS-10** via USB-MIDI (mapeamento padrão pronto para ajustar).
- **Scanner de plugins** com cache persistente e suporte a rescan incremental.
- **Scanner de presets** (.vstpreset, .fxp/.fxb, .vitalpreset/.vitalbank) + host snapshots.
- **Performance Banks** persistidos em JSON.

## Como compilar (1 comando)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\bootstrap.ps1
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1
```

### Build debug

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_debug.ps1
```

## Como gerar o instalador

```powershell
powershell -ExecutionPolicy Bypass -File scripts\package_installer.ps1
```

## Como executar

Após o build, execute:

```
build\MM8WorkstationPerformanceHostApp_artefacts\Release\MM8WorkstationPerformanceHostApp.exe
```

## Auto-configuração na primeira execução

- Detecta **Yamaha MM8** ou **Roland XPS-10** e habilita o MIDI.
- Detecta **ASIO4ALL** e aplica buffer/sample rate.
- Varre plugins e cria o índice de engines.
- Varre presets e cria o índice local.
- Cria Performance default com 16 layers.

## Caminhos padrão de plugins

Gerados em `config/plugin_paths.json`:

- `C:\Program Files\Image-Line\FL Studio 2025\Plugins\Fruity\Generators`
- `C:\Program Files\Vital`
- `C:\Program Files\VSTPlugins`
- `C:\Program Files\KORG`
- `C:\Program Files\Native Instruments`
- `C:\Program Files\Roland Cloud`
- `C:\Program Files\Roland VS`
- `C:\Program Files\Steinberg`

## Bibliotecas Kontakt (preset scan)

O scanner de presets também considera bibliotecas Kontakt locais em `D:\kontakt` (inclui `.nki`). Se você mover as bibliotecas, ajuste a lista no `PresetScanner` para manter a catalogação automática.

## Scripts disponíveis

- `scripts\bootstrap.ps1` — checklist de dependências.
- `scripts\build_release.ps1` — build Release.
- `scripts\build_debug.ps1` — build Debug.
- `scripts\package_installer.ps1` — gera instalador com Inno Setup.

## Testes

Os testes de utilitários podem ser habilitados com:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DJUCE_DIR=C:/dev/JUCE -DMM8_BUILD_TESTS=ON
cmake --build build --config Release
```

O executável de testes será `build\MM8WorkstationPerformanceHostTests.exe`.

## Checklist manual de palco

- Trocar performances/Scenes rapidamente e confirmar ausência de travamentos.
- Verificar detecção simultânea do MM8 e XPS-10, com controle por ambos.
- Executar panic (All Notes Off) durante sustain para garantir silêncio imediato.
- Validar split/dual (key range) por layer e volumes/pans.
- Conferir fallback do driver de áudio quando ASIO4ALL não estiver disponível.

## Principais problemas corrigidos

- Bootstrap agora valida e, se necessário, baixa/normaliza o JUCE sem quebrar paths.
- Scripts de build inicializam VS 2022 via vswhere/VsDevCmd antes de chamar CMake.
- Geração automática de `config/plugin_paths.json` quando ausente.

## Observações

- Para VST2, defina `JUCE_VST2_SDK_PATH` ao configurar o CMake.
- Presets não enumeráveis são salvos como **Host Snapshots**.
- O projeto grava logs em `%APPDATA%\MM8-Workstation-Performance-Host\mm8-host.log`.
