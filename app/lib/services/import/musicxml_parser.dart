import 'dart:convert';
import 'package:xml/xml.dart';

/// Representa uma nota musical extraída do MusicXML
class MusicXmlNote {
  final int pitch; // MIDI note number (0-127)
  final int octave;
  final String step; // C, D, E, F, G, A, B
  final int? alter; // -1 = bemol, 0 = natural, 1 = sustenido
  final Duration duration;
  final Duration startTime;
  final int voice;
  final int staff;
  final bool isRest;
  final bool isChord;

  // Articulações e dinâmicas
  final String? articulation;
  final String? dynamics;
  final bool staccato;
  final bool accent;
  final bool tenuto;

  MusicXmlNote({
    required this.pitch,
    required this.octave,
    required this.step,
    this.alter,
    required this.duration,
    required this.startTime,
    this.voice = 1,
    this.staff = 1,
    this.isRest = false,
    this.isChord = false,
    this.articulation,
    this.dynamics,
    this.staccato = false,
    this.accent = false,
    this.tenuto = false,
  });

  /// Calcula a duração em ticks (PPQ)
  int get durationTicks => (duration.inMilliseconds * 0.001 * 480).round();

  @override
String toString() {
    return 'MusicXmlNote(${step}${alter == -1 ? 'b' : alter == 1 ? '#' : ''}$octave, '
        'duration: $duration, rest: $isRest)';
  }
}

/// Representa um compasso (measure) do MusicXML
class MusicXmlMeasure {
  final int number;
  final List<MusicXmlNote> notes;
  final int? beats;
  final int? beatType;
  final String? keySignature;
  final bool isNewLine;
  final bool isNewPage;

  MusicXmlMeasure({
    required this.number,
    required this.notes,
    this.beats,
    this.beatType,
    this.keySignature,
    this.isNewLine = false,
    this.isNewPage = false,
  });
}

/// Representa uma parte/instrumento do MusicXML
class MusicXmlPart {
  final String id;
  final String name;
  final String? abbreviation;
  final String? instrumentName;
  final List<MusicXmlMeasure> measures;

  // Características da parte
  final List<MusicXmlNote> allNotes;
  final int minPitch;
  final int maxPitch;
  final Duration totalDuration;

  MusicXmlPart({
    required this.id,
    required this.name,
    this.abbreviation,
    this.instrumentName,
    required this.measures,
    required this.allNotes,
    required this.minPitch,
    required this.maxPitch,
    required this.totalDuration,
  });

  /// Calcula a tessitura (range) da parte
  int get range => maxPitch - minPitch;

  /// Obtém o centro tonal (pitch médio)
  double get tessituraCenter => (minPitch + maxPitch) / 2;

  @override
  String toString() => 'MusicXmlPart($name, ${measures.length} measures, range: $minPitch-$maxPitch)';
}

/// Informações de andamento extraídas do MusicXML
class MusicXmlTempo {
  final int bpm;
  final String? displayName;
  final Duration position;

  MusicXmlTempo({
    required this.bpm,
    this.displayName,
    required this.position,
  });
}

/// Metadados gerais da partitura
class MusicXmlMetadata {
  final String? title;
  final String? subtitle;
  final String? composer;
  final String? lyricist;
  final String? arranger;
  final String? copyright;
  final int? defaultTempo;

  MusicXmlMetadata({
    this.title,
    this.subtitle,
    this.composer,
    this.lyricist,
    this.arranger,
    this.copyright,
    this.defaultTempo,
  });
}

/// Resultado completo do parsing MusicXML
class MusicXmlDocument {
  final MusicXmlMetadata metadata;
  final List<MusicXmlPart> parts;
  final List<MusicXmlTempo> tempos;
  final int? divisions;

  // Assinaturas de tempo globais
  final int? beats;
  final int? beatType;

  MusicXmlDocument({
    required this.metadata,
    required this.parts,
    required this.tempos,
    this.divisions,
    this.beats,
    this.beatType,
  });

  @override
  String toString() => 'MusicXmlDocument("${metadata.title}", ${parts.length} parts)';
}

/// Exceção lançada quando há erro no parsing
class MusicXmlParserException implements Exception {
  final String message;
  final Object? cause;

  MusicXmlParserException(this.message, [this.cause]);

  @override
  String toString() => 'MusicXmlParserException: $message${cause != null ? ' (caused by: $cause)' : ''}';
}

