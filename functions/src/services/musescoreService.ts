import {MusicalArrangement, ChordEvent} from '../types';

/**
 * MuseScore Service
 * Creates sheet music and MusicXML via music21
 */
export class MuseScoreService {
  private readonly pythonBackendUrl: string;

  constructor() {
    this.pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
  }

  /**
   * Create MusicXML score from arrangement
   */
  async createScore(arrangement: MusicalArrangement): Promise<string> {
    const scoreName = `maestro_${arrangement.style}_${Date.now()}.musicxml`;

    const musicXmlContent = this.generateMusicXml(arrangement);

    // Save to storage
    return await this.saveMusicXml(scoreName, musicXmlContent);
  }

  /**
   * Export score as PDF
   */
  async exportPdf(arrangement: MusicalArrangement): Promise<string> {
    const pdfName = `maestro_${arrangement.style}_${Date.now()}.pdf`;

    // This would call the Python backend to convert MusicXML to PDF
    // using MuseScore or Lilypond

    const pdfPath = `scores/${pdfName}`;

    return pdfPath;
  }

  /**
   * Generate MusicXML content from arrangement
   */
  private generateMusicXml(arrangement: MusicalArrangement): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
    xml += '<score-partwise version="3.1">\n';

    // Part list (instruments)
    xml += '  <part-list>\n';
    arrangement.instruments.forEach((inst, index) => {
      xml += `    <score-part id="P${index + 1}">\n`;
      xml += `      <part-name>${inst.name}</part-name>\n`;
      xml += `      <score-instrument id="I${index + 1}">\n`;
      xml += `        <instrument-name>${inst.name}</instrument-name>\n`;
      xml += `      </score-instrument>\n`;
      xml += `      <midi-instrument id="I${index + 1}">\n`;
      xml += `        <midi-channel>${inst.midiChannel}</midi-channel>\n`;
      xml += `      </midi-instrument>\n`;
      xml += `    </score-part>\n`;
    });
    xml += '  </part-list>\n';

    // Parts (measures and notes)
    arrangement.instruments.forEach((inst, index) => {
      xml += `  <part id="P${index + 1}">\n`;

      // Calculate number of measures from arrangement structure
      const totalBars = this.calculateTotalBars(arrangement);

      for (let bar = 1; bar <= totalBars; bar++) {
        xml += '    <measure number="' + bar + '">\n';

        // Add attributes for first measure
        if (bar === 1) {
          xml += '      <attributes>\n';
          xml += '        <divisions>4</divisions>\n';
          xml += `        <key><fifths>${this.getKeyFifths(arrangement.key)}</fifths></key>\n`;
          xml += `        <time><beats>${arrangement.timeSignature.split('/')[0]}</beats><beat-type>${arrangement.timeSignature.split('/')[1]}</beat-type></time>\n`;
          xml += '        <clef><sign>G</sign><line>2</line></clef>\n';
          xml += '      </attributes>\n';
        }

        // Add tempo marker for first measure
        if (bar === 1) {
          xml += '      <direction>\n';
          xml += '        <direction-type><sound tempo="' + arrangement.tempo + '"/></direction-type>\n';
          xml += '      </direction>\n';
        }

        // Add chord symbols if applicable
        if (inst.role.includes('harmony') || inst.role.includes('piano')) {
          const chordsForBar = this.getChordsForBar(arrangement, bar);
          chordsForBar.forEach((chord) => {
            xml += `      <harmony><root><root-step>${chord.root}</root-step></root><kind>${chord.kind}</kind></harmony>\n`;
          });
        }

        // Add placeholder notes (in production, these would come from melody data)
        xml += '      <note>\n';
        xml += '        <pitch><step>C</step><octave>4</octave></pitch>\n';
        xml += '        <duration>4</duration>\n';
        xml += '        <type>quarter</type>\n';
        xml += '      </note>\n';

        xml += '    </measure>\n';
      }

      xml += '  </part>\n';
    });

    xml += '</score-partwise>';

    return xml;
  }

  /**
   * Calculate total bars from arrangement structure
   */
  private calculateTotalBars(arrangement: MusicalArrangement): number {
    if (arrangement.structure && arrangement.structure.length > 0) {
      const lastSection = arrangement.structure[arrangement.structure.length - 1];
      return Math.ceil(lastSection.endBeat / 4);
    }
    return 32; // Default 32 bars
  }

  /**
   * Get key fifths for MusicXML (e.g., C=0, F=-1, G=1)
   */
  private getKeyFifths(key: string): number {
    const keyMap: Record<string, number> = {
      'Cb': -7, 'Gb': -6, 'Db': -5, 'Ab': -4, 'Eb': -3, 'Bb': -2, 'F': -1,
      'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7
    };
    return keyMap[key] || 0;
  }

  /**
   * Get chords for a specific bar
   */
  private getChordsForBar(arrangement: MusicalArrangement, bar: number): {root: string; kind: string}[] {
    const chords: {root: string; kind: string}[] = [];

    if (arrangement.harmony && arrangement.harmony.chords) {
      const beatStart = (bar - 1) * 4;

      arrangement.harmony.chords.forEach((chordEvent) => {
        if (chordEvent.startBeat >= beatStart && chordEvent.startBeat < beatStart + 4) {
          const root = chordEvent.chord.replace(/[m79#b°augdim]/g, '').substring(0, 1);
          let kind = 'major';

          const chordLower = chordEvent.chord.toLowerCase();
          if (chordLower.includes('m') && !chordLower.includes('maj')) {
            kind = 'minor';
          } else if (chordLower.includes('7')) {
            kind = 'dominant';
          } else if (chordLower.includes('maj7')) {
            kind = 'major-seventh';
          }

          chords.push({root: root.toUpperCase(), kind});
        }
      });
    }

    return chords;
  }

  /**
   * Save MusicXML to storage
   */
  private async saveMusicXml(name: string, content: string): Promise<string> {
    const path = `musicxml/${name}`;
    // Save to storage implementation...
    return path;
  }

  /**
   * Generate conductor's score (all instruments)
   */
  async generateConductorScore(arrangement: MusicalArrangement): Promise<string> {
    return this.createScore(arrangement);
  }

  /**
   * Generate individual parts
   */
  async generatePart(arrangement: MusicalArrangement, instrumentIndex: number): Promise<string> {
    const partName = `${arrangement.instruments[instrumentIndex].name}_part.musicxml`;

    // Create a single-part arrangement
    const singlePartArrangement = {
      ...arrangement,
      instruments: [arrangement.instruments[instrumentIndex]],
    };

    return this.createScore(singlePartArrangement);
  }

  /**
   * Generate guitar tablature
   */
  async generateGuitarTab(arrangement: MusicalArrangement): Promise<string> {
    const tabName = `guitar_tab_${Date.now()}.musicxml`;

    // Generate tab-specific MusicXML
    // In production, this would convert notes to tab positions

    return tabName;
  }

  /**
   * Transpose score
   */
  async transposeScore(arrangement: MusicalArrangement, semitones: number): Promise<MusicalArrangement> {
    // Calculate new key
    const newKey = this.transposeKey(arrangement.key, semitones);

    return {
      ...arrangement,
      key: newKey,
    };
  }

  /**
   * Transpose key by semitones
   */
  private transposeKey(key: string, semitones: number): string {
    const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const currentIndex = keys.indexOf(key);

    if (currentIndex === -1) return key;

    let newIndex = (currentIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return keys[newIndex];
  }
}

// Singleton instance
export const musescoreService = new MuseScoreService();
