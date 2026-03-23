import {knowledgeAgent} from './agents/knowledge_agent';
import {mixAgent} from './agents/mix_agent';
import {performanceAgent} from './agents/performance_agent';
import {styleAgent} from './agents/style_agent';
import {synthAgent} from './agents/synth_agent';
import {composerAgent, ComposerRequest} from './agents/composer_agent';
import {arrangerAgent, ArrangerRequest} from './agents/arranger_agent';
import {notationAgent, NotationRequest} from './agents/notation_agent';
import {theoristAgent, TheoristRequest} from './agents/theorist_agent';
import {regionalAgent, RegionalRequest} from './agents/regional_agent';
import {reaperAgent, ReaperRequest} from './agents/reaper_agent';
import {musescoreAgent, MuseScoreRequest} from './agents/musescore_agent';

export async function runAgentsOrchestrator(uid: string, input: any) {
  const [synth, mix, performance, style, knowledge] = await Promise.all([
    synthAgent(input),
    mixAgent(),
    performanceAgent(),
    styleAgent(input),
    knowledgeAgent(uid, String(input?.query ?? input?.style ?? 'síntese'))
  ]);

  return {
    agents: {synth, mix, performance, style, knowledge},
    merged: {
      ...synth,
      mixHints: mix.mixHints,
      performanceTips: performance.performanceTips,
      styleHints: style.styleHints,
      knowledgeHints: knowledge.knowledgeHints
    }
  };
}

// ============================================================================
// SYNKRONY ORCHESTRATOR
// ============================================================================

export interface SynKronyOrchestratorInput {
  // Project configuration
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  timeSignature: {numerator: number; denominator: number};
  length_bars: number;

  // Genre and style
  genre: 'brega' | 'forro' | 'tecnobrega' | 'classical' | 'pop';
  subgenre?: string;

  // Parts configuration
  include_composition: boolean;
  include_arrangement: boolean;
  include_notation: boolean;
  include_analysis: boolean;
  include_regional: boolean;
  include_reaper: boolean;
  include_musescore: boolean;

  // Optional: Existing notes to arrange/analyze
  notes?: any[];
  tracks?: any[];
}

export interface SynKronyOrchestratorOutput {
  composition?: any;
  arrangement?: any;
  notation?: any;
  analysis?: any;
  regional?: any;
  reaper?: any;
  musescore?: any;
  summary: string;
}

/**
 * Main SynKrony orchestrator
 * Runs all agents based on configuration and returns complete results
 */
