import '../../models/patch_model.dart';

/// Representa uma track MIDI extraída de um projeto Reaper
class ReaperMidiTrack {
  final int id;
  final String name;
  final bool isFolder;
  final int? folderDepth; // 0 = root, >0 = aninhada
  final List<ReaperMidiNote> notes;
  final List<ReaperMidiCc> ccEvents;
  final int channel; // 1-16

  // Parâmetros inferidos para criar patch
  final double? volume;
  final double? pan;
  final int? pitchBendRange;

  ReaperMidiTrack({
    required this.id,
    required this.name,
    this.isFolder = false,
    this.folderDepth,
    required this.notes,
    required this.ccEvents,
    required this.channel,
    this.volume,
    this.pan,
    this.pitchBendRange,
  });

  /// Calcula a tessitura da track
  int get minPitch => notes.isEmpty ? 60 : notes.map((n) => n.pitch).reduce((a, b) => a < b ? a : b);
  int get maxPitch => notes.isEmpty ? 72 : notes.map((n) => n.pitch).reduce((a, b) => a > b ? a : b);
  int get range => maxPitch - minPitch;
  double get avgPitch => notes.isEmpty ? 66 : notes.map((n) => n.pitch).reduce((a, b) => a + b) / notes.length;

  @override
  String toString() => 'ReaperMidiTrack($name, ${notes.length} notes, range: $minPitch-$maxPitch)';
}

/// Representa uma nota MIDI de um projeto Reaper
class ReaperMidiNote {
  final int pitch; // 0-127
  final int velocity; // 0-127
  final double position; // Em segundos
  final double duration; // Em segundos
  final int channel;

  ReaperMidiNote({
    required this.pitch,
    required this.velocity,
    required this.position,
    required this.duration,
    required this.channel,
  });
}

/// Representa um evento CC de um projeto Reaper
class ReaperMidiCc {
  final int number; // 0-127
  final int value; // 0-127
  final double position; // Em segundos

  ReaperMidiCc({
    required this.number,
    required this.value,
    required this.position,
  });
}

/// Representa um item de áudio de um projeto Reaper
class ReaperAudioItem {
  final String name;
  final String filePath; // Caminho do arquivo .wav/.mp3
  final double position;
  final double duration;
  final double? offset;

  ReaperAudioItem({
    required this.name,
    required this.filePath,
    required this.position,
    required this.duration,
    this.offset,
  });
}

/// Representa um FX plugin em uma track Reaper
class ReaperFxPlugin {
  final String name;
  final String type; // VST, VST3, AU, JS, etc.
  final bool bypassed;

  ReaperFxPlugin({
    required this.name,
    required this.type,
    this.bypassed = false,
  });

  /// Tenta inferir tipo de som pelo nome do plugin
  String? inferSoundType() {
    final lower = name.toLowerCase();

    // Piano
    if (lower.contains('piano') && !lower.contains('electric')) {
      return 'acoustic_piano';
    }
    if (lower.contains('epiano') || lower.contains('rhodes') || lower.contains('wurl')) {
      return 'electric_piano';
    }

    // Synth
    if (lower.contains('synth') || lower.contains('analog') || lower.contains('subtractive')) {
      return 'synth';
    }
    if (lower.contains('fm') || lower.contains('dx')) {
      return 'fm_synthon';
    }

    // Brass
    if (lower.contains('brass') || lower.contains('trumpet') || lower.contains('horn')) {
      return 'brass';
    }

    // Strings
    if (lower.contains('string') || lower.contains('ensemble')) {
      return 'strings';
    }

    // Organ
    if (lower.contains('organ') || lower.contains('hammond') || lower.contains('b3')) {
      return 'organ';
    }

    return null;
  }
}

/// Metadados de um projeto Reaper
class ReaperProjectMetadata {
  final String? title;
  final double tempo; // BPM
  final int? timeSignatureNumerator;
  final int? timeSignatureDenominator;
  final double sampleRate; // Hz
  final int bitDepth;

  ReaperProjectMetadata({
    this.title,
    required this.tempo,
    this.timeSignatureNumerator,
    this.timeSignatureDenominator,
    required this.sampleRate,
    required this.bitDepth,
  });
}

/// Sugestão de patch baseada em uma track Reaper
class ReaperPatchSuggestion {
  final ReaperMidiTrack sourceTrack;
  final PatchModel patch;
  final String? fxHint;
  final List<String> reasoning;

