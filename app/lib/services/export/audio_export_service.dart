import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter_sound/flutter_sound.dart';

/// Formato de áudio para exportação
enum AudioFormat {
  wav16('WAV 16-bit', 'wav', 16, 44100),
  wav24('WAV 24-bit', 'wav', 24, 44100),
  wav32('WAV 32-bit float', 'wav', 32, 48000),
  mp3128('MP3 128 kbps', 'mp3', 16, 44100),
  mp3192('MP3 192 kbps', 'mp3', 16, 44100),
  mp3320('MP3 320 kbps', 'mp3', 16, 44100);

  final String displayName;
  final String extension;
  final int bitDepth;
  final int sampleRate;

  const AudioFormat(
    this.displayName,
    this.extension,
    this.bitDepth,
    this.sampleRate,
  );
}

/// Duração da exportação de áudio
enum AudioExportDuration {
  preview5('Preview 5s', 5),
  preview10('Preview 10s', 10),
  full('Completo', null);

  final String displayName;
  final int? seconds;

  const AudioExportDuration(this.displayName, this.seconds);
}

/// Resultado da exportação de áudio
class AudioExportResult {
  final Uint8List data;
  final String fileName;
  final int fileSize;
  final AudioFormat format;
  final Duration actualDuration;
  final String? filePath;

  AudioExportResult({
    required this.data,
    required this.fileName,
    required this.fileSize,
    required this.format,
    required this.actualDuration,
    this.filePath,
  });

  /// Tamanho do arquivo em formato legível
  String get fileSizeReadable {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}

/// Nota simples para renderização de áudio
class RenderNote {
  final int pitch; // MIDI note number
  final double velocity; // 0.0 - 1.0
  final Duration startTime;
  final Duration duration;

  RenderNote({
    required this.pitch,
    required this.velocity,
    required this.startTime,
    required this.duration,
  });

  /// Calcula a frequência em Hz
  double get frequency => 440.0 * pow(2, (pitch - 69) / 12);

  static double pow(double base, int exponent) {
    return exponent < 0 ? 1 / _pow(base, -exponent) : _pow(base, exponent);
  }

  static double _pow(double base, int exponent) {
    double result = 1.0;
    for (int i = 0; i < exponent; i++) {
      result *= base;
    }
    return result;
  }
}

/// Parâmetros de síntese para renderização
class SynthParameters {
  final double attack; // 0-127
  final double decay; // 0-127
  final double sustain; // 0-127
  final double release; // 0-127
  final double cutoff; // 0-127
  final double resonance; // 0-127
  final double lfoRate; // 0-127
  final double lfoDepth; // 0-127

  const SynthParameters({
    this.attack = 20,
    this.decay = 45,
    this.sustain = 70,
    this.release = 50,
    this.cutoff = 80,
    this.resonance = 40,
    this.lfoRate = 50,
    this.lfoDepth = 30,
  });

  /// Converte de Map<String, double> (formato do Patch)
  factory SynthParameters.fromMap(Map<String, double> params) {
    return SynthParameters(
      attack: params['envAttack'] ?? 20,
      decay: params['envDecay'] ?? 45,
      sustain: params['envSustain'] ?? 70,
      release: params['envRelease'] ?? 50,
      cutoff: params['filterCutoff'] ?? 80,
      resonance: params['filterResonance'] ?? 40,
      lfoRate: params['lfoRate'] ?? 50,
      lfoDepth: params['lfoDepth'] ?? 30,
    );
  }

  /// Converte tempos AD em segundos (baseado em 120 BPM)
  double get attackSeconds => (attack / 127) * 2.0;
  double get decaySeconds => (decay / 127) * 1.0;
  double get releaseSeconds => (release / 127) * 1.5;
  double get sustainLevel => sustain / 127;

  /// Frequência de corte em Hz (baseada no valor 0-127)
  double get cutoffHz => 200 + (cutoff / 127) * 19800;

  /// Resonance como Q factor
  double get resonanceQ => (resonance / 127) * 25;

  /// LFO rate em Hz
  double get lfoRateHz => (lfoRate / 127) * 20;

  /// LFO depth como amplitude
  double get lfoDepthAmount => (lfoDepth / 127) * 50;
}

/// Serviço de exportação de áudio
class AudioExportService {
  static FlutterSoundPlayer? _player;
  static bool _initialized = false;

  /// Inicializa o serviço de áudio
  static Future<void> initialize() async {
    if (_initialized) return;

    _player = FlutterSoundPlayer();
    await _player!.openPlayer();
    _initialized = true;
  }

