import '../import/musicxml_parser.dart';
import '../../models/patch_model.dart';

/// Categorias de instrumentos do XPS-10
enum Xps10Category {
  piano('PNO', 'Piano'),
  ePiano('EP', 'E.Piano'),
  organ('ORG', 'Organ'),
  brass('BRS', 'Brass'),
  strings('STR', 'Strings'),
  woodwind('WW', 'Woodwind'),
  synth('SYN', 'Synth'),
  bass('BAS', 'Bass'),
  percussion('PRC', 'Percussion'),
  ensemble('ENS', 'Ensemble'),
  fx('FX', 'FX');

  final String code;
  final String displayName;

  const Xps10Category(this.code, this.displayName);

  /// Converte nome do instrumento MusicXML para categoria XPS-10
  static Xps10Category fromInstrumentName(String name) {
    final lowerName = name.toLowerCase();

    // Piano (acústico)
    if (lowerName.contains('piano') && !lowerName.contains('electric')) {
      return Xps10Category.piano;
    }

    // Piano elétrico
    if (lowerName.contains('electric') ||
        lowerName.contains('e.piano') ||
        lowerName.contains('epiano') ||
        lowerName.contains('rhodes') ||
        lowerName.contains('wurlitzer')) {
      return Xps10Category.ePiano;
    }

    // Órgão
    if (lowerName.contains('organ') ||
        lowerName.contains('hammond') ||
        lowerName.contains('church')) {
      return Xps10Category.organ;
    }

    // Brass (metais)
    if (lowerName.contains('trumpet') ||
        lowerName.contains('trombone') ||
        lowerName.contains('brass') ||
        lowerName.contains('horn')) {
      return Xps10Category.brass;
    }

    // Strings (cordas)
    if (lowerName.contains('violin') ||
        lowerName.contains('viola') ||
        lowerName.contains('cello') ||
        lowerName.contains('string') ||
        lowerName.contains('ensemble')) {
      return Xps10Category.strings;
    }

    // Woodwinds (madeiras)
    if (lowerName.contains('flute') ||
        lowerName.contains('clarinet') ||
        lowerName.contains('saxophone') ||
        lowerName.contains('oboe') ||
        lowerName.contains('bassoon')) {
      return Xps10Category.woodwind;
    }

    // Synth
    if (lowerName.contains('synth') ||
        lowerName.contains('synthesizer') ||
        lowerName.contains('lead') ||
        lowerName.contains('pad')) {
      return Xps10Category.synth;
    }

    // Bass
    if (lowerName.contains('bass')) {
      return Xps10Category.bass;
    }

    // Percussão
    if (lowerName.contains('drum') ||
        lowerName.contains('percussion') ||
        lowerName.contains('timpani')) {
      return Xps10Category.percussion;
    }

    // FX
    if (lowerName.contains('fx') ||
        lowerName.contains('effect') ||
        lowerName.contains('sfx')) {
      return Xps10Category.fx;
    }

    // Ensemble
    if (lowerName.contains('orchestra') || lowerName.contains('band')) {
      return Xps10Category.ensemble;
    }

    // Default: Synth (mais versátil)
    return Xps10Category.synth;
  }
}

/// Preset base para um tipo de instrumento
class Xps10PresetBase {
  final Xps10Category category;
  final String name;
  final Map<String, double> baseParameters;
  final String waveType; // saw, square, triangle, sine, etc.

  Xps10PresetBase({
    required this.category,
    required this.name,
    required this.baseParameters,
    required this.waveType,
  });
}