  ReaperPatchSuggestion({
    required this.sourceTrack,
    required this.patch,
    this.fxHint,
    required this.reasoning,
  });
}

/// Resultado do parsing de um projeto Reaper
class ReaperProject {
  final ReaperProjectMetadata metadata;
  final List<ReaperMidiTrack> midiTracks;
  final List<ReaperAudioItem> audioItems;

  ReaperProject({
    required this.metadata,
    required this.midiTracks,
    required this.audioItems,
  });

  /// Gera sugestões de patches para todas as tracks MIDI
  List<ReaperPatchSuggestion> generatePatchSuggestions() {
    final suggestions = <ReaperPatchSuggestion>[];

    for (final track in midiTracks) {
      if (track.isFolder || track.notes.isEmpty) continue;

      final suggestion = _suggestPatchForTrack(track);
      if (suggestion != null) {
        suggestions.add(suggestion);
      }
    }

    return suggestions;
  }

  /// Gera sugestão de patch para uma track específica
  ReaperPatchSuggestion? _suggestPatchForTrack(ReaperMidiTrack track) {
    final reasoning = <String>[];

    // 1. Inferir categoria pelo nome da track
    final category = _inferCategoryFromName(track.name, track);
    reasoning.add('Categoria inferida: $category (baseado no nome "${track.name}")');

    // 2. Inferir parâmetros das notas
    final parameters = _inferParametersFromNotes(track, category);
    reasoning.add('Parâmetros inferidos das ${track.notes.length} notas');
    reasoning.add('Range: ${track.minPitch}-${track.maxPitch} (${track.range} semitons)');

    // 3. Obter volume e pan da track
    if (track.volume != null) {
      parameters['ampLevel'] = track.volume!;
    }
    if (track.pan != null) {
      parameters['pan'] = track.pan!;
    }

    // 4. Gerar tags
    final tags = _generateTags(track, category);

    // 5. Criar patch
    final patch = PatchModel(
      name: track.name.isNotEmpty ? track.name : 'Reaper_Track_${track.id}',
      category: category,
      tags: tags,
      macro: parameters,
      panel: <String, num>{},
    );

    return ReaperPatchSuggestion(
      sourceTrack: track,
      patch: patch,
      reasoning: reasoning,
    );
  }

  /// Infere categoria pelo nome da track
  String _inferCategoryFromName(String name, ReaperMidiTrack track) {
    final lower = name.toLowerCase();

    // Padrões comuns de nomes
    final patterns = {
      RegExp(r'piano|acoustic'): 'PNO',
      RegExp(r'ep|electric.piano|rhodes|wurl'): 'EP',
      RegExp(r'organ|hammond|b3'): 'ORG',
      RegExp(r'bass'): 'BAS',
      RegExp(r'drum|perc'): 'PRC',
      RegExp(r'brass|trumpet|trombone|horn'): 'BRS',
      RegExp(r'string|violin|cello|viola'): 'STR',
      RegExp(r'flute|clarinet|sax|oboe|woodwind'): 'WW',
      RegExp(r'synth|lead'): 'SYN',
      RegExp(r'pad|atmosphere'): 'SYN',
      RegExp(r'ensemble|orchestra'): 'ENS',
      RegExp(r'fx|effect'): 'FX',
    };

    for (final entry in patterns.entries) {
      if (entry.key.hasMatch(lower)) {
        return entry.value;
      }
    }

    // Inferir pela tessitura
    final avgPitch = track.avgPitch;
    if (avgPitch < 45) return 'BAS'; // Grave
    if (avgPitch > 80) return 'WW'; // Agudo

    return 'SYN'; // Default
  }

