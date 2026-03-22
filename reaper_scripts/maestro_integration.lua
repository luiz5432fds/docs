-- Maestro IA - Reaper Integration Script
-- Creates projects, tracks, and exports from Maestro IA commands
-- Compatible with Reaper 6.x+

--[[
  Maestro IA ReaScript Integration

  This script provides programmatic control over Reaper for the Maestro IA system.
  It can be called from external Python/Node.js processes via Reaper's OSC or
  command-line interface.

  Functions:
    - CreateProject(bpm, key, timeSignature)
    - ImportAudio(filepath, offset_beats)
    - CreateTracks(instrument_list)
    - ExportAll(formats)
]]

-- ----------------------------------------------------------------------------
-- Constants
-- ----------------------------------------------------------------------------

local MAESTRO_VERSION = "1.0.0"

-- ----------------------------------------------------------------------------
-- Project Creation Functions
-- ----------------------------------------------------------------------------

--[[
  Create a new Reaper project with specified parameters

  @param bpm number: Tempo in beats per minute (default: 120)
  @param key string: Musical key (e.g., "C", "F#", "Bb") (default: "C")
  @param timeSignature string: Time signature (e.g., "4/4", "3/4", "6/8") (default: "4/4")
  @return boolean: true if successful
]]
function CreateProject(bpm, key, timeSignature)
  bpm = bpm or 120
  key = key or "C"
  timeSignature = timeSignature or "4/4"

  -- Set tempo
  reaper.SetTempoTimeSigMarker(0, 0, bpm, 0, 0, timeSignature, 0)

  -- Set project key
  -- Reaper uses 0-11 for keys (C=0, C#=1, D=2, etc.)
  local keyMap = {
    ["C"] = 0, ["Db"] = 1, ["D"] = 2, ["Eb"] = 3, ["E"] = 4,
    ["F"] = 5, ["F#"] = 6, ["G"] = 7, ["Ab"] = 8, ["A"] = 9,
    ["Bb"] = 10, ["B"] = 11
  }
  local keyNum = keyMap[key] or 0

  -- Set grid to 1/4 notes
  reaper.SetProjectGrid(0, 0.25)

  -- Clear any existing tracks and create initial ones
  reaper.DeleteAllTracks()

  return true
end

--[[
  Import audio file and align it to the grid

  @param filepath string: Path to audio file
  @param offsetBeats number: Start position in beats (default: 0)
  @param trackIndex number: Track to insert into (default: 1)
  @return number: Index of created track, or -1 on failure
]]
function ImportAudio(filepath, offsetBeats, trackIndex)
  if not reaper.file_exists(filepath) then
    reaper.ShowMessageBox("Audio file not found: " .. filepath, "Maestro IA Error", 0)
    return -1
  end

  offsetBeats = offsetBeats or 0
  trackIndex = trackIndex or 1

  -- Ensure track exists
  local track = reaper.GetTrack(0, trackIndex - 1)
  if not track then
    track = reaper.AddTrack()
    trackIndex = reaper.GetMediaTrackInfo_Value(track, "IP_TRACKNUMBER")
  end

  -- Calculate position in seconds
  local bpm = reaper.TimeMap_GetDividedBpmAtTime(0)
  local position = (offsetBeats / bpm) * 60

  -- Import audio
  local item = reaper.InsertMedia(filepath, 0)

  if item then
    -- Set position
    reaper.SetMediaItemInfo_Value(item, "D_POSITION", position)

    -- Quantize to grid if desired
    -- QuantizeToGrid(item)

    return trackIndex
  end

  return -1
end

-- ----------------------------------------------------------------------------
-- Track Creation Functions
-- ----------------------------------------------------------------------------

--[[
  Create tracks for specified instruments

  @param instrumentList table: Array of instrument definitions
    Each instrument: {name, midiChannel, role, volume, color}
  @return table: Array of created track indices
]]
function CreateTracks(instrumentList)
  local trackIndices = {}

  -- Define role-based properties
  local roleProps = {
    melody = {color = {1, 0.78, 0}, height = 80},      -- Gold
    harmony = {color = {0, 0.78, 1}, height = 70},     -- Cyan
    bass = {color = {1, 0, 0.39}, height = 60},        -- Red/pink
    drums = {color = {0.39, 1, 0.39}, height = 90},    -- Green
    percussion = {color = {0.78, 0.39, 1}, height = 50}, -- Purple
    pad = {color = {0.59, 0.59, 0.78}, height = 60}    -- Blue/gray
  }

  for i, inst in ipairs(instrumentList) do
    -- Create track
    local track = reaper.AddTrack()
    local trackIdx = reaper.GetMediaTrackInfo_Value(track, "IP_TRACKNUMBER")
    table.insert(trackIndices, trackIdx)

    -- Set name
    local name = inst.name or ("Track " .. i)
    reaper.GetSetMediaTrackInfo_String(track, "P_NAME", name, true)

    -- Get role properties
    local role = inst.role or "melody"
    local props = roleProps[role] or roleProps.melody

    -- Set color
    local color = reaper.ColorToNative(
      math.floor(props.color[1] * 255),
      math.floor(props.color[2] * 255),
      math.floor(props.color[3] * 255)
    )
    reaper.SetTrackColor(track, color)

    -- Set height
    reaper.SetMediaTrackInfo_Value(track, "I_HEIGHTOVERRIDE", props.height)
    reaper.SetMediaTrackInfo_Value(track, "I_WNDH", props.height)

    -- Set MIDI channel
    if inst.midiChannel then
      reaper.SetMediaTrackInfo_Value(track, "I_MIDIOUTPUTCHANNEL", inst.midiChannel)
    end

    -- Set volume (with headroom)
    local volume = inst.volume or 0
    if volume == 0 then
      -- Default volume based on role
      if role == "melody" then volume = -0
      elseif role == "bass" then volume = -3
      elseif role == "drums" then volume = -6
      elseif role == "pad" then volume = -15
      else volume = -6
      end
    end

    -- Convert dB to Reaper volume (0-2)
    local volValue = 10 ^ (volume / 20)
    reaper.SetMediaTrackInfo_Value(track, "D_VOL", volValue)

    -- Set pan to center
    reaper.SetMediaTrackInfo_Value(track, "D_PAN", 0)

    -- Add MIDI output
    reaper.CreateTrackSend(track, -1)  -- Create MIDI send

    -- Set MIDI instrument based on name
    SetMidiInstrument(track, inst.name)
  end

  return trackIndices
end

--[[
  Set MIDI instrument/program for track

  @param track MediaTrack: Reaper track
  @param instrumentName string: Name of instrument
]]
function SetMidiInstrument(track, instrumentName)
  -- MIDI program numbers for common instruments
  local programMap = {
    ["piano"] = 0,
    ["acoustic piano"] = 0,
    ["grand piano"] = 0,
    ["electric piano"] = 4,
    ["organ"] = 16,
    ["guitar"] = 24,
    ["acoustic guitar"] = 24,
    ["nylon guitar"] = 24,
    ["electric guitar"] = 27,
    ["bass"] = 32,
    ["electric bass"] = 33,
    ["upright bass"] = 32,
    ["strings"] = 48,
    ["strings ensemble"] = 48,
    ["trumpet"] = 56,
    ["sax"] = 66,
    ["tenor sax"] = 66,
    ["flute"] = 73,
    ["accordion"] = 21,
    ["synth"] = 80,
    ["synth lead"] = 80,
    ["synth pad"] = 88
  }

  local nameLower = instrumentName:lower()
  for key, program in pairs(programMap) do
    if nameLower:find(key) then
      -- Set MIDI program via MIDI output
      -- This requires additional setup in Reaper's MIDI routing
      break
    end
  end
end

-- ----------------------------------------------------------------------------
-- Export Functions
-- ----------------------------------------------------------------------------

--[[
  Export project in multiple formats

  @param formats table: Array of formats to export
    Supported: "rpp", "wav", "mp3", "mid", "stems"
  @param outputDir string: Output directory (optional)
  @return table: Paths to exported files
]]
function ExportAll(formats, outputDir)
  formats = formats or {"rpp", "mid"}
  local exported = {}

  -- Set output directory
  if not outputDir then
    outputDir = reaper.GetProjectPath("") .. "/exports"
    os.execute("mkdir \"" .. outputDir .. "\"")
  end

  local projectName = reaper.GetProjectName(0)
  local timestamp = os.date("%Y%m%d_%H%M%S")

  -- Save RPP project
  if contains(formats, "rpp") then
    local rppPath = outputDir .. "/" .. projectName .. "_" .. timestamp .. ".rpp"
    reaper.Main_SaveProject(0, rppPath, false)
    table.insert(exported, rppPath)
  end

  -- Export MIDI
  if contains(formats, "mid") then
    local midPath = outputDir .. "/" .. projectName .. "_" .. timestamp .. ".mid"
    ExportMidiFile(midPath)
    table.insert(exported, midPath)
  end

  -- Export audio (WAV)
  if contains(formats, "wav") then
    local wavPath = outputDir .. "/" .. projectName .. "_" .. timestamp .. ".wav"
    ExportAudioFile(wavPath, "wav")
    table.insert(exported, wavPath)
  end

  -- Export audio (MP3)
  if contains(formats, "mp3") then
    local mp3Path = outputDir .. "/" .. projectName .. "_" .. timestamp .. ".mp3"
    ExportAudioFile(mp3Path, "mp3")
    table.insert(exported, mp3Path)
  end

  -- Export stems
  if contains(formats, "stems") then
    local stemsDir = outputDir .. "/stems"
    os.execute("mkdir \"" .. stemsDir .. "\"")
    ExportStems(stemsDir)
    table.insert(exported, stemsDir)
  end

  return exported
end

--[[
  Export project as MIDI file

  @param filepath string: Output path
]]
function ExportMidiFile(filepath)
  -- Get all tracks
  local trackCount = reaper.CountTracks(0)

  -- Select all tracks for export
  for i = 0, trackCount - 1 do
    local track = reaper.GetTrack(0, i)
    reaper.SetTrackSelected(track, true)
  end

  -- Export MIDI
  reaper.Main_OnCommand(40853, 0)  -- File: Export MIDI file

  -- The export dialog will appear; user needs to confirm
  -- For headless export, use ReaScript export functions
end

--[[
  Export project as audio file

  @param filepath string: Output path
  @param format string: "wav" or "mp3"
]]
function ExportAudioFile(filepath, format)
  -- Set render settings
  reaper.GetSet_RenderInfo_String("RENDER_FILE", filepath, true)
  reaper.GetSet_RenderInfo_String("RENDER_PATTERN", "", true)

  if format == "wav" then
    reaper.GetSet_RenderInfo_String("RENDER_FORMAT", "WAV", true)
  elseif format == "mp3" then
    reaper.GetSet_RenderInfo_String("RENDER_FORMAT", "MP3", true)
  end

  -- Render project
  reaper.Main_OnCommand(41824, 0)  -- File: Render project, using the most recent render configuration
end

--[[
  Export each track as separate stem

  @param outputDir string: Output directory for stems
]]
function ExportStems(outputDir)
  local trackCount = reaper.CountTracks(0)

  -- Create directory if it doesn't exist
  os.execute("mkdir \"" .. outputDir .. "\"")

  for i = 0, trackCount - 1 do
    local track = reaper.GetTrack(0, i)
    local _, trackName = reaper.GetSetMediaTrackInfo_String(track, "P_NAME", "", false)

    -- Solo this track
    reaper.SetMediaTrackInfo_Value(track, "I_SOLO", 1)

    -- Export
    local stemPath = outputDir .. "/" .. trackName .. ".wav"
    ExportAudioFile(stemPath, "wav")

    -- Unsolo
    reaper.SetMediaTrackInfo_Value(track, "I_SOLO", 0)
  end
end

-- ----------------------------------------------------------------------------
-- Helper Functions
-- ----------------------------------------------------------------------------

function contains(table, value)
  for _, v in ipairs(table) do
    if v == value then
      return true
    end
  end
  return false
end

function QuantizeToGrid(item)
  if not item then return end

  local position = reaper.GetMediaItemInfo_Value(item, "D_POSITION")
  local grid = reaper.GetProjectGrid(0)

  local quantized = math.floor(position / grid) * grid
  reaper.SetMediaItemInfo_Value(item, "D_POSITION", quantized)
end

-- ----------------------------------------------------------------------------
-- Main Entry Point (for testing)
-- ----------------------------------------------------------------------------

function Main()
  -- Example usage
  reaper.ShowConsoleMsg("Maestro IA Reaper Integration v" .. MAESTRO_VERSION .. "\n")

  -- Create a test project
  CreateProject(120, "C", "4/4")

  -- Create test tracks
  local instruments = {
    {name = "Piano", midiChannel = 0, role = "harmony"},
    {name = "Bass", midiChannel = 2, role = "bass"},
    {name = "Drums", midiChannel = 9, role = "drums"}
  }

  CreateTracks(instruments)

  reaper.ShowConsoleMsg("Project created successfully!\n")
end

-- Uncomment to run as standalone script
-- Main()
