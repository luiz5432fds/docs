import {MusicalArrangement, ChordEvent, MelodyNote, SongSection} from '../types';

/**
 * Reaper Service
 * Creates and manages Reaper projects via ReaScript
 */
export class ReaperService {
  private readonly pythonBackendUrl: string;

  constructor() {
    // In production, this would be configured via environment variables
    this.pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
  }

  /**
   * Create a new Reaper project from arrangement
   */
  async createProject(arrangement: MusicalArrangement): Promise<string> {
    const projectName = `maestro_${arrangement.style}_${Date.now()}.rpp`;

    const projectData = {
      projectName,
      tempo: arrangement.tempo,
      timeSignature: arrangement.timeSignature,
      key: arrangement.key,
      tracks: this.createTrackData(arrangement),
    };

    // This would call the Python backend which then executes ReaScript
    // For now, we generate the .rpp file content directly

    const rppContent = this.generateRppContent(projectData);

    // Save to storage and return path
    return await this.saveReaperProject(projectName, rppContent);
  }

  /**
   * Export arrangement as MIDI file
   */
  async exportMidi(arrangement: MusicalArrangement): Promise<string> {
    const midiFileName = `maestro_${arrangement.style}_${Date.now()}.mid`;

    // Generate MIDI content
    const midiContent = this.generateMidiContent(arrangement);

    // Save to storage
    return await this.saveMidiFile(midiFileName, midiContent);
  }

  /**
   * Create track data from arrangement
   */
  private createTrackData(arrangement: MusicalArrangement) {
    return arrangement.instruments.map((inst, index) => ({
      id: index + 1,
      name: inst.name,
      midiChannel: inst.midiChannel,
      role: inst.role,
      volume: this.getDefaultVolume(inst.role),
      pan: 0,
      sends: this.getSendsForInstrument(inst.role),
    }));
  }

  /**
   * Get default volume for instrument role
   */
  private getDefaultVolume(role: string): number {
    const volumes: Record<string, number> = {
      melody: 0,
      harmony: -6,
      harmony_rhythm: -9,
      bass: -3,
      drums: -6,
      percussion: -12,
      pad: -15,
      melody_harmony: -3,
    };
    return volumes[role] || -6;
  }

  /**
   * Get effect sends for instrument
   */
  private getSendsForInstrument(role: string): {target: string; amount: number}[] {
    const sends: Record<string, {target: string; amount: number}[]> = {
      melody: [{target: 'reverb', amount: -12}, {target: 'delay', amount: -15}],
      pad: [{target: 'reverb', amount: -6}],
      drums: [{target: 'reverb', amount: -18}],
      percussion: [{target: 'reverb', amount: -12}],
    };
    return sends[role] || [];
  }

  /**
   * Generate RPP file content
   */
  private generateRppContent(projectData: any): string {
    const {projectName, tempo, timeSignature, key, tracks} = projectData;

    let rpp = `<REAPER_PROJECT>${this.newline()}`;
    rpp += `<PROJECT ${this.escapeAttr(projectName)}>${this.newline()}`;

    // Project settings
    rpp += `  <TEMPO ${tempo.toFixed(2)} 1 4>${this.newline()}`;
    rpp += `  <TIME_SIGNATURE ${timeSignature.split('/')[0]} ${timeSignature.split('/')[1]} 4>${this.newline()}`;
    rpp += `  <PROJECT_KEY ${this.keyToReaper(key)}>${this.newline()}`;

    // Tracks
    tracks.forEach((track: any) => {
      rpp += this.generateTrackSection(track);
    });

    rpp += `</REAPER_PROJECT>`;

    return rpp;
  }

  /**
   * Generate track section in RPP format
   */
  private generateTrackSection(track: any): string {
    let section = `  <TRACK>${this.newline()}`;
    section += `    <NAME ${this.escapeAttr(track.name)}>${this.newline()}`;
    section += `    <TRACK_HEIGHT ${this.getTrackHeight(track.role)}>${this.newline()}`;

    // Volume
    const volValue = this.dbToReaperVol(track.volume);
    section += `    <VOL>${volValue} ${volValue} -1.0 -1>${this.newline()}`;
    section += `    <VOLEXPFUNC linear>${this.newline()}`;

    // Pan
    section += `    <PAN 0.0 0.0 1.0 -1>${this.newline()}`;
    section += `    <PANEXPFUNC linear>${this.newline()}`;

    // MIDI settings
    section += `    <MIDI_OUT>${this.newline()}`;
    section += `      <MIDIOUTCHANNEL ${track.midiChannel}>${this.newline()}`;
    section += `    </MIDI_OUT>${this.newline()}`;

    // FX sends
    if (track.sends && track.sends.length > 0) {
      track.sends.forEach((send: any) => {
        section += `    <AUXRECV>${this.newline()}`;
        section += `      <AUXRECV_VOL ${this.dbToReaperVol(send.amount)} 0 -1 -1>${this.newline()}`;
        section += `    </AUXRECV>${this.newline()}`;
      });
    }

    section += `  </TRACK>${this.newline()}`;

    return section;
  }

  /**
   * Get track height based on role
   */
  private getTrackHeight(role: string): number {
    const heights: Record<string, number> = {
      melody: 80,
      harmony: 70,
      bass: 60,
      drums: 90,
      percussion: 50,
      pad: 60,
    };
    return heights[role] || 60;
  }

  /**
   * Convert dB to Reaper volume value (0-2)
   */
  private dbToReaperVol(db: number): number {
    return Math.pow(10, db / 20);
  }

  /**
   * Convert music key to Reaper key format
   */
  private keyToReaper(key: string): string {
    const keyMap: Record<string, string> = {
      'C': '0', 'Db': '1', 'D': '2', 'Eb': '3', 'E': '4',
      'F': '5', 'F#': '6', 'G': '7', 'Ab': '8', 'A': '9',
      'Bb': '10', 'B': '11',
    };
    return keyMap[key] || '0';
  }

  /**
   * Generate MIDI file content
   */
  private generateMidiContent(arrangement: MusicalArrangement): string {
    // This is a simplified MIDI generation
    // In production, this would use a proper MIDI library

    const midiHeader = this.generateMidiHeader(arrangement);
    const midiTracks = arrangement.instruments.map((inst) =>
      this.generateMidiTrack(inst, arrangement)
    );

    return midiHeader + midiTracks.join('');
  }

  /**
   * Generate MIDI file header
   */
  private generateMidiHeader(arrangement: MusicalArrangement): string {
    // Simplified representation - actual MIDI is binary
    return `MIDIFile: Tempo=${arrangement.tempo}, TimeSig=${arrangement.timeSignature}, Key=${arrangement.key}\n`;
  }

  /**
   * Generate MIDI track for instrument
   */
  private generateMidiTrack(instrument: any, arrangement: MusicalArrangement): string {
    return `Track: ${instrument.name}, Channel: ${instrument.midiChannel}\n`;
  }

  /**
   * Save Reaper project to storage
   */
  private async saveReaperProject(name: string, content: string): Promise<string> {
    // This would save to Firebase Storage
    const path = `reaper_projects/${name}`;
    // Save implementation...
    return path;
  }

  /**
   * Save MIDI file to storage
   */
  private async saveMidiFile(name: string, content: string): Promise<string> {
    const path = `midi_files/${name}`;
    // Save implementation...
    return path;
  }

  private newline(): string {
    return '\n';
  }

  private escapeAttr(str: string): string {
    return str.replace(/"/g, '\\"');
  }
}

// Singleton instance
export const reaperService = new ReaperService();