/// Presets base do XPS-10 para mapeamento
class Xps10PresetLibrary {
  static const Map<Xps10Category, Xps10PresetBase> _presets = {
    // Piano - Onda sinusoidal com ataque rápido
    Xps10Category.piano: Xps10PresetBase(
      category: Xps10Category.piano,
      name: 'Grand Piano',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
        'envAttack': 0,    // Ataque muito rápido
        'envDecay': 40,
        'envSustain': 60,
        'envRelease': 30,
        'filterCutoff': 110, // Filtro bem aberto
        'filterResonance': 30,
        'lfoRate': 0,
        'lfoDepth': 0,
        'chorusRate': 64,
        'chorusDepth': 40,
        'reverbLevel': 50,
        'ampLevel': 100,
        'pan': 64,
      },
      waveType: 'sample',
    ),

    // E-Piano - Onda quasi-sinusoidal com decay médio
    Xps10Category.ePiano: Xps10PresetBase(
      category: Xps10Category.ePiano,
      name: 'Rhodes EP',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
        'envAttack': 5,
        'envDecay': 70,
        'envSustain': 50,
        'envRelease': 50,
        'filterCutoff': 95,
        'filterResonance': 25,
        'lfoRate': 45,   // LFO leve para tremolo
        'lfoDepth': 20,
        'chorusRate': 64,
        'chorusDepth': 50,
        'reverbLevel': 40,
        'ampLevel': 95,
        'pan': 64,
      },
      waveType: 'triangle',
    ),

    // Organ - Onda quadrada com sustain longo
    Xps10Category.organ: Xps10PresetBase(
      category: Xps10Category.organ,
      name: 'Drawbar Organ',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
        'envAttack': 0,
        'envDecay': 0,
        'envSustain': 127, // Sustain máximo
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
      },
      waveType: 'square',
    ),

    // Brass - Onda dente-de-serra com ataque rápido
    Xps10Category.brass: Xps10PresetBase(
      category: Xps10Category.brass,
      name: 'Brass Section',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
        'envAttack': 15,   // Ataque rápido mas não instantâneo
        'envDecay': 30,
        'envSustain': 90,
        'envRelease': 25,
        'filterCutoff': 85,
        'filterResonance': 40,
        'lfoRate': 55,     // Vibrato leve
        'lfoDepth': 25,
        'chorusRate': 64,
        'chorusDepth': 45,
        'reverbLevel': 35,
        'ampLevel': 100,
        'pan': 64,
      },
      waveType: 'sawtooth',
    ),

    // Strings - Onda dente-de-serra com ataque suave
    Xps10Category.strings: Xps10PresetBase(
      category: Xps10Category.strings,
      name: 'String Ensemble',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 62,   // Leve detune para espalhar
        'envAttack': 50,      // Ataque suave
        'envDecay': 20,
        'envSustain': 100,
        'envRelease': 60,     // Release longo
        'filterCutoff': 75,
        'filterResonance': 25,
        'lfoRate': 40,
        'lfoDepth': 15,
        'chorusRate': 70,
        'chorusDepth': 65,
        'reverbLevel': 55,
        'ampLevel': 90,
        'pan': 64,
      },
      waveType: 'sawtooth',
    ),

    // Woodwinds - Onda triangular com ataque médio
    Xps10Category.woodwind: Xps10PresetBase(
      category: Xps10Category.woodwind,
      name: 'Flute & Clarinet',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
        'envAttack': 35,
        'envDecay': 25,
        'envSustain': 80,
        'envRelease': 40,
        'filterCutoff': 90,
        'filterResonance': 20,
        'lfoRate': 60,      // Vibrato expressivo
        'lfoDepth': 35,
        'chorusRate': 55,
        'chorusDepth': 30,
        'reverbLevel': 40,
        'ampLevel': 85,
        'pan': 64,
      },
      waveType: 'triangle',
    ),

    // Synth - Dente-de-serra com filtros expressivos
    Xps10Category.synth: Xps10PresetBase(
      category: Xps10Category.synth,
      name: 'Analog Synth',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 62,
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
      },
      waveType: 'sawtooth',
    ),

    // Bass - Onda quadrada/saw grave
    Xps10Category.bass: Xps10PresetBase(
      category: Xps10Category.bass,
      name: 'Synth Bass',
      baseParameters: {
        'oscPitchCoarse': 40,   // Oitava abaixo
        'oscPitchFine': 64,
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
      },
      waveType: 'square',
    ),

    // Percussão - Noise ou transientes
    Xps10Category.percussion: Xps10PresetBase(
      category: Xps10Category.percussion,
      name: 'Percussion',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 64,
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
      },
      waveType: 'noise',
    ),

    // Ensemble - Camadas múltiplas
    Xps10Category.ensemble: Xps10PresetBase(
      category: Xps10Category.ensemble,
      name: 'Orchestra Ensemble',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 62,
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
      },
      waveType: 'mixed',
    ),

    // FX - Sons experimentais
    Xps10Category.fx: Xps10PresetBase(
      category: Xps10Category.fx,
      name: 'FX Sound',
      baseParameters: {
        'oscPitchCoarse': 64,
        'oscPitchFine': 32,  // Detune extremo
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
      },
      waveType: 'sawtooth',
    ),
  };

  /// Obtém preset base por categoria
  static Xps10PresetBase? getPreset(Xps10Category category) {
    return _presets[category];
  }
}

