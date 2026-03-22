import 'dart:typed_data';
import 'package:midi/midi.dart';

/// Tipo de arquivo MIDI para exportação
enum MidiType {
  /// MIDI Type 0 - Single track (todos os canais em uma track)
  type0,
  /// MIDI Type 1 - Multi-track (cada canal em sua própria track) - padrão para Reaper
  type1,
  /// MIDI Type 2 - Multi-pattern (múltiplos padrões independentes)
  type2,
}

/// Resolução PPQ (Pulses Per Quarter Note) para exportação MIDI
enum MidiResolution {
  ppq96(96),
  ppq192(192),
  ppq240(240),
  ppq480(480); // Padrão para Reaper

  final int value;
  const MidiResolution(this.value);
}

/// Resultado da exportação MIDI
class MidiExportResult {
  final Uint8List data;
  final String fileName;
  final int fileSize;
  final int trackCount;
  final Duration estimatedDuration;

  MidiExportResult({
    required this.data,
    required this.fileName,
    required this.fileSize,
    required this.trackCount,
    required this.estimatedDuration,
  });
}

/// Mapeamento de parâmetros XPS-10 para Control Change (CC) MIDI
/// Baseado na especificação MIDI CC e parâmetros do Roland XPS-10
class Xps10CcMapping {
  static const Map<String, int> oscToCc = {
    // Oscillator Common
    'oscPitchCoarse': 0,    // Bank Select MSB (reutilizado)
    'oscPitchFine': 1,      // Modulation Wheel (reutilizado para pitch fine)
    'oscPulseWidth': 2,     // Breath Controller

    // Envelope (ADSR)
    'envAttack': 73,        // Attack Time
    'envDecay': 74,         // Decay Time
    'envSustain': 75,       // Release Time (usado como sustain no XPS-10)
    'envRelease': 72,       // Release Time

    // Filter
    'filterCutoff': 74,     // Filter Cutoff Frequency (Brightness)
    'filterResonance': 71,  // Filter Resonance (Brightness)

    // LFO
    'lfoRate': 76,          // Vibrato Rate
    'lfoDepth': 77,         // Vibrato Depth
    'lfoDelay': 78,         // Vibrato Delay

    // Effects
    'chorusRate': 93,       // Chorus Speed
    'chorusDepth': 94,      // Chorus Depth
    'reverbLevel': 91,      // Reverb Level
    'delayLevel': 92,       // Delay Level (Tremolo Level)

    // Amp/Output
    'ampLevel': 7,          // Volume (Main Volume)
    'pan': 10,              // Pan
    'expression': 11,       // Expression
  };

  /// Converte nome do parâmetro para CC number
  static int? getCcNumber(String parameterName) {
    return oscToCc[parameterName];
  }

  /// Converte valor 0-127 para valor de parâmetro XPS-10
  static double ccToParameterValue(int ccValue, {double min = 0, double max = 127}) {
    return min + (ccValue / 127) * (max - min);
  }

  /// Converte valor de parâmetro XPS-10 para CC (0-127)
  static int parameterToCc(double value, {double min = 0, double max = 127}) {
    final normalized = (value - min) / (max - min);
    return (normalized * 127).round().clamp(0, 127);
  }
}

