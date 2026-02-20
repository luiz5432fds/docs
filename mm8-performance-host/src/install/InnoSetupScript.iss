; Inno Setup script for MM8 Workstation Performance Host

[Setup]
AppName=MM8 Workstation Performance Host
AppVersion=1.0.0
DefaultDirName={pf}\MM8WorkstationPerformanceHost
DefaultGroupName=MM8 Workstation Performance Host
UninstallDisplayIcon={app}\MM8WorkstationPerformanceHostApp.exe
OutputBaseFilename=MM8WorkstationPerformanceHostSetup
Compression=lzma
SolidCompression=yes

[Dirs]
Name: "{userappdata}\MM8-Workstation-Performance-Host"; Flags: uninsneveruninstall

[Files]
Source: "..\build\MM8WorkstationPerformanceHostApp_artefacts\Release\MM8WorkstationPerformanceHostApp.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\MM8 Workstation Performance Host"; Filename: "{app}\MM8WorkstationPerformanceHostApp.exe"
Name: "{userdesktop}\MM8 Workstation Performance Host"; Filename: "{app}\MM8WorkstationPerformanceHostApp.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked
Name: "startup"; Description: "Start with Windows"; GroupDescription: "Startup:"; Flags: unchecked

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "MM8WorkstationPerformanceHost"; ValueData: "{app}\MM8WorkstationPerformanceHostApp.exe"; Flags: uninsdeletevalue; Tasks: startup

[Run]
Filename: "{app}\MM8WorkstationPerformanceHostApp.exe"; Description: "Launch MM8 Workstation Performance Host"; Flags: nowait postinstall skipifsilent
