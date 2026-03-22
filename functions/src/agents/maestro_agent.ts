import * as admin from 'firebase-admin';
import {
  MaestroProject,
  MaestroIntent,
  AudioSource,
  MusicalAnalysis,
  MusicalArrangement,
  ArrangementStyle,
  ExportResult,
  MaestroProgress,
  ProgressLog,
} from '../types';
import {audioDownloaderService} from '../services/audioDownloader';
import {harmonyAgent} from './harmony_agent';
import {melodyAgent} from './melody_agent';
import {arrangementAgent} from './arrangement_agent';
import {reaperService} from '../services/reaperService';
import {musescoreService} from '../services/musescoreService';

const db = admin.firestore();

/**
 * Maestro Agent - Main Orchestrator
 * Autonomous musical production assistant that coordinates all sub-agents
 */
export class MaestroAgent {
  private projectId: string;
  private userId: string;
  private prompt: string;
  private intent: MaestroIntent;
  private audioSource?: AudioSource;

  constructor(userId: string, prompt: string, audioSource?: AudioSource) {
    this.projectId = `maestro_${Date.now()}`;
    this.userId = userId;
    this.prompt = prompt;
    this.audioSource = audioSource;
    this.intent = this.interpretIntent(prompt);
  }

  /**
   * Main execution method - runs the entire workflow autonomously
   */
  async execute(): Promise<MaestroProject> {
    // Initialize project in Firestore
    const project = await this.initializeProject();

    try {
      // Phase 1: Download audio if provided
      if (this.audioSource) {
        await this.updateProgress('downloading', 'Baixando áudio...', 5);
        const audioResult = await audioDownloaderService.download(this.audioSource, this.userId);
        await this.log('info', `Áudio baixado: ${audioResult.filename}`);
      }

      // Phase 2: Analyze audio (if source provided)
      let analysis: MusicalAnalysis | undefined;
      if (this.audioSource) {
        await this.updateProgress('analyzing', 'Analisando áudio musicalmente...', 20);
        analysis = await this.analyzeAudio();
        await this.log('success', `Análise completa: ${analysis.bpm} BPM, tom ${analysis.key}`);
      }

      // Phase 3: Execute workflow based on intent
      let arrangement: MusicalArrangement | undefined;

      switch (this.intent) {
        case 'composicao':
          await this.updateProgress('composing', 'Compondo do zero...', 30);
          arrangement = await this.compose(analysis);
          break;

        case 'arranjo':
          await this.updateProgress('arranging', 'Criando arranjo...', 30);
          arrangement = await this.arrange(analysis);
          break;

        case 'producao':
          await this.updateProgress('producing', 'Produzindo faixa...', 30);
          arrangement = await this.produce(analysis);
          break;

        case 'analise':
          await this.updateProgress('analyzing', 'Analisando música...', 100);
          return {...project, status: 'completed', analysis};

        case 'transcricao':
          await this.updateProgress('transcribing', 'Transcrevendo partitura...', 30);
          arrangement = await this.transcribe(analysis);
          break;
      }

      // Phase 4: Generate exports
      await this.updateProgress('exporting', 'Exportando projeto...', 80);
      const exports = await this.generateExports(arrangement);
      await this.log('success', 'Exportação completa!');

      // Complete project
      await this.updateProgress('completed', 'Projeto completo!', 100);

      return {
        ...project,
        status: 'completed',
        analysis,
        arrangement,
        exports,
      };

    } catch (error) {
      await this.log('error', `Erro: ${(error as Error).message}`);
      await this.updateProgress('error', `Erro: ${(error as Error).message}`, 0);
      return {...project, status: 'error'};
    }
  }

  /**
   * Interpret user prompt to determine intent
   */
  private interpretIntent(prompt: string): MaestroIntent {
    const lowerPrompt = prompt.toLowerCase();

    // Composition keywords
    if (/compor|criar do zero|nova música|escrever/.test(lowerPrompt)) {
      return 'composicao';
    }

    // Arrangement keywords
    if (/arranj|harmoniza|instrumenta|versão/.test(lowerPrompt)) {
      return 'arranjo';
    }

    // Production keywords
    if (/produzir|mix|master|gravar|sonoriza/.test(lowerPrompt)) {
      return 'producao';
    }

    // Transcription keywords
    if (/transcri|partitura|escrever música|cifras/.test(lowerPrompt)) {
      return 'transcricao';
    }

    // Analysis keywords
    if (/analis|o que é|como é|informações/.test(lowerPrompt)) {
      return 'analise';
    }

    // Default to arrangement
    return 'arranjo';
  }