/// Serviço de exportação de patches XPS-10 para formato MIDI
class MidiExportService {
  /// Converte um patch XPS-10 em arquivo MIDI
  ///
  /// [patchName]: Nome do patch (será usado como nome da track)
  /// [parameters]: Mapa de parâmetros do patch (nome -> valor)
  /// [notes]: Lista opcional de notas MIDI para incluir
  /// [midiType]: Tipo de MIDI (padrão: Type 1 para Reaper)
  /// [resolution]: Resolução PPQ (padrão: 480 para Reaper)
  /// [bpm]: Andamento em BPM (padrão: 120)
  /// [duration]: Duração estimada em segundos
  static Future<MidiExportResult> exportPatch({
    required String patchName,
    required Map<String, double> parameters,
    List<MidiNote>? notes,
    MidiType midiType = MidiType.type1,
    MidiResolution resolution = MidiResolution.ppq480,
    int bpm = 120,
    Duration? duration,
  }) async {
    // Criar arquivo MIDI
    final midiFile = MidiFile();

    // Configurar header MIDI
    final format = midiType == MidiType.type0 ? 0 : midiType == MidiType.type1 ? 1 : 2;

    // Track 0: Meta eventos (tempo, time signature, etc.)
    final tempoTrack = Track();
    _addTempoMetaEvents(tempoTrack, bpm);
    _addTimeSignatureMetaEvents(tempoTrack);
    _addTrackNameMetaEvent(tempoTrack, patchName);
    _addCopyrightMetaEvent(tempoTrack, 'Exported from XPS-10 AI Workstation');

    // Adicionar eventos CC para parâmetros do patch
    _addPatchControlChanges(tempoTrack, parameters, patchName);

    midiFile.tracks.add(tempoTrack);

    // Adicionar tracks de notas se fornecidas
    if (notes != null && notes.isNotEmpty) {
      if (midiType == MidiType.type1) {
        // Type 1: Criar tracks separadas para cada canal
        final notesByChannel = <int, List<MidiNote>>{};
        for (final note in notes) {
          notesByChannel.putIfAbsent(note.channel, () => []).add(note);
        }

        for (final entry in notesByChannel.entries) {
          final track = Track();
          _addTrackNameMetaEvent(track, '${patchName}_CH${entry.key}');
          _addNotesToTrack(track, entry.value, bpm, resolution.value);
          midiFile.tracks.add(track);
        }
      } else {
        // Type 0: Todas as notas em uma track
        final notesTrack = Track();
        _addTrackNameMetaEvent(notesTrack, patchName);
        _addNotesToTrack(notesTrack, notes, bpm, resolution.value);
        midiFile.tracks.add(notesTrack);
      }
    }

    // Serializar MIDI
    final data = await midiFile.serialize();

    // Calcular duração estimada
    final estimatedDuration = duration ?? _calculateDuration(notes, bpm);

    return MidiExportResult(
      data: data,
      fileName: '${patchName.replaceAll(' ', '_')}.mid',
      fileSize: data.length,
      trackCount: midiFile.tracks.length,
      estimatedDuration: estimatedDuration,
    );
  }

  /// Adiciona meta eventos de tempo à track
  static void _addTempoMetaEvents(Track track, int bpm) {
    // MIDI tempo = 60.000.000 / BPM
    final tempo = (60000000 / bpm).floor();
    track.addEvent(MetaEvent.tempo(tempo), tick: 0);
  }

  /// Adiciona meta eventos de compasso à track
  static void _addTimeSignatureMetaEvents(Track track) {
    // Time signature: 4/4 (default)
    track.addEvent(MetaEvent.timeSignature(4, 2, 24, 8), tick: 0);
  }

  /// Adiciona meta evento de nome de track
  static void _addTrackNameMetaEvent(Track track, String name) {
    track.addEvent(MetaEvent.trackName(name), tick: 0);
  }

  /// Adiciona meta evento de copyright
  static void _addCopyrightMetaEvent(Track track, String copyright) {
    track.addEvent(MetaEvent.copyright(copyright), tick: 0);
  }

  /// Adiciona eventos de Control Change para parâmetros do patch
  static void _addPatchControlChanges(Track track, Map<String, double> parameters, String patchName) {
    var tick = 0;

    // Sequencializar parâmetros como automação CC
    for (final entry in parameters.entries) {
      final ccNumber = Xps10CcMapping.getCcNumber(entry.key);
      if (ccNumber != null) {
        final ccValue = Xps10CcMapping.parameterToCc(entry.value);
        track.addEvent(ChannelEvent.controlChange(ccNumber, ccValue), tick: tick);
        tick += 10; // Pequeno intervalo entre CCs
      }
    }
  }

  /// Adiciona notas à track
  static void _addNotesToTrack(Track track, List<MidiNote> notes, int bpm, int ppq) {
    // Ordenar notas por start time
    final sortedNotes = List<MidiNote>.from(notes);
    sortedNotes.sort((a, b) => a.startTime.compareTo(b.startTime));

    for (final note in sortedNotes) {
      final startTick = _timeToTick(note.startTime, bpm, ppq);
      final endTick = _timeToTick(note.endTime, bpm, ppq);
      final duration = endTick - startTick;

      // Note On
      track.addEvent(
        ChannelEvent.noteOn(
          note.noteNumber,
          note.velocity,
          channel: note.channel,
        ),
        tick: startTick,
      );

      // Note Off
      track.addEvent(
        ChannelEvent.noteOff(
          note.noteNumber,
          0,
          channel: note.channel,
        ),
        tick: endTick,
      );
    }
  }

