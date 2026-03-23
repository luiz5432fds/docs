--[[
  SynKrony Core - REAPER Integration Script

  This script provides integration between SynKrony AI and REAPER DAW.
  Features:
  - Partimento rule checking (Rule of Octave, Counterpoint)
  - Regional style adaptation (Brega, Forró)
  - MIDI pass-through to XPS-10/MM8 hardware
  - MusicXML export/import coordination

  Author: SynKrony AI Team
  Version: 1.0.0
  License: MIT
]]

-- *****************************************************************************
-- CONSTANTS
-- *****************************************************************************

local SK_VERSION = "1.0.0"

-- MIDI Channels
local MM8_CHANNEL = 1      -- Yamaha MM8 (bass/clock)
local XPS10_CHANNEL = 2    -- Roland XPS-10 (leads/pads)

-- Partimento Rules
local RULE_OF_OCTAVE_MAJOR = {
  [0] = {0, 4, 7},      -- I: C-E-G
  [1] = {2, 5, 9},      -- II: D-F-A (first inv)
  [2] = {4, 7, 11},     -- III: E-G-B
  [3] = {5, 9, 12},     -- IV: F-A-C (first inv)
  [4] = {7, 11, 14},    -- V: G-B-D
  [5] = {9, 12, 16},    -- VI: A-C-E (first inv)
  [6] = {11, 14, 17}    -- VII: B-D-F (leading)
}

local RULE_OF_OCTAVE_MINOR = {
  [0] = {0, 3, 7},      -- i: C-Eb-G
  [1] = {2, 5, 8},      -- iio: D-F-Ab
  [2] = {3, 7, 10},     -- III: Eb-G-Bb
  [3] = {5, 8, 12},     -- iv: F-Ab-C
  [4] = {7, 10, 14},    -- v: G-Bb-D
  [5] = {8, 12, 15],    -- VI: Ab-C-Eb
  [6] = {11, 14, 17}    -- VII: B-D-F
}

-- Regional adjustments
local REGIONAL_STYLES = {
  brega = {
    name = "Brega Romântico",
    swing = 0.0,
    accent_pattern = {1.0, 0.5, 0.8, 0.5},
    harmony_modifications = {
      -- Brega allows V7 with delayed resolution
      [4] = {7, 10, 14}  -- V7 with seventh
    }
  },
  forro = {
    name = "Forró Piseiro/Baião",
    swing = 0.25,
    accent_pattern = {1.0, 0.3, 0.8, 0.3},
    syncopation_strength = 0.5
  },
  tecnobrega = {
    name = "Tecnobrega",
    swing = 0.2,
    accent_pattern = {1.0, 0.7, 0.5, 0.7},
    bass_emphasis = 2.0
  }
}

-- *****************************************************************************
-- UTILITY FUNCTIONS
-- *****************************************************************************

-- Print debug message
function SK_Log(message, level)
  level = level or "INFO"
  reaper.ShowConsoleMsg(string.format("[SK:%s] %s\n", level, message))
end

-- Get MIDI note name from number
function SK_MidiToNoteName(midi)
  local notes = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}
  local octave = math.floor(midi / 12) - 1
  local note = notes[(midi % 12) + 1]
  return note .. octave
end

-- Get scale degree from MIDI note
function SK_GetScaleDegree(midi, root, mode)
  local intervals = mode == "major"
    and {0, 2, 4, 5, 7, 9, 11}
    or {0, 2, 3, 5, 7, 8, 10}

  local normalized = ((midi - root) % 12 + 12) % 12

  for i, interval in ipairs(intervals) do
    if interval == normalized then
      return i - 1  -- 0-indexed degree
    end
  end

  return 0  -- Default to tonic
end

-- *****************************************************************************
-- COUNTERPOINT CHECKING
-- *****************************************************************************

-- Check for parallel fifths or octaves
function SK_CheckParallel(voices1, voices2)
  local violations = {}

  for i = 2, #voices1 do
    local prev_interval = math.abs(voices1[i-1] - voices2[i-1])
    local curr_interval = math.abs(voices1[i] - voices2[i])

    -- Parallel fifths
    if prev_interval == 7 and curr_interval == 7 then
      table.insert(violations, {
        type = "parallel_fifth",
        position = i,
        note1 = SK_MidiToNoteName(voices1[i]),
        note2 = SK_MidiToNoteName(voices2[i])
      })
    end

    -- Parallel octaves
    if prev_interval == 12 and curr_interval == 12 then
      table.insert(violations, {
        type = "parallel_octave",
        position = i,
        note1 = SK_MidiToNoteName(voices1[i]),
        note2 = SK_MidiToNoteName(voices2[i])
      })
    end
  end

  return violations
end

-- Check for proper leading tone resolution
function SK_CheckLeadingTone(voice, root, mode)
  local violations = {}
  local leading_tone = mode == "major" and root + 11 or root + 10
  local tonic = root + 12

  for i = 1, #voice - 1 do
    if voice[i] == leading_tone and voice[i + 1] ~= tonic then
      table.insert(violations, {
        type = "leading_tone",
        position = i,
        note = SK_MidiToNoteName(voice[i]),
        resolution = SK_MidiToNoteName(voice[i + 1])
      })
    end
  end

  return violations