  /**
   * Extract style from prompt
   */
  private extractStyle(prompt: string): ArrangementStyle {
    const lowerPrompt = prompt.toLowerCase();

    const styleMap: Record<string, ArrangementStyle> = {
      'bossa': 'bossa_nova',
      'bossa nova': 'bossa_nova',
      'jazz': 'jazz',
      'mpb': 'mpb',
      'pop': 'pop',
      'rock': 'rock',
      'samba': 'samba',
      'forró': 'forro',
      'forro': 'forro',
      'clássico': 'classical',
      'classico': 'classical',
      'eletrônico': 'electronic',
      'eletronico': 'electronic',
      'funk': 'funk',
    };

    for (const [keyword, style] of Object.entries(styleMap)) {
      if (lowerPrompt.includes(keyword)) {
        return style;
      }
    }

    return 'pop'; // Default
  }

  /**
   * Analyze audio using Python backend
   */
  private async analyzeAudio(): Promise<MusicalAnalysis> {
    // This would call the Python backend via HTTP
    // For now, return a placeholder analysis
    return {
      bpm: 120,
      key: 'C',
      timeSignature: '4/4',
      chords: {
        chords: [],
        key: 'C',
        scaleType: 'major',
      },
      melody: {
        notes: [],
        range: {lowest: 60, highest: 72},
        tessitura: 'mid',
      },
      sections: [],
      instruments: [],
      duration: 180,
    };
  }

  /**
   * Compose new music from scratch
   */
  private async compose(analysis?: MusicalAnalysis): Promise<MusicalArrangement> {
    const style = this.extractStyle(this.prompt);
    const key = analysis?.key || 'C';
    const tempo = analysis?.bpm || 120;

    await this.log('info', `Compondo em estilo ${style}...`);

    // Generate harmony
    const harmonyResult = await harmonyAgent(undefined, {
      style,
      key,
      scaleType: 'major',
      bars: 32,
      timeSignature: '4/4',
    });
    await this.log('success', 'Harmonia gerada');

    // Generate melody
    const melodyResult = await melodyAgent(undefined, {
      style,
      key,
      scaleType: 'major',
      bars: 32,
    });
    await this.log('success', 'Melodia gerada');

    // Create arrangement
    const arrangementResult = await arrangementAgent(undefined, {
      style,
      key,
      tempo,
      timeSignature: '4/4',
    });
    await this.log('success', 'Arranjo criado');

    return arrangementResult.arrangement!;
  }

  /**
   * Create arrangement from existing audio
   */
  private async arrange(analysis?: MusicalAnalysis): Promise<MusicalArrangement> {
    const style = this.extractStyle(this.prompt);

    if (!analysis) {
      throw new Error('Análise de áudio necessária para criar arranjo');
    }

    await this.log('info', `Criando arranjo ${style}...`);

    // Analyze and enhance harmony
    const harmonyResult = await harmonyAgent(analysis);
    await this.log('info', `Harmonia analisada: ${harmonyResult.suggestions.join(' ')}`);

    // Analyze melody
    const melodyResult = await melodyAgent(analysis);
    await this.log('info', `Melodia analisada: ${melodyResult.suggestions.join(' ')}`);

    // Create arrangement based on analysis
    const arrangementResult = await arrangementAgent(analysis, {
      style,
      key: analysis.key,
      tempo: analysis.bpm,
      timeSignature: analysis.timeSignature,
    });
    await this.log('success', `Arranjo criado com ${arrangementResult.arrangement?.instruments.length} instrumentos`);

    return arrangementResult.arrangement!;
  }

  /**
   * Produce existing track (add effects, mix)
   */
  private async produce(analysis?: MusicalAnalysis): Promise<MusicalArrangement> {
    await this.log('info', 'Produzindo faixa...');

    // For production, we focus on the existing arrangement
    // and add production elements
    const style = this.extractStyle(this.prompt);

    const arrangementResult = await arrangementAgent(analysis, {
      style,
      key: analysis?.key || 'C',
      tempo: analysis?.bpm || 120,
      timeSignature: analysis?.timeSignature || '4/4',
    });

    await this.log('success', 'Produção configurada');

    return arrangementResult.arrangement!;
  }

