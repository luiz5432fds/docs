; Inno Setup script for MM8-XPS Performance Manager

[Setup]
AppName=MM8-XPS Performance Manager
AppVersion=0.2.0
DefaultDirName={pf}\MM8XPSPerformanceManager
DefaultGroupName=MM8-XPS Performance Manager
UninstallDisplayIcon={app}\MM8XPSPerformanceManagerApp.exe
OutputBaseFilename=MM8XPSPerformanceManagerSetup
Compression=lzma
SolidCompression=yes

[Dirs]
Name: "{userappdata}\MM8-Performance-Workstation"; Flags: uninsneveruninstall

[Files]
Source: "..\build\MM8XPSPerformanceManagerApp_artefacts\Release\MM8XPSPerformanceManagerApp.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\MM8-XPS Performance Manager"; Filename: "{app}\MM8XPSPerformanceManagerApp.exe"
Name: "{userdesktop}\MM8-XPS Performance Manager"; Filename: "{app}\MM8XPSPerformanceManagerApp.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked
Name: "startup"; Description: "Start with Windows"; GroupDescription: "Startup:"; Flags: unchecked

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "MM8XPSPerformanceManager"; ValueData: "{app}\MM8XPSPerformanceManagerApp.exe"; Flags: uninsdeletevalue; Tasks: startup

[Run]
Filename: "{app}\MM8XPSPerformanceManagerApp.exe"; Description: "Launch MM8-XPS Performance Manager"; Flags: nowait postinstall skipifsilent