  /// Infere parâmetros das notas
  Map<String, double> _inferParametersFromNotes(ReaperMidiTrack track, String category) {
    final params = <String, double>{};

    // Parâmetros base por categoria
    final baseParams = _getBaseParameters(category);

    // Ajustar filtro pela tessitura
    final avgPitch = track.avgPitch;
    if (avgPitch > 72) {
      params['filterCutoff'] = (baseParams['filterCutoff']! * 1.1).clamp(0, 127);
    } else if (avgPitch < 48) {
      params['filterCutoff'] = (baseParams['filterCutoff']! * 0.85).clamp(0, 127);
    } else {
      params['filterCutoff'] = baseParams['filterCutoff']!;
    }

    // Ajustar envelope pela duração média das notas
    if (track.notes.isNotEmpty) {
      final avgDuration = track.notes
          .map((n) => n.duration)
          .reduce((a, b) => a + b) / track.notes.length;

      if (avgDuration > 0.5) {
        // Notas longas
        params['envAttack'] = (baseParams['envAttack']! * 1.3).clamp(0, 127);
        params['envRelease'] = (baseParams['envRelease']! * 1.4).clamp(0, 127);
        params['envSustain'] = (baseParams['envSustain']! * 1.2).clamp(0, 127);
      } else if (avgDuration < 0.2) {
        // Notas curtas (staccato)
        params['envAttack'] = (baseParams['envAttack']! * 0.7).clamp(0, 127);
        params['envRelease'] = (baseParams['envRelease']! * 0.6).clamp(0, 127);
      } else {
        params['envAttack'] = baseParams['envAttack']!;
        params['envRelease'] = baseParams['envRelease']!;
        params['envSustain'] = baseParams['envSustain']!;
      }
    }

    // Parâmetros padrão
    params['filterResonance'] = baseParams['filterResonance']!;
    params['lfoRate'] = baseParams['lfoRate']!;
    params['lfoDepth'] = baseParams['lfoDepth']!;
    params['chorusRate'] = baseParams['chorusRate']!;
    params['chorusDepth'] = baseParams['chorusDepth']!;
    params['reverbLevel'] = baseParams['reverbLevel']!;
    params['ampLevel'] = baseParams['ampLevel']!;
    params['pan'] = baseParams['pan']!;

    // Copiar CC events da track
    for (final cc in track.ccEvents) {
      switch (cc.number) {
        case 1: // Modulation
          params['lfoDepth'] = cc.value.toDouble();
          break;
        case 74: // Filter Cutoff
          params['filterCutoff'] = cc.value.toDouble();
          break;
        case 71: // Filter Resonance
          params['filterResonance'] = cc.value.toDouble();
          break;
      }
    }

    return params;
  }

