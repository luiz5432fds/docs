# Troubleshooting (MM8 Workstation Performance Host)

## CMake não encontra JUCE

- Defina `JUCE_DIR` para o diretório onde o JUCE foi clonado.
- Exemplo: `setx JUCE_DIR C:\dev\JUCE`
- Ou passe no configure: `cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DJUCE_DIR=C:\dev\JUCE`

## CMake não encontra Visual Studio 2022

- Instale o workload **Desktop development with C++** (Build Tools ou Community).
- Garanta que o `vswhere.exe` exista em `C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe`.
- O `build_release.ps1` chama automaticamente o `VsDevCmd.bat`; não é necessário abrir o Developer Command Prompt manualmente.

## VST2 não aparece

- Defina `JUCE_VST2_SDK_PATH` com o SDK VST2 compatível.
- Reconfigure o CMake depois de definir a variável.

## ASIO4ALL não aparece

- Instale o ASIO4ALL (https://www.asio4all.org/).
- Confirme que o driver está habilitado no painel de áudio do Windows.

## Nenhum MIDI detectado

- Verifique se o Yamaha MM8 ou Roland XPS-10 está conectado via USB.
- Abra a tela MIDI e confirme o nome do dispositivo.
- Caso o dispositivo não apareça, reinicie o app após conectar o MM8.

## Scanner não encontra plugins

- Edite `config/plugin_paths.json` e confirme os caminhos.
- Use a opção de rescan dentro do app.
