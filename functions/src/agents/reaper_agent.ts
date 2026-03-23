/**
 * SynKrony Reaper Agent
 *
 * Handles integration with REAPER (Rapid Environment for Audio Production,
 * Engineering, and Recording). REAPER is a popular DAW used for music
 * production, especially with acoustic instruments and live recordings.
 *
 * This agent creates .rpp project files and provides ReaScript integration.
 */

import {NoteData, SynKronyTrack, SynKronyProject} from '../types';

// ============================================================================
// REAPER PROJECT GENERATION
// ============================================================================

interface ReaperRequest {
  project: SynKronyProject;
  tracks: SynKronyTrack[];
  notes: NoteData[];
}

interface ReaperResponse {
  project_file: string;
  metadata: {
    tracks_count: number;
    total_notes: number;
    duration_seconds: number;
  };
}

/**
 * Generate REAPER project file (.rpp)
 */
function generateReaperProject(
  project: SynKronyProject,
  tracks: SynKronyTrack[],
  notes: NoteData[]
): string {
  const timestamp = Date.now();
  const rpp: string[] = [];

  // Header
  rpp.push('<REAPER_PROJECT 0.1 "6.66//x86_64"');
  rpp.push(`"${timestamp}"');
  rpp.push('');

  // Project settings
  rpp.push('<REAPER_PROJECT_SETTINGS');
  rpp.push(`  proj_srate ${project.tempo > 0 ? 44100 : 44100}`);
  rpp.push('  proj_all_tr_pix 1200');
  rpp.push('  proj_measure_half 1000');
  rpp.push('  proj_timebase 1 960');
  rpp.push('  proj_extradir_render "Rendered"');
  rpp.push('>');

  // Tempo marker
  rpp.push('<TEMPOENV');
  rpp.push(`  ${project.tempo} 4 4 0 -1');
  rpp.push('  PT 0.000000 0');
  rpp.push('>');

  // Time signature
  rpp.push(`<TIME_SIGNATURE 4/4 0 4 0`);

  // Generate tracks
  for (let t = 0; t < tracks.length; t++) {
    const track = tracks[t];
    rpp.push('');
    rpp.push(`<TRACK ${t + 1}`);
    rpp.push(`  NAME "${track.name}"`);
    rpp.push(`  PEAK 1 ${track.volume} 0 0 0`);
    rpp.push(`  VOLPAN 0.89999998 ${track.pan} -1 -1 0 1 0.5');
    rpp.push(`  MUTESOLO 0 0 0');
    rpp.push(`  FX 1');

    // MIDI items
    const trackNotes = notes.filter(n =>
      // Simple assignment - in real implementation would match by track ID
      Math.random() > 0.5
    );

    if (trackNotes.length > 0) {
      rpp.push('  <ITEM');
      rpp.push('    POSITION 0');
      rpp.push(`    LENGTH ${calculateTrackLength(trackNotes)}`);
      rpp.push(`    POSITION_IN_PROJECT_ITEM 0`);
      rpp.push(`    SNAPOFFS 0`);
      rpp.push('    <SOURCE MIDI');
      rpp.push(`      HASDATA 1 ${trackNotes.length}`);

      // MIDI events
      for (const note of trackNotes) {
        const positionMs = ticksToMilliseconds(note.position, project.tempo);
        const durationMs = ticksToMilliseconds(note.duration, project.tempo);
        rpp.push(`      E ${Math.round(positionMs)} 90 ${note.pitch} ${note.velocity}`);
        rpp.push(`      E ${Math.round(positionMs + durationMs)} 80 ${note.pitch} 0`);
      }

      rpp.push('    >');
      rpp.push('    <ITEM-TAKE');
      rpp.push('      NAME "MIDI"');
      rpp.push('      VOLPAN 1.0 0 1.0 -1 -1');
      rpp.push('      PITCH 0 1');
      rpp.push('      <FX 1 LIST>');
      rpp.push('      >');
      rpp.push('      >ITEM-TAKE');
      rpp.push('    >ITEM');
    }

    rpp.push('>TRACK');
  }

  // Footer
  rpp.push('');
  rpp.push('>REAPER_PROJECT');

  return rpp.join('\n');
}

/**
 * Calculate track length from notes
 */
function calculateTrackLength(notes: NoteData[]): number {
  let maxEnd = 0;
  for (const note of notes) {
    const end = note.position + note.duration;
    if (end > maxEnd) maxEnd = end;
  }

  // Convert ticks to seconds (assuming 960 ticks per quarter note)
  const ticksPerSecond = 960 * 2;  // At 120 BPM
  return maxEnd / ticksPerSecond;
}

/**
 * Convert ticks to milliseconds
 */
function ticksToMilliseconds(ticks: number, tempo: number): number {
  const beatsPerSecond = tempo / 60;
  const ticksPerBeat = 960;
  const ticksPerSecond = beatsPerSecond * ticksPerBeat;
  return (ticks / ticksPerSecond) * 1000;
}

/**
 * Export MIDI to Reaper-importable format
 */
function exportMidiForReaper(notes: NoteData[], trackName: string): string {
  // Simplified MIDI export
  const midiData = [];

  for (const note of notes) {
    midiData.push({
      pitch: note.pitch,
      velocity: note.velocity,
      start: note.position,
      duration: note.duration
    });
  }

  return JSON.stringify(midiData);
}

/**
 * Main agent function
 */
export async function reaperAgent(request: ReaperRequest): Promise<ReaperResponse> {
  const {project, tracks, notes} = request;

  const project_file = generateReaperProject(project, tracks, notes);

  return {
    project_file,
    metadata: {
      tracks_count: tracks.length,
      total_notes: notes.length,
      duration_seconds: calculateTrackLength(notes)
    }
  };
}

/**
 * Generate ReaScript for partimento checking
 */
export function generateReaperScript(): string {
  return `-- SynKrony Partimento Helper for REAPER
-- Checks counterpoint rules and Partimento compliance

function check_counterpoint(note1, note2, last_note1, last_note2)
  -- Check for parallel fifths
  local interval1 = math.abs(note1 - note2)
  local interval2 = math.abs(last_note1 - last_note2)

  if interval1 == 7 and interval2 == 7 then
    return true, "Parallel fifth detected"
  end

  -- Check for parallel octaves
  if interval1 == 12 and interval2 == 12 then
    return true, "Parallel octave detected"
  end

  return false, ""
end

function apply_partimento_rule(bass_note)
  -- Apply Rule of Octave for Brega style
  local rules = {
    [0] = {0, 4, 7},      -- I
    [1] = {2, 5, 9},      -- II
    [2] = {4, 7, 11},     -- III
    [3] = {5, 9, 12},     -- IV
    [4] = {7, 11, 14},    -- V
    [5] = {9, 12, 16},    -- VI
    [6] = {11, 14, 17}    -- VII
  }

  local degree = bass_note % 7
  return rules[degree] or {0, 4, 7}
end

function send_hardware_sysex(parameter, value)
  -- Send SysEx to Roland XPS-10
  local sysex = string.format("\\xF0\\x41\\x10\\x00\\x00\\x43\\x12\\x%02X\\x%02X\\xF7", parameter, value)
  reaper.StuffMIDIMessage(0, sysex)
end

-- Main function
function main()
  local item_count = reaper.CountSelectedMediaItems(0)

  for i = 0, item_count - 1 do
    local item = reaper.GetSelectedMediaItem(0, i)
    local take = reaper.GetActiveTake(item)

    if take and reaper.TakeIsMIDI(take) then
      local retval, notecnt, ccevtcnt, textsyxevtcnt = reaper.MIDI_CountEvts(take)

      -- Process MIDI notes
      for noteidx = 0, notecnt - 1 do
        local retval, selected, muted, startppq, endppq, chan, pitch, vel = reaper.MIDI_GetNote(take, noteidx)
        -- Apply partimento rules here
      end
    end
  end
end

-- Run main function
reaper.defer(main)
`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {ReaperRequest, ReaperResponse};