  /// Converte tempo em segundos para ticks MIDI
  static int _timeToTick(Duration time, int bpm, int ppq) {
    final secondsPerBeat = 60.0 / bpm;
    final beats = time.inMilliseconds / 1000.0 / secondsPerBeat;
    return (beats * ppq).floor();
  }

  /// Calcula duração estimada com base nas notas
  static Duration _calculateDuration(List<MidiNote>? notes, int bpm) {
    if (notes == null || notes.isEmpty) {
      return const Duration(seconds: 4); // Default 4 segundos
    }

    final maxTime = notes.map((n) => n.endTime).reduce((a, b) => a > b ? a : b);
    return maxTime;
  }

  /// Exporta setlist completo como MIDI Type 1
  ///
  /// Cada patch da setlist torna-se uma track separada
  static Future<MidiExportResult> exportSetlist({
    required String setlistName,
    required List<SetlistPatch> patches,
    MidiResolution resolution = MidiResolution.ppq480,
    int bpm = 120,
  }) async {
    final midiFile = MidiFile();

    // Track 0: Meta eventos
    final tempoTrack = Track();
    _addTempoMetaEvents(tempoTrack, bpm);
    _addTimeSignatureMetaEvents(tempoTrack);
    _addTrackNameMetaEvent(tempoTrack, setlistName);
    _addCopyrightMetaEvent(tempoTrack, 'Exported from XPS-10 AI Workstation');
    midiFile.tracks.add(tempoTrack);

    // Uma track por patch
    for (final patch in patches) {
      final track = Track();
      _addTrackNameMetaEvent(track, patch.name);

      // Adicionar CCs do patch
      _addPatchControlChanges(track, patch.parameters, patch.name);

      // Adicionar notas se disponíveis
      if (patch.notes != null && patch.notes!.isNotEmpty) {
        _addNotesToTrack(track, patch.notes!, bpm, resolution.value);
      }

      midiFile.tracks.add(track);
    }

    final data = await midiFile.serialize();
    final maxDuration = patches
        .map((p) => _calculateDuration(p.notes, bpm))
        .fold(Duration.zero, (a, b) => a > b ? a : b);

    return MidiExportResult(
      data: data,
      fileName: '${setlistName.replaceAll(' ', '_')}_setlist.mid',
      fileSize: data.length,
      trackCount: midiFile.tracks.length,
      estimatedDuration: maxDuration,
    );
  }
}

/// Representa uma nota MIDI
class MidiNote {
  final int noteNumber; // 0-127
  final int velocity; // 0-127
  final int channel; // 0-15
  final Duration startTime;
  final Duration endTime;

  MidiNote({
    required this.noteNumber,
    required this.velocity,
    required this.channel,
    required this.startTime,
    required this.endTime,
  });

  /// Cria nota pelo nome (ex: "C4", "A#3")
  factory MidiNote.fromName({
    required String noteName,
    int velocity = 100,
    int channel = 0,
    required Duration startTime,
    required Duration endTime,
  }) {
    final noteNumber = _noteNameToNumber(noteName);
    return MidiNote(
      noteNumber: noteNumber,
      velocity: velocity,
      channel: channel,
      startTime: startTime,
      endTime: endTime,
    );
  }

  static int _noteNameToNumber(String noteName) {
    final notes = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11};

    final match = RegExp(r'^([A-G][b#]?)(-?\d+)$').firstMatch(noteName);
    if (match == null) {
      throw ArgumentError('Invalid note name: $noteName');
    }

    final note = match.group(1)!;
    final octave = int.parse(match.group(2)!);

    return (octave + 1) * 12 + notes[note]!;
  }
}

/// Representa um patch dentro de uma setlist
class SetlistPatch {
  final String name;
  final Map<String, double> parameters;
  final List<MidiNote>? notes;

  SetlistPatch({
    required this.name,
    required this.parameters,
    this.notes,
  });
}