/// Resultado do mapeamento de uma parte MusicXML para Patch
class MappedPatchResult {
  final PatchModel patch;
  final MusicXmlPart sourcePart;
  final Xps10PresetBase basePreset;
  final List<String> mappingNotes;

  MappedPatchResult({
    required this.patch,
    required this.sourcePart,
    required this.basePreset,
    required this.mappingNotes,
  });
}

/// Serviço de mapeamento de MusicXML para Patch XPS-10
class MusicXmlToPatchMapper {
  /// Mapeia uma parte MusicXML para um Patch XPS-10
  static MappedPatchResult mapPart(
    MusicXmlPart part,
    MusicXmlDocument document,
  ) {
    final notes = <String>[];

    // 1. Determinar categoria pelo nome do instrumento
    final instrumentName = part.instrumentName ?? part.name;
    final category = Xps10Category.fromInstrumentName(instrumentName);
    notes.add('Categoria: ${category.displayName} (baseado em "$instrumentName")');

    // 2. Obter preset base
    final presetBase = Xps10PresetLibrary.getPreset(category);
    if (presetBase == null) {
      throw StateError('Preset base não encontrado para categoria $category');
    }
    notes.add('Preset base: ${presetBase.name}');

    // 3. Ajustar parâmetros baseados nas características da parte
    final adjustedParameters = _adjustParametersForPart(
      presetBase.baseParameters,
      part,
      category,
    );
    notes.addAll(_generateAdjustmentNotes(part, category));

    // 4. Gerar nome do patch
    final patchName = _generatePatchName(part, document);

    // 5. Gerar tags
    final tags = _generateTags(part, document, category);

    // 6. Criar o Patch
    final patch = PatchModel(
      name: patchName,
      category: presetBase.category.code,
      tags: tags,
      macro: adjustedParameters,
      panel: <String, num>{}, // Panel vazio - será preenchido pelo editor
    );

    return MappedPatchResult(
      patch: patch,
      sourcePart: part,
      basePreset: presetBase,
      mappingNotes: notes,
    );
  }

  /// Mapeia múltiplas partes para uma setlist de patches
  static List<MappedPatchResult> mapDocument(MusicXmlDocument document) {
    final results = <MappedPatchResult>[];

    for (final part in document.parts) {
      try {
        final result = mapPart(part, document);
        results.add(result);
      } catch (e) {
        // Continuar com próxima parte em caso de erro
        continue;
      }
    }

    return results;
  }