/// Serviço de parsing de arquivos MusicXML do MuseScore
class MusicXmlParser {
  /// Parse de string XML (formato .xml ou .mxl descompactado)
  static MusicXmlDocument parse(String xmlContent) {
    try {
      final document = XmlDocument.parse(xmlContent);
      return _parseDocument(document);
    } on XmlException catch (e) {
      throw MusicXmlParserException('Invalid XML format', e);
    } catch (e) {
      throw MusicXmlParserException('Failed to parse MusicXML', e);
    }
  }

  /// Parse de bytes (para arquivos .mxl compactados)
  static MusicXmlDocument parseBytes(List<int> bytes) {
    try {
      final content = utf8.decode(bytes);
      return parse(content);
    } catch (e) {
      throw MusicXmlParserException('Failed to decode MusicXML bytes', e);
    }
  }

  /// Parse principal do documento XML
  static MusicXmlDocument _parseDocument(XmlDocument document) {
    final root = document.rootElement;

    // Verificar se é um documento MusicXML válido
    if (root.name.local != 'score-partwise') {
      throw MusicXmlParserException('Root element must be <score-partwise>');
    }

    // Extrair metadados
    final metadata = _parseMetadata(root);

    // Extrair partes
    final parts = _parseParts(root);

    // Extrair andamentos
    final tempos = _parseTempos(root);

    // Extrair divisões (PPQ base)
    int? divisions;
    final firstPart = root.findElements('part-list').firstOrNull;
    if (firstPart != null) {
      // Tentar obter divisions do primeiro measure
    }

    // Assinaturas de tempo
    final firstMeasure = root.findAllElements('measure').firstOrNull;
    int? beats, beatType;
    if (firstMeasure != null) {
      final time = firstMeasure.findElements('time').firstOrNull;
      if (time != null) {
        beats = int.tryParse(time.findElements('beats').firstOrNull?.innerText ?? '');
        beatType = int.tryParse(time.findElements('beat-type').firstOrNull?.innerText ?? '');
      }
    }

    return MusicXmlDocument(
      metadata: metadata,
      parts: parts,
      tempos: tempos,
      divisions: divisions,
      beats: beats,
      beatType: beatType,
    );
  }

  /// Extrai metadados da partitura
  static MusicXmlMetadata _parseMetadata(XmlElement root) {
    final work = root.findElements('work').firstOrNull;
    final identification = root.findElements('identification').firstOrNull;

    String? title, subtitle;
    final movementTitle = root.findElements('movement-title').firstOrNull;
    final workTitle = work?.findElements('work-title').firstOrNull;

    title = movementTitle?.innerText ?? workTitle?.innerText;

    final movementNumber = root.findElements('movement-number').firstOrNull;
    if (movementNumber != null && title != null) {
      title = '${movementNumber.innerText}. $title';
    }

    // Subtítulo
    subtitle = root.findElements('work-number').firstOrNull?.innerText;

    // Compositor, letrista, etc.
    String? composer, lyricist, arranger, copyright;

    final creators = identification?.findElements('creator');
    if (creators != null) {
      for (final creator in creators) {
        final type = creator.getAttribute('type');
        final name = creator.innerText;
        switch (type) {
          case 'composer':
            composer = name;
            break;
          case 'lyricist':
            lyricist = name;
            break;
          case 'arranger':
            arranger = name;
            break;
        }
      }
    }

    // Copyright
    final rights = identification?.findElements('rights').firstOrNull;
    copyright = rights?.innerText;

    return MusicXmlMetadata(
      title: title,
      subtitle: subtitle,
      composer: composer,
      lyricist: lyricist,
      arranger: arranger,
      copyright: copyright,
    );
  }

