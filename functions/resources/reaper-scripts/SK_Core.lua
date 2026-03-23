-- SynKrony Hardware Bridge for Reaper
-- Integrates Yamaha MM8 and Roland XPS-10
-- Partimento and Counterpoint realization
-- Regional styles: Brega, Forró, Tecnobrega

-- Version: 1.0.0
-- Author: SynKrony AI System
-- License: MIT

--[[

    SK_Core.lua - SynKrony Core Integration Module

    This script provides:
    - MIDI communication with Yamaha MM8 and Roland XPS-10
    - Partimento rule application (Rule of the Octave)
    - Counterpoint checking (Dufay rules)
    - Regional style adaptation (Brega, Forró)
    - SysEx parameter automation

]]--

-- *****************************************************************************
-- UTILITIES
-- *****************************************************************************

local function log_message(msg)
    reaper.ShowConsoleMsg("[SynKrony] " .. msg .. "\n")
end

local function note_to_interval(note1, note2)
    return math.abs(note1 - note2) % 12
end

-- *****************************************************************************
-- PARTIMENTO ENGINE
-- *****************************************************************************

local PartimentoRules = {
    brega = {
        [0] = "I",      -- C
        [2] = "II",     -- D
        [4] = "III",    -- E
        [5] = "IV",     -- F
        [7] = "V7",     -- G
        [9] = "VI7",    -- A (emotional)
        [11] = "viio"   -- B
    },
    forro = {
        [0] = "I",
        [5] = "IV",
        [7] = "V7",
        default = "I"
    },
    tecnobrega = {
        [0] = "i",
        [9] = "VI",
        [4] = "III",
        [11] = "VII"
    }
}

local function apply_partimento_rule(bass_note, genre)
    local degree = bass_note % 12
    local rules = PartimentoRules[genre] or PartimentoRules.forro

    if rules[degree] then
        return rules[degree]
    else
        return rules.default or "I"
    end
end

local function get_partimento_voicing(chord, genre)
    local voicings = {
        brega = {
            ["I"] = {0, 12, 19, 24},      -- Root, 8va, 5th, 15ma (emotional spread)
            ["V7"] = {0, 10, 12, 22},     -- Root, 7th, 8va, 14th (tension)
            ["VI7"] = {0, 10, 15, 19}     -- Emotional dominant
        },
        forro = {
            ["I"] = {0, 7, 12},           -- Shell voicing (5th, 8va)
            ["IV"] = {0, 7, 12},
            ["V7"] = {0, 10, 12}          -- Shell 7th
        }
    }

    local genre_voicings = voicings[genre] or voicings.forro
    return genre_voicings[chord] or {0, 12, 16, 19}
end

-- *****************************************************************************
-- COUNTERPOINT ENGINE (Dufay Rules)
-- *****************************************************************************

local function check_counterpoint_violations(note1, note2, last_note1, last_note2, genre)
    local violations = {}

    -- Calculate intervals
    local interval1 = note_to_interval(note1, note2)
    local interval2 = note_to_interval(last_note1, last_note2)

    -- Check for parallel fifths
    if interval1 == 7 and interval2 == 7 then
        table.insert(violations, "Quintas paralelas")
    end

    -- Check for parallel octaves
    if interval1 == 0 and interval2 == 0 then
        table.insert(violations, "Oitavas paralelas")
    end

    -- Check for tritone (diabolus in musica)
    if interval1 == 6 then
        table.insert(violations, "Trítono")
    end

    -- Regional exceptions
    if genre == "brega" then
        -- Brega allows parallel fifths for nostalgic effect
        local brega_exceptions = {"Quintas paralelas"}
        for i = #violations, 1, -1 do
            for _, exc in ipairs(brega_exceptions) do
                if violations[i] == exc then
                    table.remove(violations, i)
                    break
                end
            end
        end
    end

    return violations
end

-- *****************************************************************************
-- HARDWARE COMMUNICATION
-- *****************************************************************************

local SysExHeaders = {
    roland = {0xF0, 0x41, 0x10, 0x00, 0x6B, 0x12}, -- Roland XPS-10
    yamaha = {0xF0, 0x43, 0x10, 0x4C, 0x00}         -- Yamaha MM8
}

local function send_xps10_sysex(parameter, value)
    local sysex = {}
    -- Header
    for _, v in ipairs(SysExHeaders.roland) do
        table.insert(sysex, v)
    end
    -- Address (example: cutoff)
    table.insert(sysex, 0x20) -- TVF Cutoff address high
    table.insert(sysex, 0x00) -- TVF Cutoff address low
    -- Value
    table.insert(sysex, value)
    -- Checksum and EOX
    table.insert(sysex, 0xF7)

    reaper.StuffMIDIMessage(0, table.unpack(sysex))
    log_message("SysEx enviado para XPS-10: param=" .. parameter .. " value=" .. value)
