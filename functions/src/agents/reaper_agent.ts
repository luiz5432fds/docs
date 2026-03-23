import {NoteData} from '../types';

interface ReaperInput {
  notes: NoteData[];
  projectName: string;
  bpm: number;
  timeSignature: {numerator: number; denominator: number};
  tracks?: Array<{
    name: string;
    instrument: string;
    notes: NoteData[];
  }>;
}

interface ReaperOutput {
  rppContent: string;
  metadata: {
    tracks: number;
    items: number;
    duration: number;
  };
}

/**
 * Reaper Agent - Generates Reaper (.rpp) project files
 * Compatible with Reaper DAW for music production
 */
export async function reaperAgent(input: ReaperInput): Promise<ReaperOutput> {
  const {
    notes,
    projectName,
    bpm,
    timeSignature,
    tracks = []
  } = input;

  // Group notes into tracks if not provided
  const processedTracks = tracks.length > 0 ? tracks : createTracksFromNotes(notes);

  // Generate RPP content
  const rppContent = generateRPPFile({
    projectName,
    bpm,
    timeSignature,
    tracks: processedTracks
  });

  // Calculate metadata
  const totalItems = processedTracks.reduce((sum, track) => sum + track.notes.length, 0);
  const duration = calculateProjectDuration(processedTracks, bpm);

  return {
    rppContent,
    metadata: {
      tracks: processedTracks.length,
      items: totalItems,
      duration
    }
  };
}

/**
 * Create tracks from unorganized notes
 */
function createTracksFromNotes(notes: NoteData[]): Array<{
  name: string;
  instrument: string;
  notes: NoteData[];
}> {
  const tracks: Map<string, NoteData[]> = new Map();

  for (const note of notes) {
    let trackName: string;

    // Determine track based on pitch range
    if (note.pitch >= 60) {
      trackName = 'Melody';
    } else if (note.pitch >= 48) {
      trackName = 'Harmony';
    } else if (note.pitch >= 36) {
      trackName = 'Bass';
    } else {
      trackName = 'Sub Bass';
    }

    if (!tracks.has(trackName)) {
      tracks.set(trackName, []);
    }
    tracks.get(trackName)!.push({...note});
  }

  return Array.from(tracks.entries()).map(([name, notes]) => ({
    name,
    instrument: getReaperInstrument(name),
    notes
  }));
}

/**
 * Get default instrument for track
 */
function getReaperInstrument(trackName: string): string {
  const instrumentMap: Record<string, string> = {
    'Melody': 'VSTi: SynKrony Lead',
    'Harmony': 'VSTi: SynKrony Pad',
    'Bass': 'VSTi: SynKrony Bass',
    'Sub Bass': 'VSTi: SynKrony Sub'
  };

  return instrumentMap[trackName] || 'VSTi: SynKrony Default';
}

/**
 * Generate RPP file content
 */
function generateRPPFile(params: {
  projectName: string;
  bpm: number;
  timeSignature: {numerator: number; denominator: number};
  tracks: Array<{
    name: string;
    instrument: string;
    notes: NoteData[];
  }>;
}): string {
  const {projectName, bpm, timeSignature, tracks} = params;

  let tracksXml = '';

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const midiData = generateMidiData(track.notes, bpm);

    tracksXml += `
<TRACK
  NAME "${track.name}"
  PEAK_COL 2
  BEHAVIOR 1
  VOLUME_PAN_ENVELOPE_PHASE 0
  VOLUME_PAN_ENVELOPE_PADDING 0
  <MIDIOUT
    0 -1
  >
  <ISBUS 0 0 0
  <BUSCOMP 0 0 0 0 0
  <BUSES 0
  <FX 0
  <RECEIVES 0
  <MIDI 0
>
<ITEM
  POSITION 0
  LENGTH ${calculateItemLength(track.notes, bpm)}
  FADEIN 1 0 1 0 0 0
  FADEOUT 1 0 1 0 0 0
  SNAPOFFS 0
  POSITION 1 4 0
  BEATATTACHMODE 1
  <SOURCE MIDI
    HASDATA 1 1
    FILE "${track.name.replace(/\s/g, '_')}.mid"
    ${midiData}
  >
  <SOURCE MIDI
    HASDATA 0 0
    FILE ""
  >
>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<REAPER_PROJECT 0.1 "7.09" 7783459635902027755
  ${new Date().toISOString().replace(/[-:T.Z]/g, '')}
  ${params.projectName.replace(/\s/g, '_')}.rpp
  <NOTES
  >
  TRACKCOUNT ${tracks.length}
  PROJECT WHATEVER
  LOOP 0 0
  GRID 8
  GRIDSPACING 1 64 0.00000000000000
  GRIDDIVISION 5
  GRIDCOLOR 0 0 0 0 0 0
  TIMEMODE 1 4
  TEMPO 0 ${bpm} 4 4
  PLAYSPEED 1 1 4 0
  RECORDCONFIG 0 0
  <MKREGIONWHENPASTING 0 0 0 0 0 0
  <MKTRACKWHENPASTING 0 0 0 0 0 0
  <ENVATTACHSHIFT 0 0
  <PEAKCOLOR 0 0 0 0 0 0
  <PAUSES_WHEN_PLAYBACK_ACTIVE 0
  <ENVELOPEBUDGET 2000000
  <FXBUDGET 10485760
  ${generateTimeSignature(timeSignature)}
${tracksXml}
>`;
}

/**
 * Generate MIDI data for track
 */