  /// Obtém parâmetros base por categoria
  static Map<String, double> _getBaseParameters(String category) {
    switch (category) {
      case 'PNO': // Piano
        return {
          'envAttack': 0,
          'envDecay': 40,
          'envSustain': 60,
          'envRelease': 30,
          'filterCutoff': 110,
          'filterResonance': 30,
          'lfoRate': 0,
          'lfoDepth': 0,
          'chorusRate': 64,
          'chorusDepth': 40,
          'reverbLevel': 50,
          'ampLevel': 100,
          'pan': 64,
        };

      case 'EP': // E.Piano
        return {
          'envAttack': 5,
          'envDecay': 70,
          'envSustain': 50,
          'envRelease': 50,
          'filterCutoff': 95,
          'filterResonance': 25,
          'lfoRate': 45,
          'lfoDepth': 20,
          'chorusRate': 64,
          'chorusDepth': 50,
          'reverbLevel': 40,
          'ampLevel': 95,
          'pan': 64,
        };

      case 'ORG': // Organ
        return {
          'envAttack': 0,
          'envDecay': 0,
          'envSustain': 127,
          'envRelease': 10,
          'filterCutoff': 120,
          'filterResonance': 20,
          'lfoRate': 0,
          'lfoDepth': 0,
          'chorusRate': 50,
          'chorusDepth': 60,
          'reverbLevel': 30,
          'ampLevel': 100,
          'pan': 64,
        };

      case 'BRS': // Brass
        return {
          'envAttack': 15,
          'envDecay': 30,
          'envSustain': 90,
          'envRelease': 25,
          'filterCutoff': 85,
          'filterResonance': 40,
          'lfoRate': 55,
          'lfoDepth': 25,
          'chorusRate': 64,
          'chorusDepth': 45,
          'reverbLevel': 35,
          'ampLevel': 100,
          'pan': 64,
        };

      case 'STR': // Strings
        return {
          'envAttack': 50,
          'envDecay': 20,
          'envSustain': 100,
          'envRelease': 60,
          'filterCutoff': 75,
          'filterResonance': 25,
          'lfoRate': 40,
          'lfoDepth': 15,
          'chorusRate': 70,
          'chorusDepth': 65,
          'reverbLevel': 55,
          'ampLevel': 90,
          'pan': 64,
        };

      case 'WW': // Woodwind
        return {
          'envAttack': 35,
          'envDecay': 25,
          'envSustain': 80,
          'envRelease': 40,
          'filterCutoff': 90,
          'filterResonance': 20,
          'lfoRate': 60,
          'lfoDepth': 35,
          'chorusRate': 55,
          'chorusDepth': 30,
          'reverbLevel': 40,
          'ampLevel': 85,
          'pan': 64,
        };

      case 'SYN': // Synth
        return {
          'envAttack': 20,
          'envDecay': 45,
          'envSustain': 70,
          'envRelease': 50,
          'filterCutoff': 80,
          'filterResonance': 60,
          'lfoRate': 50,
          'lfoDepth': 45,
          'chorusRate': 64,
          'chorusDepth': 55,
          'reverbLevel': 45,
          'ampLevel': 95,
          'pan': 64,
        };

      case 'BAS': // Bass
        return {
          'envAttack': 10,
          'envDecay': 50,
          'envSustain': 60,
          'envRelease': 30,
          'filterCutoff': 60,
          'filterResonance': 50,
          'lfoRate': 0,
          'lfoDepth': 0,
          'chorusRate': 0,
          'chorusDepth': 0,
          'reverbLevel': 10,
          'ampLevel': 110,
          'pan': 64,
        };

      case 'PRC': // Percussion
        return {
          'envAttack': 0,
          'envDecay': 20,
          'envSustain': 0,
          'envRelease': 10,
          'filterCutoff': 100,
          'filterResonance': 50,
          'lfoRate': 0,
          'lfoDepth': 0,
          'chorusRate': 0,
          'chorusDepth': 0,
          'reverbLevel': 60,
          'ampLevel': 100,
          'pan': 64,
        };

      case 'ENS': // Ensemble
        return {
          'envAttack': 60,
          'envDecay': 20,
          'envSustain': 95,
          'envRelease': 70,
          'filterCutoff': 80,
          'filterResonance': 25,
          'lfoRate': 45,
          'lfoDepth': 20,
          'chorusRate': 72,
          'chorusDepth': 70,
          'reverbLevel': 65,
          'ampLevel': 85,
          'pan': 64,
        };

      case 'FX': // FX
        return {
          'envAttack': 80,
          'envDecay': 90,
          'envSustain': 40,
          'envRelease': 90,
          'filterCutoff': 50,
          'filterResonance': 100,
          'lfoRate': 120,
          'lfoDepth': 80,
          'chorusRate': 127,
          'chorusDepth': 127,
          'reverbLevel': 100,
          'ampLevel': 90,
          'pan': 64,
        };

      default:
        return {
          'envAttack': 20,
          'envDecay': 45,
          'envSustain': 70,
          'envRelease': 50,
          'filterCutoff': 80,
          'filterResonance': 40,
          'lfoRate': 50,
          'lfoDepth': 30,
          'chorusRate': 64,
          'chorusDepth': 50,
          'reverbLevel': 45,
          'ampLevel': 95,
          'pan': 64,
        };
    }
  }

  /// Gera tags para a patch
  static List<String> _generateTags(ReaperMidiTrack track, String category) {
    final tags = <String>['Reaper', category];

    if (track.notes.length > 100) {
      tags.add('busy');
    } else if (track.notes.length < 20) {
      tags.add('sparse');
    }

    final avgVelocity = track.notes.isEmpty
        ? 64
        : track.notes.map((n) => n.velocity).reduce((a, b) => a + b) / track.notes.length;

    if (avgVelocity < 60) {
      tags.add('soft');
    } else if (avgVelocity > 100) {
      tags.add('loud');
    }

    return tags;
  }
}

/// Exceção lançada quando há erro no parsing
class ReaperParserException implements Exception {
  final String message;
  final Object? cause;

  ReaperParserException(this.message, [this.cause]);

  @override
  String toString() => 'ReaperParserException: $message${cause != null ? ' (caused by: $cause)' : ''}';
}

/// Serviço de parsing de arquivos de projeto Reaper (.rpp)
class ReaperProjectParser {
  /// Parse de um arquivo .rpp
  static ReaperProject parse(String rppContent) {
    try {
      return _parseDocument(rppContent);
    } catch (e) {
      throw ReaperParserException('Failed to parse Reaper project', e);
    }
  }