export async function runSynKronyOrchestrator(
  uid: string,
  input: SynKronyOrchestratorInput
): Promise<SynKronyOrchestratorOutput> {
  const {
    key,
    mode,
    tempo,
    timeSignature,
    length_bars,
    genre,
    subgenre,
    include_composition,
    include_arrangement,
    include_notation,
    include_analysis,
    include_regional,
    include_reaper,
    include_musescore,
    notes: existingNotes,
    tracks: existingTracks
  } = input;

  const output: SynKronyOrchestratorOutput = {
    summary: `SynKrony Orchestration: ${key} ${mode}, ${tempo} BPM, ${genre}`
  };

  // Step 1: Composition (Partimento)
  let compositionNotes = existingNotes;
  if (include_composition && !existingNotes) {
    const composerRequest: ComposerRequest = {
      key: {key, mode},
      mode,
      length_bars,
      tempo,
      genre,
      style: subgenre
    };

    const composition = await composerAgent(composerRequest);
    output.composition = composition;
    compositionNotes = composition.notes;
  }

  // Step 2: Arrangement (Counterpoint)
  let arrangementResult;
  if (include_arrangement && compositionNotes && compositionNotes.length > 0) {
    const arrangerRequest: ArrangerRequest = {
      bass_line: compositionNotes.filter(n => n.pitch < 60),
      key,
      mode,
      num_voices: 3,
      species: 1,
      genre
    };

    arrangementResult = await arrangerAgent(arrangerRequest);
    output.arrangement = arrangementResult;
  }

  // Step 3: Regional Adaptation
  let regionalResult;
  let adaptedNotes = compositionNotes;
  if (include_regional && compositionNotes && compositionNotes.length > 0) {
    const regionalRequest: RegionalRequest = {
      notes: compositionNotes,
      genre,
      subgenre,
      key,
      mode,
      tempo
    };

    regionalResult = await regionalAgent(regionalRequest);
    output.regional = regionalResult;
    adaptedNotes = regionalResult.adapted_notes;
  }

  // Step 4: Notation (MusicXML)
  if (include_notation && adaptedNotes && adaptedNotes.length > 0) {
    const notationRequest: NotationRequest = {
      title: `${genre.charAt(0).toUpperCase() + genre.slice(1)} in ${key}`,
      composer: 'SynKrony AI',
      arranger: genre === 'brega' || genre === 'forro' ? 'Regional Adaptation' : undefined,
      parts: [
        {
          name: genre === 'forro' ? 'Sanfona/Pífano' : genre === 'brega' ? 'Sax/Piano' : 'Piano',
          instrumentId: genre === 'forro' ? 'inst_sanfona' : 'inst_piano',
          notes: adaptedNotes.filter(n => n.pitch >= 60)
        },
        {
          name: 'Baixo',
          instrumentId: 'inst_double_bass',
          notes: adaptedNotes.filter(n => n.pitch < 60)
        }
      ],
      tempo,
      timeSignature,
      keySignature: {key, mode}
    };

    output.notation = await notationAgent(notationRequest);
  }

  // Step 5: Analysis (Music Theory)
  if (include_analysis && adaptedNotes && adaptedNotes.length > 0) {
    const theoristRequest: TheoristRequest = {
      notes: adaptedNotes,
      key,
      mode,
      genre,
      analysis_type: 'full'
    };

    output.analysis = await theoristAgent(theoristRequest);
  }

  // Step 6: Reaper Integration
  if (include_reaper && adaptedNotes && adaptedNotes.length > 0) {
    const project = {
      id: `proj_${Date.now()}`,
      name: `${genre} in ${key}`,
      genre,
      bpm: tempo,
      timeSignature,
      keySignature: {key, mode},
      hardware_setup: {
        mm8_connected: false,
        xps10_connected: true,
        midi_channels: {mm8: 1, xps10: 2}
      },
      reaper_synced: true,
      musescore_synced: false,
      partimento_enabled: true,
      partimento_schema: `rule_of_octave_${mode}`,
      tags: [genre, 'synkrony'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tracks = existingTracks || [{
      id: 'track_1',
      name: genre === 'forro' ? 'Sanfona' : genre === 'brega' ? 'Teclado' : 'Piano',
      instrument: genre === 'forro' ? 'Sanfona' : 'Piano',
      instrumentId: genre === 'forro' ? 'inst_sanfona' : 'inst_piano',
      hardware_target: 'xps10' as const,
      midiChannel: 0,
      notes: adaptedNotes,
      generated_by: 'partimento' as const,
      dynamics: [],
      articulations: [],
      volume: 100,
      pan: 50,
      sends: []
    }];

    const reaperRequest: ReaperRequest = {
      project,
      tracks,
      notes: adaptedNotes
    };

    output.reaper = await reaperAgent(reaperRequest);
  }

  // Step 7: MuseScore Integration
  if (include_musescore && adaptedNotes && adaptedNotes.length > 0) {
    const musescoreRequest: MuseScoreRequest = {
      title: `${genre.charAt(0).toUpperCase() + genre.slice(1)} in ${key}`,
      composer: 'SynKrony AI',
      arranger: genre === 'brega' || genre === 'forro' ? 'Regional Adaptation' : undefined,
      parts: [
        {
          name: genre === 'forro' ? 'Sanfona/Pífano' : genre === 'brega' ? 'Sax/Piano' : 'Piano',
          instrumentId: genre === 'forro' ? 'inst_sanfona' : 'inst_piano',
          notes: adaptedNotes.filter(n => n.pitch >= 60)
        }
      ],
      tempo,
      timeSignature,
      keySignature: {key, mode},
      include_partimento: true
    };

    output.musescore = await musescoreAgent(musescoreRequest);
  }

  return output;
}

// Export types
export type {SynKronyOrchestratorInput, SynKronyOrchestratorOutput};