  /// Exporta um patch como áudio
  ///
  /// [patchName]: Nome do patch
 /// [parameters]: Parâmetros de síntese
  /// [notes]: Notas para renderizar (opcional)
  /// [format]: Formato de áudio
  /// [duration]: Duração da exportação
  /// [bpm]: Andamento em BPM
  static Future<AudioExportResult> exportPatch({
    required String patchName,
    required Map<String, double> parameters,
    List<RenderNote>? notes,
    AudioFormat format = AudioFormat.wav16,
    AudioExportDuration duration = AudioExportDuration.preview5,
    int bpm = 120,
  }) async {
    await initialize();

    // Gerar notas de exemplo se não fornecidas
    final renderNotes = notes ?? _generateDemoNotes(bpm, duration);

    // Calcular duração real
    final actualDuration = duration.seconds != null
        ? Duration(seconds: duration.seconds!)
        : _calculateTotalDuration(renderNotes);

    // Renderizar áudio (síntese básica)
    final audioData = await _renderAudio(
      notes: renderNotes,
      params: SynthParameters.fromMap(parameters),
      duration: actualDuration,
      format: format,
    );

    final fileName = '${patchName.replaceAll(' ', '_')}.${format.extension}';

    return AudioExportResult(
      data: audioData,
      fileName: fileName,
      fileSize: audioData.length,
      format: format,
      actualDuration: actualDuration,
    );
  }

  /// Renderiza áudio usando síntese básica
  static Future<Uint8List> _renderAudio({
    required List<RenderNote> notes,
    required SynthParameters params,
    required Duration duration,
    required AudioFormat format,
  }) async {
    final sampleRate = format.sampleRate;
    final numSamples = (duration.inMilliseconds * sampleRate / 1000).round();
    final buffer = Float64List(numSamples);

    // Síntese simples: dente-de-serra com envelope ADSR
    for (final note in notes) {
      final startSample = (note.startTime.inMilliseconds * sampleRate / 1000).round();
      final endSample = startSample + (note.duration.inMilliseconds * sampleRate / 1000).round();

      if (startSample >= numSamples) continue;

      final frequency = note.frequency;
      final amplitude = note.velocity * 0.3; // Volume máximo 30%

      // Calcular envelope
      final attackSamples = (params.attackSeconds * sampleRate).round();
      final decaySamples = (params.decaySeconds * sampleRate).round();
      final releaseSamples = (params.releaseSeconds * sampleRate).round();
      final sustainAmp = params.sustainLevel * amplitude;

      for (int i = startSample; i < endSample && i < numSamples; i++) {
        final noteTime = i - startSample;
        double env;

        if (noteTime < attackSamples) {
          // Attack
          env = amplitude * (noteTime / attackSamples);
        } else if (noteTime < attackSamples + decaySamples) {
          // Decay
          final decayTime = noteTime - attackSamples;
          final decayProgress = decayTime / decaySamples;
          env = sustainAmp + (amplitude - sustainAmp) * (1 - decayProgress);
        } else {
          // Sustain/Release (simplificado)
          env = sustainAmp;
        }

        // Onda dente-de-serra com filtro básico
        final phase = (noteTime * frequency / sampleRate) % 1.0;
        var sample = (phase * 2 - 1) * env;

        // Aplicar filtro lowpass simples (média móvel)
        if (i > startSample + 1) {
          sample = (sample + buffer[i - 1] * params.resonanceQ) / (1 + params.resonanceQ);
        }

        buffer[i] += sample;
      }
    }

    // Normalizar e converter para int16
    double maxSample = 0;
    for (final s in buffer) {
      if (s.abs() > maxSample) maxSample = s.abs();
    }

    final samples = Int16List(numSamples);
    final gain = maxSample > 0 ? 32767 / maxSample : 1;

    for (int i = 0; i < numSamples; i++) {
      samples[i] = (buffer[i] * gain).clamp(-32768, 32767);
    }

    // Converter para WAV (header + data)
    return _encodeWav(samples, sampleRate, format.bitDepth);
  }

