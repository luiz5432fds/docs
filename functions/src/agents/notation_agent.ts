import {NoteData, Score} from '../types';

interface NotationInput {
  notes: NoteData[];
  title: string;
  composer?: string;
  tempo: number;
  timeSignature: {numerator: number; denominator: number};
  keySignature: string;
  project?: string;
}

interface NotationOutput {
  musicXml: string;
  metadata: {
    title: string;
    duration: number;
    noteCount: number;
    parts: number;
  };
  exportUrls?: {
    musicXmlUrl?: string;
    pdfUrl?: string;
    midiUrl?: string;
  };
}

/**
 * Notation Agent - Generates MusicXML for notation software
 * Compatible with MuseScore 4 and other MusicXML readers
 */
export async function notationAgent(input: NotationInput): Promise<NotationOutput> {
  const {
    notes,
    title,
    composer = 'SynKrony AI',
    tempo,
    timeSignature,
    keySignature,
    project
  } = input;

  // Group notes by part/instrument
  const parts = groupNotesByPart(notes);

  // Generate MusicXML
  const musicXml = generateMusicXML({
    title,
    composer,
    tempo,
    timeSignature,
    keySignature,
    parts
  });

  // Calculate metadata
  const duration = calculateDuration(notes, tempo);
  const noteCount = notes.length;

  return {
    musicXml,
    metadata: {
      title,
      duration,
      noteCount,
      parts: parts.length
    }
  };
}

/**
 * Group notes by part based on pitch range
 */
function groupNotesByPart(notes: NoteData[]): Array<{
  name: string;
  instrument: string;
  notes: NoteData[];
}> {
  const parts: Map<string, NoteData[]> = new Map();

  for (const note of notes) {
    let partName: string;

    // Determine part based on pitch range
    if (note.pitch >= 60) {
      partName = 'Melody';
    } else if (note.pitch >= 48) {
      partName = 'Harmony 1';
    } else if (note.pitch >= 36) {
      partName = 'Harmony 2';
    } else {
      partName = 'Bass';
    }

    if (!parts.has(partName)) {
      parts.set(partName, []);
    }
    parts.get(partName)!.push({...note});
  }

  return Array.from(parts.entries()).map(([name, notes]) => ({
    name,
    instrument: getInstrumentForPart(name),
    notes
  }));
}

/**
 * Get MIDI program for part
 */
function getInstrumentForPart(partName: string): string {
  const instrumentMap: Record<string, string> = {
    'Melody': 'Acoustic Grand Piano',
    'Harmony 1': 'Acoustic Grand Piano',
    'Harmony 2': 'Acoustic Grand Piano',
    'Bass': 'Acoustic Bass'
  };

  return instrumentMap[partName] || 'Acoustic Grand Piano';
}

/**
 * Generate MusicXML document
 */
function generateMusicXML(params: {
  title: string;
  composer: string;
  tempo: number;
  timeSignature: {numerator: number; denominator: number};
  keySignature: string;
  parts: Array<{
    name: string;
    instrument: string;
    notes: NoteData[];
  }>;
}): string {
  const {title, composer, tempo, timeSignature, keySignature, parts} = params;

  // Parse key signature (e.g., "C Major", "A Minor")
  const [key, mode] = keySignature.split(' ');
  const fifths = getKeyFifths(key || 'C', mode || 'major');

  let partsXml = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const measures = generateMeasures(part.notes, timeSignature);

    partsXml += `
    <part id="P${i + 1}">
      <measure number="1">
        <attributes>
          <divisions>240</divisions>
          <key>
            <fifths>${fifths}</fifths>
            <mode>${mode.toLowerCase()}</mode>
          </key>
          <time>
            <beats>${timeSignature.numerator}</beats>
            <beat-type>${timeSignature.denominator}</beat-type>
          </time>
          <clef>
            <sign>${part.name === 'Bass' ? 'F' : 'G'}</sign>
            <line>${part.name === 'Bass' ? '4' : '2'}</line>
          </clef>
        </attributes>
        ${i === 0 ? `<sound tempo="${tempo}"/>` : ''}
        ${measures}
      </measure>
    </part>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${title}</work-title>
  </work>
  <identification>
    <creator type="composer">${composer}</creator>
    <encoding>
      <software>SynKrony AI Notation Agent</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    ${parts.map((part, i) => `
    <score-part id="P${i + 1}">
      <part-name>${part.name}</part-name>
      <score-instrument id="I${i + 1}">
        <instrument-name>${part.instrument}</instrument-name>
      </score-instrument>
      <midi-instrument id="I${i + 1}">
        <midi-channel>${i}</midi-channel>
        <midi-program>${getMidiProgram(part.instrument)}</midi-program>
      </midi-instrument>
    </score-part>`).join('')}
  </part-list>
  ${partsXml}
</score-partwise>`;
}