  /// Extrai todas as partes da partitura
  static List<MusicXmlPart> _parseParts(XmlElement root) {
    final parts = <MusicXmlPart>[];

    // Obter lista de partes
    final partList = root.findElements('part-list').firstOrNull;
    if (partList == null) {
      throw MusicXmlParserException('No <part-list> found in document');
    }

    // Mapear ID da parte para suas informações
    final partInfo = <String, _PartInfo>{};
    for (final scorePart in partList.findElements('score-part')) {
      final id = scorePart.getAttribute('id');
      if (id == null) continue;

      final partName = scorePart.findElements('part-name').firstOrNull?.innerText ?? 'Unknown';
      final partAbbreviation = scorePart.findElements('part-abbreviation').firstOrNull?.innerText;
      final instrumentName = scorePart.findElements('instrument-name').firstOrNull?.innerText;

      partInfo[id] = _PartInfo(
        id: id,
        name: partName,
        abbreviation: partAbbreviation,
        instrumentName: instrumentName,
      );
    }

    // Parse de cada parte
    for (final partElement in root.findElements('part')) {
      final id = partElement.getAttribute('id');
      if (id == null || !partInfo.containsKey(id)) continue;

      final info = partInfo[id]!;
      final measures = _parsePartMeasures(partElement);
      final allNotes = measures.expand((m) => m.notes).toList();

      // Calcular estatísticas da parte
      if (allNotes.isEmpty) {
        parts.add(MusicXmlPart(
          id: id,
          name: info.name,
          abbreviation: info.abbreviation,
          instrumentName: info.instrumentName,
          measures: measures,
          allNotes: [],
          minPitch: 60,
          maxPitch: 60,
          totalDuration: Duration.zero,
        ));
        continue;
      }

      final pitches = allNotes.map((n) => n.pitch).toList();
      final minPitch = pitches.reduce((a, b) => a < b ? a : b);
      final maxPitch = pitches.reduce((a, b) => a > b ? a : b);

      // Duração total
      final maxEnd = allNotes.map((n) => n.startTime + n.duration).reduce((a, b) => a > b ? a : b);

      parts.add(MusicXmlPart(
        id: id,
        name: info.name,
        abbreviation: info.abbreviation,
        instrumentName: info.instrumentName,
        measures: measures,
        allNotes: allNotes,
        minPitch: minPitch,
        maxPitch: maxPitch,
        totalDuration: maxEnd,
      ));
    }

    return parts;
  }

  /// Parse dos compassos de uma parte
  static List<MusicXmlMeasure> _parsePartMeasures(XmlElement partElement) {
    final measures = <MusicXmlMeasure>[];

    // Divisões base (para conversão de duração)
    int currentDivisions = 1; // Default
    Duration currentTime = Duration.zero;

    int measureIndex = 0;
    for (final measureElement in partElement.findElements('measure')) {
      measureIndex++;
      final number = int.tryParse(measureElement.getAttribute('number') ?? '$measureIndex') ?? measureIndex;

      // Verificar mudança de divisões
      final divisionsElement = measureElement.findElements('divisions').firstOrNull;
      if (divisionsElement != null) {
        currentDivisions = int.tryParse(divisionsElement.innerText) ?? currentDivisions;
      }

      // Verificar atributos de new-line/new-page
      final isNewLine = measureElement.getAttribute('new-system') == 'yes';
      final isNewPage = measureElement.getAttribute('new-page') == 'yes';

      // Extrair assinaturas de tempo
      int? beats, beatType;
      final timeElement = measureElement.findElements('time').firstOrNull;
      if (timeElement != null) {
        beats = int.tryParse(timeElement.findElements('beats').firstOrNull?.innerText ?? '4');
        beatType = int.tryParse(timeElement.findElements('beat-type').firstOrNull?.innerText ?? '4');
      }

      // Extrair key
      final keyElement = measureElement.findElements('key').firstOrNull;
      String? keySignature;
      if (keyElement != null) {
        final fifths = keyElement.findElements('fifths').firstOrNull?.innerText;
        final mode = keyElement.findElements('mode').firstOrNull?.innerText ?? 'major';
        if (fifths != null) {
          keySignature = '$fifths $mode';
        }
      }

      // Parse notas
      final notes = <MusicXmlNote>[];
      Duration measureStartTime = currentTime;
      int currentTick = 0;

      for (final noteElement in measureElement.findElements('note')) {
        final note = _parseNote(noteElement, currentDivisions, currentTick, currentTime);
        notes.add(note);

        if (!note.isChord) {
          currentTick += note.durationTicks;
        }
        currentTime = currentTime + note.duration;
      }

      measures.add(MusicXmlMeasure(
        number: number,
        notes: notes,
        beats: beats,
        beatType: beatType,
        keySignature: keySignature,
        isNewLine: isNewLine,
        isNewPage: isNewPage,
      ));
    }

    return measures;
  }

