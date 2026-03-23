/**
 * SynKrony MuseScore Agent
 *
 * Handles integration with MuseScore 4, the popular open-source
 * music notation software. MuseScore is used for creating,
 * editing, and printing sheet music.
 *
 * This agent creates MusicXML files that can be imported into
 * MuseScore for further editing and printing.
 */

import {NoteData, Score, PartData, MeasureData} from '../types';
import {notationAgent, NotationRequest} from './notation_agent';

// ============================================================================
// MUSESCORE INTEGRATION
// ============================================================================

interface MuseScoreRequest {
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
  keySignature: {key: string; mode: string};
  include_partimento: boolean;
}

interface MuseScoreResponse {
  musicXml: string;
  metadata: {
    title: string;
    parts_count: number;
    duration_measures: number;
    file_size: number;
    notes_count: number;
  };
  export_instructions: string[];
}

/**
 * Main MuseScore agent function
 */
export async function musescoreAgent(request: MuseScoreRequest): Promise<MuseScoreResponse> {
  const {
    title,
    composer,
    arranger,
    parts,
    tempo,
    timeSignature,
    keySignature,
    include_partimento
  } = request;

  // Prepare notation request
  const notationRequest: NotationRequest = {
    title,
    composer,
    arranger,
    parts: parts.map(p => ({
      name: p.name,
      instrumentId: p.instrumentId,
      notes: p.notes
    })),
    tempo,
    timeSignature,
    keySignature: {
      fifths: getKeyFifths(keySignature.key),
      mode: keySignature.mode
    }
  };

  // Generate MusicXML using notation agent
  const notationResponse = await notationAgent(notationRequest);

  // Add Partimento bass line as a separate part if requested
  let finalMusicXml = notationResponse.musicXml;
  let notes_count = parts.reduce((sum, p) => sum + p.notes.length, 0);

  if (include_partimento && parts.length > 0) {
    const partimentoPart = generatePartimentoPart(parts[0].notes, keySignature);
    // Insert before closing tag
    finalMusicXml = finalMusicXml.replace('</score-partwise>', partimentoPart + '</score-partwise>');
    notes_count += parts[0].notes.length;
  }

  return {
    musicXml: finalMusicXml,
    metadata: {
      title,
      parts_count: parts.length + (include_partimento ? 1 : 0),
      duration_measures: notationResponse.metadata.duration_measures,
      file_size: finalMusicXml.length,
      notes_count
    },
    export_instructions: generateExportInstructions()
  };
}

/**
 * Get key fifths from note name
 */
function getKeyFifths(key: string): number {
  const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];
  const index = circleOfFifths.findIndex(k => key.includes(k));

  let fifths = index >= 0 && index < 7 ? index : index - 7;
  if (fifths < -6) fifths = 0;

  return fifths;
}

/**
 * Generate Partimento bass part
 */
function generatePartimentoPart(notes: NoteData[], keySignature: {key: string; mode: string}): string {
  const partNumber = 'P1';
  const partId = 'partimento';

  // Find bass notes (simplified - would use actual partimento notes)
  const bassNotes = notes.filter(n => n.pitch < 60);

  return `
  <part id="${partNumber}">
    <measure number="1">
      <attributes>
        <divisions>960</divisions>
        <key>
          <fifths>${getKeyFifths(keySignature.key)}</fifths>
          <mode>${keySignature.mode}</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <staves>1</staves>
      </attributes>
      <direction>
        <direction-type>
          <words font-weight="bold">Partimento Bass</words>
        </direction-type>
      </direction>
    </measure>
  </part>`;
}

/**
 * Generate export instructions for MuseScore
 */
function generateExportInstructions(): string[] {
  return [
    '1. Save the MusicXML content to a file with .musicxml extension',
    '2. Open MuseScore 4',
    '3. File > Open and select the saved file',
    '4. Review and edit the notation as needed',
    '5. For audio export: File > Export > Audio (WAV, MP3, FLAC)',
    '6. For PDF export: File > Export > PDF',
    '7. For MIDI export: File > Export > MIDI',
    '8. For further editing: Edit parts in MuseScore and save as .mscz'
  ];
}

/**
 * Generate MuseScore plugin script for Partimento checking
 */
export function generateMuseScorePlugin(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<museScore version="4.0">
  <Plugin>
    <name>SynKrony Partimento Checker</name>
    <version>1.0</version>
    <description>Checks Partimento rules and counterpoint compliance</description>
    <path>SynKrony/PartimentoChecker.qml</path>
  </Plugin>
</museScore>

// SynKrony/PartimentoChecker.qml
import QtQuick 2.0
import MuseScore 3.0

MuseScore {
  menuPath: "Plugins.SynKrony.Partimento Checker"

  description: "Check Partimento rules"
  version: "1.0"

  function checkCounterpoint(staff1, staff2) {
    // Check for parallel fifths
    // Check for parallel octaves
    // Check for proper voice leading
  }

  function applyRuleOfOctave(bassNote) {
    // Apply Rule of Octave harmonization
    var degree = bassNote.pitch % 7;
    var voicings = [
      [0, 4, 7],    // I
      [2, 5, 9],    // II
      [4, 7, 11],   // III
      [5, 9, 12],   // IV
      [7, 11, 14],  // V
      [9, 12, 16],  // VI
      [11, 14, 17]  // VII
    ];
    return voicings[degree];
  }

  onRun: {
    var score = curScore;
    var cursor = score.newCursor();

    cursor.rewind(Cursor.SCORE_START);

    while (!cursor.eos()) {
      var chord = cursor.element;
      if (chord && chord.type == Element.CHORD) {
        // Analyze chord
      }
      cursor.next();
    }

    Qt.quit();
  }
}`;
}

/**
 * Get recommended instruments for MuseScore notation
 */
export function getMuseScoreInstruments(genre: string): Array<{id: string; name: string}> {
  const instruments = [
    {id: 'inst_piano', name: 'Piano'},
    {id: 'inst_flute', name: 'Flute'},
    {id: 'inst_clarinet', name: 'Clarinet in Bb'},
    {id: 'inst_saxophone', name: 'Alto Saxophone'},
    {id: 'inst_trumpet', name: 'Trumpet in C'},
    {id: 'inst_trombone', name: 'Trombone'},
    {id: 'inst_violin', name: 'Violin'},
    {id: 'inst_viola', name: 'Viola'},
    {id: 'inst_cello', name: 'Violoncello'},
    {id: 'inst_double_bass', name: 'Contrabass'},
  ];

  if (genre === 'brega') {
    return [
      {id: 'inst_piano', name: 'Piano'},
      {id: 'inst_saxophone', name: 'Alto Saxophone'},
      {id: 'inst_trumpet', name: 'Trumpet in C'},
      {id: 'inst_violin', name: 'Violin'},
      {id: 'inst_cello', name: 'Violoncello'},
    ];
  } else if (genre === 'forro') {
    return [
      {id: 'inst_flute', name: 'Flute (Pífano)'},
      {id: 'inst_sanfona', name: 'Accordion (Sanfona)'},
      {id: 'inst_zabumba', name: 'Percussion (Zabumba)'},
      {id: 'inst_triangle', name: 'Percussion (Triângulo)'},
    ];
  } else if (genre === 'tecnobrega') {
    return [
      {id: 'inst_xps10_leads', name: 'Synth Lead'},
      {id: 'inst_xps10_pads', name: 'Synth Pad'},
      {id: 'inst_bass_drum', name: 'Bass Drum'},
      {id: 'inst_snare_drum', name: 'Snare Drum'},
    ];
  }

  return instruments;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {MuseScoreRequest, MuseScoreResponse};