/**
 * Generate measures from notes
 */
function generateMeasures(notes: NoteData[], timeSig: {numerator: number; denominator: number}): string {
  if (notes.length === 0) {
    return '<note><rest/><duration>960</duration></note>';
  }

  const ticksPerBeat = 240;
  const ticksPerMeasure = ticksPerBeat * timeSig.numerator;

  let measuresXml = '';
  let currentMeasure = 1;
  let currentTick = 0;

  // Sort notes by position
  const sortedNotes = [...notes].sort((a, b) => a.position - b.position);

  for (const note of sortedNotes) {
    // Add measure breaks as needed
    while (note.position >= currentMeasure * ticksPerMeasure) {
      measuresXml += '</measure>\n      <measure number="' + (++currentMeasure) + '">';
    }

    measuresXml += generateNoteXml(note, ticksPerBeat);
  }

  return measuresXml;
}

/**
 * Generate MusicXML for a single note
 */
function generateNoteXml(note: NoteData, divisions: number): string {
  const pitch = note.pitch;
  const octave = Math.floor(pitch / 12) - 1;
  const stepNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const step = stepNames[pitch % 12].replace('#', '');

  const duration = Math.round(note.duration / divisions * 240);

  return `
        <note>
          ${note.tieStart ? '<tie type="start"/>' : ''}
          ${note.tieEnd ? '<tie type="stop"/>' : ''}
          <pitch>
            <step>${step}</step>
            <octave>${octave}</octave>
          </pitch>
          <duration>${duration}</duration>
          <velocity>${note.velocity}</velocity>
          ${note.articulations?.includes('staccato') ? '<articulations><staccato/></articulations>' : ''}
        </note>`;
}

/**
 * Get key fifths for MusicXML
 */
function getKeyFifths(key: string, mode: string): number {
  const majorKeys: Record<string, number> = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
    'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6, 'Cb': -7
  };

  const minorKeys: Record<string, number> = {
    'A': 0, 'E': 1, 'B': 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, 'A#': 7,
    'D': -1, 'G': -2, 'C': -3, 'F': -4, 'Bb': -5, 'Eb': -6, 'Ab': -7
  };

  if (mode.toLowerCase() === 'minor') {
    return minorKeys[key] || 0;
  }
  return majorKeys[key] || 0;
}

/**
 * Get MIDI program number for instrument
 */
function getMidiProgram(instrument: string): number {
  const programMap: Record<string, number> = {
    'Acoustic Grand Piano': 0,
    'Acoustic Bass': 32,
    'Violin': 40,
    'Flute': 73,
    'Trumpet': 56,
    'Saxophone': 65
  };

  return programMap[instrument] || 0;
}

/**
 * Calculate duration in seconds
 */
function calculateDuration(notes: NoteData[], tempo: number): number {
  if (notes.length === 0) return 0;

  const lastNote = notes.reduce((a, b) => a.position > b.position ? a : b);
  const ticksPerBeat = 240;
  const secondsPerBeat = 60 / tempo;

  return Math.round((lastNote.position + lastNote.duration) / ticksPerBeat * secondsPerBeat);
}

/**
 * Export score to Firestore
 */
export async function exportScoreToFirestore(
  uid: string,
  scoreData: Omit<Score, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = (await import('firebase-admin')).admin.firestore();

  const scoreRef = await db.collection('users').doc(uid).collection('scores').add({
    ...scoreData,
    createdAt: db.FieldValue.serverTimestamp(),
    updatedAt: db.FieldValue.serverTimestamp()
  });

  return scoreRef.id;
}
