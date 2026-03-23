/**
 * SynKrony Notation Agent
 *
 * Generates MusicXML notation for SynKrony compositions.
 * MusicXML is the standard format for exchanging notation between
 * applications like MuseScore, Sibelius, Finale, and Reaper.
 *
 * This agent creates properly formatted MusicXML that can be:
 * - Imported into MuseScore 4 for score editing
 * - Used by Reaper's notation view
 * - Shared with other musicians
 */

import {NoteData, Score, PartData, MeasureData} from '../types';

// ============================================================================
// MUSICXML GENERATION
// ============================================================================

interface NotationRequest {
  title: string;
  composer?: string;
  arranger?: string;
  parts: Array<{
    name: string;
    instrumentId: string;
    notes: NoteData[];
  }>;
  tempo: number;
  timeSignature: {numerator: number; denominator: number};
  keySignature: {fifths: number; mode: string};
}

interface NotationResponse {
  musicXml: string;
  metadata: {
    title: string;
    parts_count: number;
    duration_measures: number;
    file_size: number;
  };
}

/**
 * MIDI note to MusicXML step and octave
 */
function midiToStepOctave(midi: number): {step: string; octave: number; alter: number} {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  const noteName = noteNames[noteIndex];

  let step = noteName.replace('#', '');
  let alter = noteName.includes('#') ? 1 : 0;

  // Handle flats (for simpler notation, convert sharps)
  if (noteIndex === 1) { step = 'D'; alter = -1; }
  else if (noteIndex === 3) { step = 'E'; alter = -1; }
  else if (noteIndex === 6) { step = 'G'; alter = -1; }
  else if (noteIndex === 8) { step = 'A'; alter = -1; }
  else if (noteIndex === 10) { step = 'B'; alter = -1; }

  return {step, octave, alter};
}

/**
 * MIDI note to note name (for reference)
 */
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  return noteNames[midi % 12] + octave;
}

/**
 * Duration to MusicXML duration type
 */
function ticksToDurationType(ticks: number, divisions: number): string {
  const quarterTicks = divisions;
  const ratio = ticks / quarterTicks;

  if (ratio <= 0.125) return '1024th';
  if (ratio <= 0.166) return '256th';
  if (ratio <= 0.25) return '128th';
  if (ratio <= 0.333) return '64th';
  if (ratio <= 0.5) return '32nd';
  if (ratio <= 0.666) return '16th';
  if (ratio <= 1) return 'eighth';
  if (ratio <= 1.5) return 'quarter';
  if (ratio <= 2) return 'half';
  if (ratio <= 3) return 'quarter';
  if (ratio <= 4) return 'whole';
  if (ratio <= 6) return 'whole';
  return 'breve';
}

/**
 * Calculate duration in MusicXML units
 */
function calculateDuration(ticks: number, divisions: number): number {
  return Math.round((ticks / divisions) * 4);
}

/**
 * Generate MusicXML header
 */
function generateMusicXmlHeader(
  title: string,
  composer: string,
  arranger: string,
  tempo: number
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXml(title)}</work-title>
  </work>
  <movement-title>${escapeXml(title)}</movement-title>
  <identification>
    <creator type="composer">${escapeXml(composer || 'SynKrony AI')}</creator>
    <creator type="arranger">${escapeXml(arranger || 'SynKrony AI')}</creator>
    <encoding>
      <software>SynKrony AI Music Generator</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
`;
}

/**
 * Generate instrument definition
 */
function generateInstrumentDefinition(
  id: string,
  name: string,
  index: number
): string {
  return `    <score-part id="P${index + 1}">
      <part-name>${escapeXml(name)}</part-name>
      <score-instrument id="P${index + 1}-I${index + 1}">
        <instrument-name>${escapeXml(name)}</instrument-name>
      </score-instrument>
      <midi-instrument id="P${index + 1}-I${index + 1}">
        <midi-channel>${index}</midi-channel>
        <midi-program>0</midi-program>
      </midi-instrument>
    </score-part>