  /// Parse principal do documento .rpp
  static ReaperProject _parseDocument(String content) {
    final lines = content.split('\n');

    // Metadados
    String? title;
    double tempo = 120.0;
    int? timeSigNum;
    int? timeSigDen;
    double sampleRate = 44100.0;
    int bitDepth = 16;

    // Tracks e itens
    final midiTracks = <ReaperMidiTrack>[];
    final audioItems = <ReaperAudioItem>[];

    // Estado do parser
    ReaperMidiTrack? currentTrack;
    List<ReaperMidiNote>? currentNotes;
    List<ReaperMidiCc>? currentCcEvents;
    int currentTrackId = 0;
    int currentFolderDepth = 0;

    // Parser linha por linha
    for (int i = 0; i < lines.length; i++) {
      final line = lines[i].trim();

      // Metadados do projeto
      if (line.startsWith('<REAPER_PROJECT')) {
        final versionMatch = RegExp(r'VERSION (\d+\.\d+)').firstMatch(line);
        // Version tracking if needed
      }

      if (line.startsWith('<TITLE ')) {
        title = line.substring(7).replaceAll('"', '');
      }

      if (line.startsWith('<TEMPO ')) {
        final match = RegExp(r'(\d+\.?\d*)').firstMatch(line);
        if (match != null) {
          tempo = double.tryParse(match.group(1) ?? '120') ?? 120.0;
        }
      }

      if (line.startsWith('<TIME_SIGNATURE ')) {
        final match = RegExp(r'(\d+)/(\d+)').firstMatch(line);
        if (match != null) {
          timeSigNum = int.tryParse(match.group(1) ?? '4');
          timeSigDen = int.tryParse(match.group(2) ?? '4');
        }
      }

      if (line.startsWith('<SAMPLERATE ')) {
        final match = RegExp(r'(\d+)').firstMatch(line);
        if (match != null) {
          sampleRate = double.tryParse(match.group(1) ?? '44100') ?? 44100.0;
        }
      }

      if (line.startsWith('<BITDEPTH ')) {
        final match = RegExp(r'(\d+)').firstMatch(line);
        if (match != null) {
          bitDepth = int.tryParse(match.group(1) ?? '16') ?? 16;
        }
      }

      // Track
      if (line.startsWith('<TRACK')) {
        currentTrackId++;
        currentFolderDepth = 0;
        currentNotes = [];
        currentCcEvents = [];
      }

      if (line.startsWith('<TRACK NAME "')) {
        final nameMatch = RegExp(r'TRACK NAME "([^"]*)"').firstMatch(line);
        final name = nameMatch?.group(1) ?? 'Track_$currentTrackId';

        // Verificar se é folder
        final isFolder = lines.skip(i).take(20).any((l) => l.contains('FOLDER') && l.contains('1'));

        // Buscar depth
        final depthMatch = RegExp(r'FOLDERDEEP (\d+)').firstMatch(lines.skip(i).take(10).join('\n'));

        currentTrack = ReaperMidiTrack(
          id: currentTrackId,
          name: name,
          isFolder: isFolder,
          folderDepth: depthMatch != null ? int.tryParse(depthMatch.group(1) ?? '0') : 0,
          notes: currentNotes ?? [],
          ccEvents: currentCcEvents ?? [],
          channel: 1,
        );
      }

      // Volume e Pan
      if (currentTrack != null && line.startsWith('<VOL')) {
        final volMatch = RegExp(r'VOL ([\d.]+)').firstMatch(line);
        if (volMatch != null) {
          final vol = double.tryParse(volMatch.group(1) ?? '1.0') ?? 1.0;
          // Converter de escala linear para 0-127
          currentTrack = ReaperMidiTrack(
            id: currentTrack.id,
            name: currentTrack.name,
            isFolder: currentTrack.isFolder,
            folderDepth: currentTrack.folderDepth,
            notes: currentTrack.notes,
            ccEvents: currentTrack.ccEvents,
            channel: currentTrack.channel,
            volume: (vol * 100).clamp(0, 127),
          );
        }
      }

      if (currentTrack != null && line.startsWith('<PAN')) {
        final panMatch = RegExp(r'PAN ([\d.-]+)').firstMatch(line);
        if (panMatch != null) {
          final pan = double.tryParse(panMatch.group(1) ?? '0') ?? 0;
          // Converter de -1 a 1 para 0-127
          currentTrack = ReaperMidiTrack(
            id: currentTrack.id,
            name: currentTrack.name,
            isFolder: currentTrack.isFolder,
            folderDepth: currentTrack.folderDepth,
            notes: currentTrack.notes,
            ccEvents: currentTrack.ccEvents,
            channel: currentTrack.channel,
            volume: currentTrack.volume,
            pan: ((pan + 1) * 64).clamp(0, 127),
          );
        }
      }

      // Itens MIDI
      if (line.startsWith('<SOURCE MIDI')) {
        // Parser básico de MIDI inline (formato hexadecimal do Reaper)
        final notesBlock = _extractMidiNotesFromSource(lines, i);
        if (notesBlock.isNotEmpty && currentTrack != null) {
          currentTrack = ReaperMidiTrack(
            id: currentTrack.id,
            name: currentTrack.name,
            isFolder: currentTrack.isFolder,
            folderDepth: currentTrack.folderDepth,
            notes: notesBlock,
            ccEvents: currentTrack.ccEvents,
            channel: currentTrack.channel,
            volume: currentTrack.volume,
            pan: currentTrack.pan,
          );
        }
      }

      // Itens de áudio
      if (line.startsWith('<ITEM')) {
        final audioItem = _parseAudioItem(lines, i);
        if (audioItem != null) {
          audioItems.add(audioItem);
        }
      }

      // Final da track
      if (line.startsWith('>')) {
        if (currentTrack != null) {
          midiTracks.add(currentTrack);
          currentTrack = null;
          currentNotes = null;
          currentCcEvents = null;
        }
      }
    }

    return ReaperProject(
      metadata: ReaperProjectMetadata(
        title: title,
        tempo: tempo,
        timeSignatureNumerator: timeSigNum,
        timeSignatureDenominator: timeSigDen,
        sampleRate: sampleRate,
        bitDepth: bitDepth,
      ),
      midiTracks: midiTracks,
      audioItems: audioItems,
    );
  }