  /**
   * Transcribe audio to sheet music
   */
  private async transcribe(analysis?: MusicalAnalysis): Promise<MusicalArrangement> {
    await this.log('info', 'Transcrevendo para partitura...');

    const style = this.extractStyle(this.prompt);

    const arrangementResult = await arrangementAgent(analysis, {
      style,
      key: analysis?.key || 'C',
      tempo: analysis?.bpm || 120,
      timeSignature: analysis?.timeSignature || '4/4',
    });

    await this.log('success', 'Transcrição completa');

    return arrangementResult.arrangement!;
  }

  /**
   * Generate all export formats
   */
  private async generateExports(arrangement?: MusicalArrangement): Promise<ExportResult> {
    const results: ExportResult = {};

    if (!arrangement) {
      await this.log('warning', 'Nenhum arranjo para exportar');
      return results;
    }

    // Export Reaper project
    try {
      await this.log('info', 'Criando projeto Reaper...');
      results.reaperProject = await reaperService.createProject(arrangement);
      await this.log('success', 'Projeto Reaper criado');
    } catch (error) {
      await this.log('error', `Erro ao criar projeto Reaper: ${(error as Error).message}`);
    }

    // Export MIDI file
    try {
      await this.log('info', 'Exportando MIDI...');
      results.midiFile = await reaperService.exportMidi(arrangement);
      await this.log('success', 'MIDI exportado');
    } catch (error) {
      await this.log('error', `Erro ao exportar MIDI: ${(error as Error).message}`);
    }

    // Export MusicXML/PDF
    try {
      await this.log('info', 'Gerando partitura...');
      results.musicXml = await musescoreService.createScore(arrangement);
      results.pdfScore = await musescoreService.exportPdf(arrangement);
      await this.log('success', 'Partitura gerada');
    } catch (error) {
      await this.log('error', `Erro ao gerar partitura: ${(error as Error).message}`);
    }

    return results;
  }

  /**
   * Initialize project in Firestore
   */
  private async initializeProject(): Promise<MaestroProject> {
    const progress: MaestroProgress = {
      currentStep: 'initializing',
      completedSteps: [],
      percentage: 0,
      message: 'Iniciando projeto...',
      logs: [],
    };

    const project: MaestroProject = {
      id: this.projectId,
      userId: this.userId,
      status: 'processing',
      intent: this.intent,
      audioSource: this.audioSource,
      prompt: this.prompt,
      progress,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to Firestore
    await db
      .collection('users')
      .doc(this.userId)
      .collection('maestroProjects')
      .doc(this.projectId)
      .set(project);

    return project;
  }

  /**
   * Update project progress
   */
  private async updateProgress(
    status: MaestroProject['status'],
    message: string,
    percentage: number
  ): Promise<void> {
    const update: Partial<MaestroProject> = {
      status,
      progress: {
        currentStep: status,
        completedSteps: [...(await this.getCompletedSteps()), status],
        percentage,
        message,
        logs: [],
      },
      updatedAt: Date.now(),
    };

    await db
      .collection('users')
      .doc(this.userId)
      .collection('maestroProjects')
      .doc(this.projectId)
      .update(update);
  }

  /**
   * Add log entry
   */
  private async log(level: ProgressLog['level'], message: string): Promise<void> {
    const logEntry: ProgressLog = {
      timestamp: Date.now(),
      step: this.progress?.currentStep || 'unknown',
      message,
      level,
    };

    await db
      .collection('users')
      .doc(this.userId)
      .collection('maestroProjects')
      .doc(this.projectId)
      .update({
        'progress.logs': admin.firestore.FieldValue.arrayUnion(logEntry),
      });
  }

  /**
   * Get completed steps from current progress
   */
  private async getCompletedSteps(): Promise<string[]> {
    const doc = await db
      .collection('users')
      .doc(this.userId)
      .collection('maestroProjects')
      .doc(this.projectId)
      .get();

    return doc.get('progress.completedSteps') || [];
  }

  private get progress(): MaestroProgress | undefined {
    return undefined; // This would be cached in a real implementation
  }
}

/**
 * Convenience function to run Maestro agent
 */
export async function runMaestroAgent(
  userId: string,
  prompt: string,
  audioSource?: AudioSource
): Promise<MaestroProject> {
  const agent = new MaestroAgent(userId, prompt, audioSource);
  return agent.execute();
}