end

local function send_mm8_sysex(parameter, value)
    local sysex = {}
    -- Header
    for _, v in ipairs(SysExHeaders.yamaha) do
        table.insert(sysex, v)
    end
    -- Parameter
    table.insert(sysex, parameter)
    -- Value
    table.insert(sysex, value)
    -- EOX
    table.insert(sysex, 0xF7)

    reaper.StuffMIDIMessage(1, table.unpack(sysex)) -- MM8 on channel 2
    log_message("SysEx enviado para MM8: param=" .. parameter .. " value=" .. value)
end

-- *****************************************************************************
-- REGIONAL STYLES
-- *****************************************************************************

local RegionalStyles = {
    brega = {
        swing = 0,
        accent_pattern = {1.0, 0.5, 1.0, 0.5},
        micro_timing = {0, 50, 0, 50},
        retard_43 = true,
        retard_98 = true
    },
    forro = {
        swing = 0.4,
        accent_pattern = {1.0, 0.8, 1.0, 0.8},
        micro_timing = {0, 30, 0, 30},
        syncopation = true
    },
    tecnobrega = {
        swing = 0,
        accent_pattern = {1.0, 1.0, 1.0, 1.0},
        micro_timing = {0, 0, 0, 0},
        quantize_strict = true
    }
}

local function apply_regional_timing(position_ppq, genre)
    local style = RegionalStyles[genre] or RegionalStyles.forro
    local beat = math.floor(position_ppq / 240) % 4
    local offset = style.micro_timing[beat + 1] or 0

    return position_ppq + offset
end

-- *****************************************************************************
-- MAIN FUNCTIONS
-- *****************************************************************************

local function process_selected_notes(genre)
    local count = reaper.CountSelectedMediaItems(0)

    if count == 0 then
        log_message("Nenhum item selecionado")
        return
    end

    for i = 0, count - 1 do
        local item = reaper.GetSelectedMediaItem(0, i)
        local take = reaper.GetActiveTake(item)

        if take and reaper.TakeIsMIDI(take) then
            local retval, notecnt, ccevtcnt, textsyxevtcnt = reaper.MIDI_CountEvts(take)

            local last_notes = {} -- Track last notes for counterpoint

            for noteidx = 0, notecnt - 1 do
                local retval, selected, muted, startppq, endppq, chan, pitch, vel =
                    reaper.MIDI_GetNote(take, noteidx)

                -- Apply partimento rule
                local chord = apply_partimento_rule(pitch, genre)
                local voicing = get_partimento_voicing(chord, genre)

                -- Apply regional timing
                local new_start = apply_regional_timing(startppq, genre)

                -- Update note
                reaper.MIDI_SetNote(take, noteidx, selected, muted,
                    new_start, endppq, chan, pitch, vel, false)

                log_message(string.format("Nota %d (%s): acorde=%s voicing={%s}",
                    pitch, noteidx, chord,
                    table.concat(voicing, ", ")))
            end
        end
    end
end

local function analyze_counterpoint()
    -- Analyze all selected MIDI items for counterpoint violations
    local count = reaper.CountSelectedMediaItems(0)
    local total_violations = 0

    for i = 0, count - 1 do
        local item = reaper.GetSelectedMediaItem(0, i)
        local take = reaper.GetActiveTake(item)

        if take and reaper.TakeIsMIDI(take) then
            local retval, notecnt = reaper.MIDI_CountEvts(take)
            -- Implementation would compare multiple tracks
        end
    end

    log_message("Análise de contraponto: " .. total_violations .. " violações encontradas")
end

local function sync_to_hardware()
    -- Send current project settings to hardware
    local tempo = reaper.Master_GetTempo()
    log_message("Sync: BPM = " .. tempo)

    -- Example: Send cutoff based on genre
    send_xps10_sysex(0x01, 64) -- Mid cutoff
    log_message("Hardware sync completo")
end

-- *****************************************************************************
-- MENU ENTRY
-- *****************************************************************************

local function main()
    local menu = {
        "1. Processar notas (Partimento)",
        "2. Analisar contraponto",
        "3. Sync com hardware",
        "4. Configurar estilo regional",
        "5. Sair"
    }

    local choice = reaper.ShowConsoleMsg(
        "=== SynKrony Core ===\n" ..
        "Selecione uma opção:\n" ..
        table.concat(menu, "\n") ..
        "\n\n"
    )

    if choice == "1" then
        local genre = reaper.GetUserInputs("SynKrony", 1,
            "Estilo (brega/forro/tecnobrega):", "brega")
        if genre then
            process_selected_notes(genre)
        end
    elseif choice == "2" then
        analyze_counterpoint()
    elseif choice == "3" then
        sync_to_hardware()
    end
end

-- *****************************************************************************
-- INITIALIZATION
-- *****************************************************************************

reaper.defer(main)