  /// Parse de uma nota individual
  static MusicXmlNote _parseNote(XmlElement noteElement, int divisions, int tick, Duration startTime) {
    // Verificar se é pausa
    final isRest = noteElement.findElements('rest').isNotEmpty;

    // Verificar se é acorde
    final isChord = noteElement.findElements('chord').isNotEmpty;

    // Duração
    final durationElement = noteElement.findElements('duration').firstOrNull;
    final durationValue = int.tryParse(durationElement?.innerText ?? '1') ?? 1;
    // Converter divisions em segundos (assumindo quarter = 0.5s a 120bpm)
    final duration = Duration(milliseconds: (durationValue / divisions * 500).round());

    // Pitch
    final pitchElement = noteElement.findElements('pitch').firstOrNull;
    int pitch = 60; // Default C4
    int octave = 4;
    String step = 'C';
    int? alter;

    if (pitchElement != null) {
      step = pitchElement.findElements('step').firstOrNull?.innerText ?? 'C';
      octave = int.tryParse(pitchElement.findElements('octave').firstOrNull?.innerText ?? '4') ?? 4;
      alter = int.tryParse(pitchElement.findElements('alter').firstOrNull?.innerText ?? '0');

      // Converter para MIDI note number
      pitch = _stepToMidi(step, alter ?? 0, octave);
    }

    // Voice
    final voice = int.tryParse(noteElement.findElements('voice').firstOrNull?.innerText ?? '1') ?? 1;

    // Staff
    final staff = int.tryParse(noteElement.findElements('staff').firstOrNull?.innerText ?? '1') ?? 1;

    // Articulações e dinâmicas
    final notations = noteElement.findElements('notations').firstOrNull;
    final articulations = notations?.findElements('articulations').firstOrNull;

    bool staccato = false;
    bool accent = false;
    bool tenuto = false;
    String? articulation;

    if (articulations != null) {
      staccato = articulations.findElements('staccato').isNotEmpty;
      accent = articulations.findElements('accent').isNotEmpty;
      tenuto = articulations.findElements('tenuto').isNotEmpty;
    }

    // Dinâmicas
    final dynamics = notations?.findElements('dynamics').firstOrNull;
    String? dynamicMark;
    if (dynamics != null) {
      final dynamicElements = ['pppp', 'ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'ffff'];
      for (final d in dynamicElements) {
        if (dynamics.findElements(d).isNotEmpty) {
          dynamicMark = d;
          break;
        }
      }
    }

    return MusicXmlNote(
      pitch: pitch,
      octave: octave,
      step: step,
      alter: alter,
      duration: duration,
      startTime: startTime,
      voice: voice,
      staff: staff,
      isRest: isRest,
      isChord: isChord,
      articulation: articulation,
      dynamics: dynamicMark,
      staccato: staccato,
      accent: accent,
      tenuto: tenuto,
    );
  }

  /// Extrai andamentos da partitura
  static List<MusicXmlTempo> _parseTempos(XmlElement root) {
    final tempos = <MusicXmlTempo>[];

    for (final direction in root.findAllElements('direction')) {
      final sound = direction.findElements('sound').firstOrNull;
      if (sound == null) continue;

      final tempo = sound.getAttribute('tempo');
      if (tempo == null) continue;

      final bpm = int.tryParse(tempo);
      if (bpm == null) continue;

      // Calcular posição do andamento
      final placement = direction.getAttribute('placement');
      final staff = int.tryParse(direction.getAttribute('staff') ?? '1') ?? 1;

      // Obter posição (estimada - precisa ser refinada para ser precisa)
      final measure = direction.parent?.getAttribute('number') ?? '0';
      final position = Duration(seconds: int.tryParse(measure) ?? 0 * 2);

      tempos.add(MusicXmlTempo(
        bpm: bpm,
        displayName: direction.findElements('words').firstOrNull?.innerText,
        position: position,
      ));
    }

    return tempos;
  }

  /// Converte nome da nota (C, D, etc.) e alteração para MIDI note
  static int _stepToMidi(String step, int alter, int octave) {
    final steps = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11};
    final baseNote = steps[step] ?? 0;
    return (octave + 1) * 12 + baseNote + alter;
  }
}

/// Classe auxiliar para informações da parte
class _PartInfo {
  final String id;
  final String name;
  final String? abbreviation;
  final String? instrumentName;

  _PartInfo({
    required this.id,
    required this.name,
    this.abbreviation,
    this.instrumentName,
  });
}