  /// Codifica áudio como WAV
  static Uint8List _encodeWav(Int16List samples, int sampleRate, int bitDepth) {
    final byteData = ByteData(samples.length * 2 + 44);
    int offset = 0;

    // RIFF header
    _writeString(byteData, offset, 'RIFF'); offset += 4;
    _writeInt32(byteData, offset, samples.length * 2 + 36); offset += 4;
    _writeString(byteData, offset, 'WAVE'); offset += 4;

    // fmt chunk
    _writeString(byteData, offset, 'fmt '); offset += 4;
    _writeInt32(byteData, offset, 16); offset += 4; // Chunk size
    _writeInt16(byteData, offset, 1); offset += 2; // PCM
    _writeInt16(byteData, offset, 1); offset += 2; // Mono
    _writeInt32(byteData, offset, sampleRate); offset += 4;
    _writeInt32(byteData, offset, sampleRate * 2); offset += 4; // Byte rate
    _writeInt16(byteData, offset, 2); offset += 2; // Block align
    _writeInt16(byteData, offset, bitDepth); offset += 2;

    // data chunk
    _writeString(byteData, offset, 'data'); offset += 4;
    _writeInt32(byteData, offset, samples.length * 2); offset += 4;

    // Samples
    for (final sample in samples) {
      byteData.setInt16(offset, sample, Endian.little);
      offset += 2;
    }

    return byteData.buffer.asUint8List();
  }

  static void _writeString(ByteData bd, int offset, String s) {
    for (int i = 0; i < s.length; i++) {
      bd.setUint8(offset + i, s.codeUnitAt(i));
    }
  }

  static void _writeInt32(ByteData bd, int offset, int value) {
    bd.setUint32(offset, value, Endian.little);
  }

  static void _writeInt16(ByteData bd, int offset, int value) {
    bd.setUint16(offset, value, Endian.little);
  }

  /// Gera notas de demonstração (acorde C maior)
  static List<RenderNote> _generateDemoNotes(int bpm, AudioExportDuration duration) {
    final seconds = duration.seconds ?? 4;
    final beatDuration = Duration(milliseconds: 60000 ~/ bpm);

    return [
      RenderNote(
        pitch: 60, // C4
        velocity: 0.8,
        startTime: Duration.zero,
        duration: beatDuration * 4,
      ),
      RenderNote(
        pitch: 64, // E4
        velocity: 0.7,
        startTime: beatDuration ~/ 2,
        duration: beatDuration * 3,
      ),
      RenderNote(
        pitch: 67, // G4
        velocity: 0.7,
        startTime: beatDuration,
        duration: beatDuration * 2,
      ),
    ];
  }

  /// Calcula duração total das notas
  static Duration _calculateTotalDuration(List<RenderNote> notes) {
    if (notes.isEmpty) return const Duration(seconds: 5);

    int maxEndMs = 0;
    for (final note in notes) {
      final endMs = note.startTime.inMilliseconds + note.duration.inMilliseconds;
      if (endMs > maxEndMs) maxEndMs = endMs;
    }

    return Duration(milliseconds: maxEndMs + 500); // +500ms de release
  }

  /// Reproduz preview de áudio
  static Future<void> playPreview(Uint8List audioData) async {
    await initialize();
    if (_player == null) return;

    // Nota: flutter_sound requer arquivo para playback
    // Para preview em memória, seria necessária implementação alternativa
  }

  /// Libera recursos
  static Future<void> dispose() async {
    if (_player != null) {
      await _player!.closePlayer();
      _player = null;
    }
    _initialized = false;
  }

  /// Calcula tamanho estimado do arquivo
  static int estimateFileSize(Duration duration, AudioFormat format) {
    final seconds = duration.inMilliseconds / 1000;
    final bytesPerSecond = format.sampleRate * (format.bitDepth ~/ 8) * 1; // Mono
    return (seconds * bytesPerSecond).round();
  }

  /// Calcula bitrate para MP3
  static int getBitrate(AudioFormat format) {
    switch (format) {
      case AudioFormat.mp3128:
        return 128;
      case AudioFormat.mp3192:
        return 192;
      case AudioFormat.mp3320:
        return 320;
      default:
        return 0; // WAV é CBR
    }
  }

  /// Obtém string de qualidade
  static String getQualityString(AudioFormat format) {
    switch (format) {
      case AudioFormat.wav16:
        return 'CD Quality (16-bit/44.1kHz)';
      case AudioFormat.wav24:
        return 'High-Res (24-bit/44.1kHz)';
      case AudioFormat.wav32:
        return 'Studio (32-bit/48kHz)';
      case AudioFormat.mp3128:
        return 'MP3 128 kbps';
      case AudioFormat.mp3192:
        return 'MP3 192 kbps';
      case AudioFormat.mp3320:
        return 'MP3 320 kbps';
    }
  }
}