end

-- *****************************************************************************
-- PARTIMENTO RULES
-- *****************************************************************************

-- Apply Rule of Octave to bass note
function SK_ApplyRuleOfOctave(bass_note, root, mode, style)
  local degree = SK_GetScaleDegree(bass_note, root, mode)
  local rules = mode == "major" and RULE_OF_OCTAVE_MAJOR or RULE_OF_OCTAVE_MINOR

  -- Get base voicing
  local voicing = {}
  for i, interval in ipairs(rules[degree] or {0, 4, 7}) do
    table.insert(voicing, bass_note + interval)
  end

  -- Apply regional modifications
  if style and REGIONAL_STYLES[style] then
    local regional = REGIONAL_STYLES[style]

    if style == "brega" and degree == 4 then
      -- Brega adds seventh to V
      table.insert(voicing, bass_note + 10)
    elseif style == "forro" then
      -- Forró prefers open voicings
      if #voicing > 2 then
        voicing[3] = voicing[3] + 12  -- Raise third voice
      end
    end
  end

  return voicing
end

-- Generate Partimento realization
function SK_GeneratePartimento(bass_line, root, mode, style)
  local realization = {}

  for i, bass_note in ipairs(bass_line) do
    local voicing = SK_ApplyRuleOfOctave(bass_note, root, mode, style)
    table.insert(realization, {
      bass = bass_note,
      voicing = voicing,
      degree = SK_GetScaleDegree(bass_note, root, mode)
    })
  end

  return realization
end

-- *****************************************************************************
-- HARDWARE COMMUNICATION
-- *****************************************************************************

-- Send SysEx to Roland XPS-10
function SK_SendXPS10SysEx(device_id, parameter, value)
  -- Roland XPS-10 SysEx format
  local sysex = string.format(
    "\xF0\x41\x10\x00\x00\x43\x12%s%s\xF7",
    string.char(parameter),
    string.char(value)
  )

  -- Send to XPS-10 MIDI channel
  reaper.StuffMIDIMessage(XPS10_CHANNEL, sysex)
  SK_Log("Sent SysEx to XPS-10: param=" .. parameter .. " value=" .. value)
end

-- Send MIDI note to hardware
function SK_SendNote(channel, pitch, velocity, duration_ms)
  reaper.StuffMIDIMessage(channel,
    string.format("\x90%s%s", string.char(pitch), string.char(velocity)))

  if duration_ms > 0 then
    reaper.StuffMIDIMessage(channel,
      string.format("\x80%s%s", string.char(pitch), string.char(0)))
  end
end

-- *****************************************************************************
-- MAIN FUNCTIONS
-- *****************************************************************************

-- Main entry point
function SK_Main()
  -- Get selected items
  local item_count = reaper.CountSelectedMediaItems(0)

  if item_count == 0 then
    SK_Log("No items selected. Please select MIDI items to analyze.", "WARN")
    return
  end

  SK_Log("SynKrony Core v" .. SK_VERSION)
  SK_Log("Processing " .. item_count .. " items...")

  -- Process each item
  for i = 0, item_count - 1 do
    local item = reaper.GetSelectedMediaItem(0, i)
    local take = reaper.GetActiveTake(item)

    if take and reaper.TakeIsMIDI(take) then
      SK_ProcessMIDIItem(take, i)
    else
      SK_Log("Item " .. i + 1 .. " is not a MIDI take", "WARN")
    end
  end

  SK_Log("Processing complete!")
end

-- Process a MIDI item
function SK_ProcessMIDIItem(take, index)
  local retval, notecnt = reaper.MIDI_CountEvts(take)

  if notecnt == 0 then
    SK_Log("Take " .. index + 1 .. " has no notes", "WARN")
    return
  end

  -- Extract notes by position
  local notes = {}
  for noteidx = 0, notecnt - 1 do
    local retval, selected, muted, startppq, endppq, chan, pitch, vel =
      reaper.MIDI_GetNote(take, noteidx)

    table.insert(notes, {
      pitch = pitch,
      start = startppq,
      duration = endppq - startppq,
      velocity = vel,
      channel = chan,
      index = noteidx
    })
  end

  -- Analyze (simplified)
  if #notes > 0 then
    local root = 60  -- C4
    local mode = "major"
    local style = "brega"  -- Default style

    -- Check counterpoint
    if #notes > 1 then
      local voice1 = {}
      local voice2 = {}

      for _, note in ipairs(notes) do
        table.insert(voice1, note.pitch)
        table.insert(voice2, note.pitch - 12)  -- Simulated second voice
      end

      local violations = SK_CheckParallel(voice1, voice2)
      if #violations > 0 then
        SK_Log("Found " .. #violations .. " counterpoint violations", "WARN")
      end
    end

    SK_Log("Take " .. index + 1 .. ": " .. #notes .. " notes analyzed")
  end
end

-- *****************************************************************************
-- INITIALIZATION
-- *****************************************************************************

-- Register script
reaper.defer(SK_Main)