function generateMidiData(notes: NoteData[], bpm: number): string {
  const ticksPerBeat = 960;
  const midiEvents: string[] = [];

  // Sort notes by position
  const sortedNotes = [...notes].sort((a, b) => a.position - b.position);

  for (const note of sortedNotes) {
    const onset = Math.round(note.position);
    const duration = Math.round(note.duration);
    const pitch = note.pitch;
    const velocity = note.velocity;

    midiEvents.push(`e ${onset} 90 ${pitch.toString(16).padStart(2, '0')} ${velocity.toString(16).padStart(2, '0')}`);
    midiEvents.push(`e ${onset + duration} 80 ${pitch.toString(16).padStart(2, '0')} 00`);
  }

  return midiEvents.join('\n    ');
}

/**
 * Calculate item length in seconds
 */
function calculateItemLength(notes: NoteData[], bpm: number): number {
  if (notes.length === 0) return 4.0;

  const ticksPerBeat = 960;
  const lastNote = notes.reduce((a, b) => a.position > b.position ? a : b);
  const beats = (lastNote.position + lastNote.duration) / ticksPerBeat;
  const seconds = beats * 60 / bpm;

  return Math.max(4.0, Math.ceil(seconds * 10) / 10);
}

/**
 * Calculate project duration in seconds
 */
function calculateProjectDuration(
  tracks: Array<{notes: NoteData[]}>,
  bpm: number
): number {
  let maxEnd = 0;

  for (const track of tracks) {
    for (const note of track.notes) {
      const end = note.position + note.duration;
      maxEnd = Math.max(maxEnd, end);
    }
  }

  const ticksPerBeat = 960;
  const beats = maxEnd / ticksPerBeat;
  return Math.ceil(beats * 60 / bpm);
}

/**
 * Generate time signature data
 */
function generateTimeSignature(timeSig: {numerator: number; denominator: number}): string {
  return `TIMESIG_NUM ${timeSig.numerator}
TIMESIG_DENOM ${timeSig.denominator}`;
}

/**
 * Import Reaper project data
 */
export async function importReaperProject(rppContent: string): Promise<{
  tracks: Array<{
    name: string;
    notes: NoteData[];
  }>;
  tempo: number;
  timeSignature: {numerator: number; denominator: number};
}> {
  // Parse RPP file format
  const lines = rppContent.split('\n');
  const tracks: Array<{name: string; notes: NoteData[]}> = [];
  let currentTrack: {name: string; notes: NoteData[]} | null = null;
  let tempo = 120;
  let timeSignature = {numerator: 4, denominator: 4};

  for (const line of lines) {
    const trackMatch = line.match(/NAME "([^"]+)"/);
    if (trackMatch && line.includes('TRACK')) {
      if (currentTrack) {
        tracks.push(currentTrack);
      }
      currentTrack = {name: trackMatch[1], notes: []};
    }

    const tempoMatch = line.match(/TEMPO \d+ (\d+(?:\.\d+)?)/);
    if (tempoMatch) {
      tempo = parseFloat(tempoMatch[1]);
    }

    const timeSigNum = line.match(/TIMESIG_NUM (\d+)/);
    const timeSigDenom = line.match(/TIMESIG_DENOM (\d+)/);
    if (timeSigNum && timeSigDenom) {
      timeSignature = {
        numerator: parseInt(timeSigNum[1]),
        denominator: parseInt(timeSigDenom[1])
      };
    }
  }

  if (currentTrack) {
    tracks.push(currentTrack);
  }

  return {
    tracks,
    tempo,
    timeSignature
  };
}

/**
 * Generate Reaper Lua script for SynKrony integration
 */
export function generateSynKronyReaperScript(): string {
  return `-- SynKrony Hardware Bridge for Reaper
-- Integrates Yamaha MM8 and Roland XPS-10

function check_counterpoint(note1, note2, last_note1, last_note2)
  -- Check for parallel fifths
  interval1 = math.abs(note1 - note2) % 12
  interval2 = math.abs(last_note1 - last_note2) % 12

  if interval1 == 7 and interval2 == 7 then
    return false, "Parallel fifths detected"
  end

  -- Check for parallel octaves
  if interval1 == 0 and interval2 == 0 then
    return false, "Parallel octaves detected"
  end

  return true, "Counterpoint check passed"
end

function apply_partimento_rule(bass_note, genre)
  -- Apply Rule of the Octave for Brega
  if genre == "brega" then
    degree = bass_note % 12
    if degree == 0 then return "I" end
    if degree == 5 then return "IV" end
    if degree == 7 then return "V7" end
  end

  -- Apply Forró patterns
  if genre == "forro" then
    degree = bass_note % 12
    if degree == 0 then return "I" end
    if degree == 5 then return "IV" end
    if degree == 7 then return "V7" end
  end

  return "I"
end

function send_hardware_sysex(parameter, value)
  -- SysEx for Roland XPS-10
  reaper.StuffMIDIMessage(0, 0xF0, 0x41, 0x10, 0x00, 0x6B, 0x12, parameter, value, 0xF7)
end

function main()
  -- Get selected notes
  count = reaper.CountSelectedMediaItems(0)

  for i = 0, count - 1 do
    item = reaper.GetSelectedMediaItem(0, i)
    take = reaper.GetActiveTake(item)

    if take and reaper.TakeIsMIDI(take) then
      -- Process MIDI notes
      retval, notecnt, ccevtcnt, textsyxevtcnt = reaper.MIDI_CountEvts(take)

      for noteidx = 0, notecnt - 1 do
        retval, selected, muted, startppq, endppq, chan, pitch, vel = reaper.MIDI_GetNote(take, noteidx)

        -- Apply partimento rule
        chord = apply_partimento_rule(pitch, "brega")
        reaper.ShowConsoleMsg("Note " .. pitch .. " -> " .. chord .. "\\n")
      end
    end
  end
end

reaper.defer(main)`;
}