  /// Extrai notas MIDI de um bloco SOURCE MIDI
  static List<ReaperMidiNote> _extractMidiNotesFromSource(List<String> lines, int startIndex) {
    final notes = <ReaperMidiNote>[];

    // O Reaper armazena MIDI em formato hexadecimal ou como eventos
    // Esta é uma implementação simplificada
    for (int i = startIndex; i < lines.length && i < startIndex + 100; i++) {
      final line = lines[i];

      // Parser de eventos MIDI (formato simplificado)
      if (line.contains('e ') || line.contains('E ')) {
        // Event MIDI (note on/off)
        final match = RegExp(r'e (\d+) ([\da-fA-F]+)').firstMatch(line);
        if (match != null) {
          // Parser hexadecimal simplificado
          // Nota: implementação completa precisaria decodificar MIDI hex
        }
      }

      if (line.startsWith('>')) break;
    }

    return notes;
  }

  /// Parse de um item de áudio
  static ReaperAudioItem? _parseAudioItem(List<String> lines, int startIndex) {
    String? name;
    String? filePath;
    double? position;
    double? duration;

    for (int i = startIndex; i < lines.length && i < startIndex + 50; i++) {
      final line = lines[i];

      if (line.startsWith('<ITEM NAME "')) {
        name = RegExp(r'NAME "([^"]*)"').firstMatch(line)?.group(1);
      }

      if (line.startsWith('<SOURCE WAVE')) {
        final fileMatch = RegExp(r'FILE "([^"]*)"').firstMatch(line);
        if (fileMatch != null) {
          filePath = fileMatch.group(1);
        }
      }

      if (line.startsWith('<POSITION ')) {
        position = double.tryParse(RegExp(r'([\d.]+)').firstMatch(line)?.group(1) ?? '0');
      }

      if (line.startsWith('<LENGTH ')) {
        duration = double.tryParse(RegExp(r'([\d.]+)').firstMatch(line)?.group(1) ?? '0');
      }

      if (line.startsWith('>')) break;
    }

    if (filePath != null && position != null) {
      return ReaperAudioItem(
        name: name ?? 'Audio_Item',
        filePath: filePath,
        position: position,
        duration: duration ?? 0,
      );
    }

    return null;
  }
}