  /// Ajusta parâmetros baseados nas características da parte
  static Map<String, double> _adjustParametersForPart(
    Map<String, double> baseParameters,
    MusicXmlPart part,
    Xps10Category category,
  ) {
    final adjusted = Map<String, double>.from(baseParameters);

    // Ajustar filtro baseado na tessitura
    final avgPitch = part.minPitch + (part.range / 2);

    // Instrumentos agudos -> filtro mais aberto
    if (avgPitch > 72) {
      adjusted['filterCutoff'] = (adjusted['filterCutoff']! * 1.1).clamp(0, 127);
    }
    // Instrumentos graves -> filtro mais fechado
    else if (avgPitch < 48) {
      adjusted['filterCutoff'] = (adjusted['filterCutoff']! * 0.9).clamp(0, 127);
    }

    // Ajustar release baseado na duração média das notas
    if (part.allNotes.isNotEmpty) {
      final avgDuration = part.allNotes
          .map((n) => n.duration)
          .reduce((a, b) => a + b) / part.allNotes.length;

      // Notas longas -> release maior
      if (avgDuration.inMilliseconds > 500) {
        adjusted['envRelease'] = (adjusted['envRelease']! * 1.3).clamp(0, 127);
        adjusted['envSustain'] = (adjusted['envSustain']! * 1.2).clamp(0, 127);
      }
      // Notas curtas (staccato) -> release menor
      else if (avgDuration.inMilliseconds < 200) {
        adjusted['envRelease'] = (adjusted['envRelease']! * 0.7).clamp(0, 127);
      }
    }

    // Ajustar LFO para vibrato expressivo em instrumentos de sopro
    if (category == Xps10Category.woodwind || category == Xps10Category.brass) {
      adjusted['lfoRate'] = 60; // ~5Hz vibrato
      adjusted['lfoDepth'] = 25;
    }

    // Detune para ensemble/strings
    if (category == Xps10Category.strings || category == Xps10Category.ensemble) {
      adjusted['oscPitchFine'] = 62; // Leve detune
    }

    return adjusted;
  }

  /// Gera notas sobre os ajustes feitos
  static List<String> _generateAdjustmentNotes(
    MusicXmlPart part,
    Xps10Category category,
  ) {
    final notes = <String>[];

    // Tessitura
    final avgPitch = part.minPitch + (part.range / 2);
    notes.add('Tessitura média: ${(avgPitch / 12).toStringAsFixed(1)} oitavas');

    // Range
    if (part.range > 24) {
      notes.add('Range extenso: ${part.range} semitons');
    }

    // Dinâmicas
    final hasDynamics = part.allNotes.any((n) => n.dynamics != null);
    if (hasDynamics) {
      notes.add('Parte possui dinâmicas expressivas');
    }

    return notes;
  }

  /// Gera nome do patch baseado na parte e documento
  static String _generatePatchName(
    MusicXmlPart part,
    MusicXmlDocument document,
  ) {
    final buffer = StringBuffer();

    // Título da obra
    if (document.metadata.title != null) {
      final title = document.metadata.title!.replaceAll(' ', '_');
      buffer.write('${title}_');
    }

    // Nome da parte/instrumento
    buffer.write(part.name.replaceAll(' ', '_'));

    // Limitar tamanho
    final name = buffer.toString();
    if (name.length > 30) {
      return name.substring(0, 30);
    }

    return name;
  }

  /// Gera tags para o patch
  static List<String> _generateTags(
    MusicXmlPart part,
    MusicXmlDocument document,
    Xps10Category category,
  ) {
    final tags = <String>[];

    // Categoria
    tags.add(category.displayName);

    // Instrumento
    if (part.instrumentName != null) {
      tags.add(part.instrumentName!);
    }

    // Metadados
    if (document.metadata.composer != null) {
      tags.add(document.metadata.composer!);
    }

    // Gênero/estilo (inferido do nome da obra)
    final title = document.metadata.title?.toLowerCase() ?? '';
    if (title.contains('sonata') || title.contains('concerto')) {
      tags.add('classical');
    } else if (title.contains('jazz')) {
      tags.add('jazz');
    } else if (title.contains('soundtrack') || title.contains('film')) {
      tags.add('soundtrack');
    }

    return tags;
  }
}