`;
}

/**
 * Generate a measure with notes
 */
function generateMeasure(
  measureNumber: number,
  notes: NoteData[],
  divisions: number,
  startTime: number,
  endTime: number,
  timeSignature: {numerator: number; denominator: number},
  isFirst: boolean,
  keySig: {fifths: number; mode: string},
  tempo: number
): string {
  let measureXml = `    <measure number="${measureNumber}">`;

  // Add attributes, time signature, key signature for first measure
  if (isFirst) {
    measureXml += `
      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>${keySig.fifths}</fifths>
          <mode>${keySig.mode}</mode>
        </key>
        <time>
          <beats>${timeSignature.numerator}</beats>
          <beat-type>${timeSignature.denominator}</beat-type>
        </time>
        <staves>1</staves>
      </attributes>
      <sound tempo="${tempo}"/>`;
  }

  // Filter notes for this measure
  const measureNotes = notes.filter(n =>
    n.position >= startTime && n.position < endTime
  );

  // Sort notes by position
  measureNotes.sort((a, b) => a.position - b.position);

  // Generate notes
  let position = startTime;
  for (const note of measureNotes) {
    const {step, octave, alter} = midiToStepOctave(note.pitch);
    const duration = calculateDuration(note.duration, divisions);
    const type = ticksToDurationType(note.duration, divisions);

    // Handle rests for gaps
    const gap = note.position - position;
    if (gap > 0) {
      const restDuration = calculateDuration(gap, divisions);
      const restType = ticksToDurationType(gap, divisions);
      measureXml += `
      <note>
        <rest/>
        <duration>${restDuration}</duration>
        <type>${restType}</type>
      </note>`;
    }

    // Generate note
    measureXml += `
      <note>
        <pitch>
          <step>${step}</step>
          ${alter !== 0 ? `<alter>${alter}</alter>` : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>${duration}</duration>
        ${note.tieEnd ? '<tie type="stop"/>' : note.tieStart ? '<tie type="start"/>' : ''}
        <type>${type}</type>
        ${note.velocity !== undefined ? `<velocity>${note.velocity}</velocity>` : ''}
        ${note.articulations?.includes('staccato') ? '<articulations><staccato/></articulations>' : ''}
        ${note.articulations?.includes('accent') ? '<articulations><accent/></articulations>' : ''}
        ${note.articulations?.includes('tenuto') ? '<articulations><tenuto/></articulations>' : ''}
      </note>`;

    position = note.position + note.duration;
  }

  // Add rest if needed to fill measure
  const remaining = endTime - position;
  if (remaining > 0 && remaining < endTime - startTime) {
    const restDuration = calculateDuration(remaining, divisions);
    const restType = ticksToDurationType(remaining, divisions);
    measureXml += `
      <note>
        <rest/>
        <duration>${restDuration}</duration>
        <type>${restType}</type>
      </note>`;
  }

  measureXml += `
    </measure>`;

  return measureXml;
}

/**
 * Generate a complete part
 */
function generatePart(
  partIndex: number,
  partName: string,
  notes: NoteData[],
  divisions: number,
  timeSignature: {numerator: number; denominator: number},
  keySig: {fifths: number; mode: string},
  tempo: number,
  totalMeasures: number
): string {
  let partXml = `  <part id="P${partIndex + 1}">
`;

  // Calculate measure duration
  const ticksPerMeasure = divisions * timeSignature.numerator * (4 / timeSignature.denominator);

  // Generate measures
  for (let m = 0; m < totalMeasures; m++) {
    const startTime = m * ticksPerMeasure;
    const endTime = (m + 1) * ticksPerMeasure;

    partXml += generateMeasure(
      m + 1,
      notes,
      divisions,
      startTime,
      endTime,
      timeSignature,
      m === 0,
      keySig,
      tempo
    ) + '\n';
  }

  partXml += `  </part>
`;

  return partXml;
}

/**
 * Calculate total measures from notes
 */
function calculateTotalMeasures(
  notes: NoteData[],
  timeSignature: {numerator: number; denominator: number},
  divisions: number
): number {
  const ticksPerMeasure = divisions * timeSignature.numerator * (4 / timeSignature.denominator);

  let maxPosition = 0;
  for (const note of notes) {
    const end = note.position + note.duration;
    if (end > maxPosition) maxPosition = end;
  }

  return Math.ceil(maxPosition / ticksPerMeasure) || 1;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert key name to MusicXML key signature
 */
function keyToKeySignature(key: string, mode: string): {fifths: number; mode: string} {
  const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];
  const index = circleOfFifths.findIndex(k => key.includes(k));

  let fifths = index >= 0 && index < 7 ? index : index - 7;
  if (fifths < -6) fifths = 0;

  return {
    fifths,
    mode: mode === 'minor' ? 'minor' : 'major'
  };
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

export async function notationAgent(request: NotationRequest): Promise<NotationResponse> {
  const {
    title,
    composer,
    arranger,
    parts,
    tempo,
    timeSignature,
    keySignature
  } = request;

  const divisions = 960;  // Standard MusicXML divisions

  // Calculate total measures from the first part (or longest part)
  let totalMeasures = 16;  // Default
  for (const part of parts) {
    const partMeasures = calculateTotalMeasures(
      part.notes,
      timeSignature,
      divisions
    );
    totalMeasures = Math.max(totalMeasures, partMeasures);
  }

  // Build MusicXML
  let musicXml = generateMusicXmlHeader(title, composer || '', arranger || '', tempo);

  // Add part list
  for (let i = 0; i < parts.length; i++) {
    musicXml += generateInstrumentDefinition(
      parts[i].instrumentId,
      parts[i].name,
      i
    );
  }
  musicXml += '  </part-list>\n';

  // Add parts
  for (let i = 0; i < parts.length; i++) {
    const keySig = keyToKeySignature(keySignature.key || 'C', keySignature.mode || 'major');
    musicXml += generatePart(
      i,
      parts[i].name,
      parts[i].notes,
      divisions,
      timeSignature,
      keySig,
      tempo,
      totalMeasures
    );
  }

  musicXml += '</score-partwise>';

  return {
    musicXml,
    metadata: {
      title,
      parts_count: parts.length,
      duration_measures: totalMeasures,
      file_size: musicXml.length
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {NotationRequest, NotationResponse};
export {midiToNoteName, midiToStepOctave};
