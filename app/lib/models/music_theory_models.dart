/// Music Theory Models
/// Contains scales, chords, progressions, instruments, and theory data
library;

class LocalizedName {
  final String pt;
  final String en;

  const LocalizedName({
    required this.pt,
    required this.en,
  });

  factory LocalizedName.fromJson(Map<String, dynamic> json) {
    return LocalizedName(
      pt: json['pt'] as String,
      en: json['en'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pt': pt,
      'en': en,
    };
  }
}

enum ScaleType {
  major('major'),
  minor('minor'),
  pentatonic('pentatonic'),
  modal('modal'),
  exotic('exotic'),
  blues('blues'),
  brega('brega'),
  forro('forro');

  final String value;

  const ScaleType(this.value);

  static ScaleType fromString(String value) {
    return ScaleType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ScaleType.major,
    );
  }
}

enum ChordType {
  triad('triad'),
  seventh('seventh'),
  extended('extended'),
  altered('altered');

  final String value;

  const ChordType(this.value);

  static ChordType fromString(String value) {
    return ChordType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ChordType.triad,
    );
  }
}

enum InstrumentFamily {
  woodwinds('woodwinds'),
  brass('brass'),
  strings('strings'),
  percussion('percussion'),
  keyboard('keyboard'),
  vocal('vocal'),
  synth('synth'),
  regional('regional');

  final String value;

  const InstrumentFamily(this.value);

  static InstrumentFamily fromString(String value) {
    return InstrumentFamily.values.firstWhere(
      (family) => family.value == value,
      orElse: () => InstrumentFamily.synth,
    );
  }
}

enum Clef {
  treble('treble'),
  bass('bass'),
  alto('alto'),
  tenor('tenor'),
  percussion('percussion');

  final String value;

  const Clef(this.value);

  static Clef fromString(String value) {
    return Clef.values.firstWhere(
      (clef) => clef.value == value,
      orElse: () => Clef.treble,
    );
  }
}

class MusicScale {
  final String id;
  final LocalizedName name;
  final int root; // 0-11 (C=0, B=11)
  final List<int> intervals;
  final ScaleType type;
  final List<String> tags;
  final List<String> chords;
  final String? regionalStyle;

  MusicScale({
    required this.id,
    required this.name,
    required this.root,
    required this.intervals,
    required this.type,
    required this.tags,
    required this.chords,
    this.regionalStyle,
  });

  factory MusicScale.fromJson(Map<String, dynamic> json) {
    return MusicScale(
      id: json['id'] as String,
      name: LocalizedName.fromJson(json['name'] as Map<String, dynamic>),
      root: json['root'] as int,
      intervals: List<int>.from(json['intervals'] as List),
      type: ScaleType.fromString(json['type'] as String),
      tags: List<String>.from(json['tags'] as List? ?? []),
      chords: List<String>.from(json['chords'] as List? ?? []),
      regionalStyle: json['regional_style'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name.toJson(),
      'root': root,
      'intervals': intervals,
      'type': type.value,
      'tags': tags,
      'chords': chords,
      if (regionalStyle != null) 'regional_style': regionalStyle,
    };
  }

  /// Get scale notes as MIDI pitch numbers
  List<int> get notes {
    return intervals.map((interval) => root + interval).toList();
  }

  String get displayName => name.pt;
}

class Voicing {
  final String name;
  final List<int> notes; // Intervals above bass
  final String style;
  final String? regionalStyle;

  Voicing({
    required this.name,
    required this.notes,
    required this.style,
    this.regionalStyle,
  });

  factory Voicing.fromJson(Map<String, dynamic> json) {
    return Voicing(
      name: json['name'] as String,
      notes: List<int>.from(json['notes'] as List),
      style: json['style'] as String,
      regionalStyle: json['regional_style'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'notes': notes,
      'style': style,
      if (regionalStyle != null) 'regional_style': regionalStyle,
    };
  }
}

class MusicChord {
  final String id;
  final LocalizedName name;
  final List<String> symbols;
  final int root;
  final List<int> intervals;
  final ChordType type;
  final String? function;
  final List<String> scales;
  final List<Voicing> voicings;

  MusicChord({
    required this.id,
    required this.name,
    required this.symbols,
    required this.root,
    required this.intervals,
    required this.type,
    this.function,
    required this.scales,
    required this.voicings,
  });

  factory MusicChord.fromJson(Map<String, dynamic> json) {
    return MusicChord(
      id: json['id'] as String,
      name: LocalizedName.fromJson(json['name'] as Map<String, dynamic>),
      symbols: List<String>.from(json['symbols'] as List),
      root: json['root'] as int,
      intervals: List<int>.from(json['intervals'] as List),
      type: ChordType.fromString(json['type'] as String),
      function: json['function'] as String?,
      scales: List<String>.from(json['scales'] as List? ?? []),
      voicings: (json['voicings'] as List<dynamic>?)
              ?.map((v) => Voicing.fromJson(v as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name.toJson(),
      'symbols': symbols,
      'root': root,
      'intervals': intervals,
      'type': type.value,
      if (function != null) 'function': function,
      'scales': scales,
      'voicings': voicings.map((v) => v.toJson()).toList(),
    };
  }

  /// Get chord notes as MIDI pitch numbers
  List<int> get notes {
    return intervals.map((interval) => root + interval).toList();
  }

  String get displayName => name.pt;
  String get primarySymbol => symbols.isNotEmpty ? symbols[0] : '';
}

enum ProgressionCategory {
  jazz('jazz'),
  pop('pop'),
  classical('classical'),
  blues('blues'),
  brega('brega'),
  forro('forro'),
  tecnobrega('tecnobrega');

  final String value;

  const ProgressionCategory(this.value);

  static ProgressionCategory fromString(String value) {
    return ProgressionCategory.values.firstWhere(
      (cat) => cat.value == value,
      orElse: () => ProgressionCategory.pop,
    );
  }
}

class MusicProgression {
  final String id;
  final LocalizedName name;
  final List<String> chords;
  final ProgressionCategory category;
  final LocalizedName description;
  final List<String> commonKeys;
  final List<String>? variations;
  final String partimentoSchema;

  MusicProgression({
    required this.id,
    required this.name,
    required this.chords,
    required this.category,
    required this.description,
    required this.commonKeys,
    this.variations,
    required this.partimentoSchema,
  });

  factory MusicProgression.fromJson(Map<String, dynamic> json) {
    return MusicProgression(
      id: json['id'] as String,
      name: LocalizedName.fromJson(json['name'] as Map<String, dynamic>),
      chords: List<String>.from(json['chords'] as List),
      category: ProgressionCategory.fromString(json['category'] as String),
      description: LocalizedName.fromJson(
        json['description'] as Map<String, dynamic>,
      ),
      commonKeys: List<String>.from(json['commonKeys'] as List? ?? []),
      variations: json['variations'] != null
          ? List<String>.from(json['variations'] as List)
          : null,
      partimentoSchema: json['partimento_schema'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name.toJson(),
      'chords': chords,
      'category': category.value,
      'description': description.toJson(),
      'commonKeys': commonKeys,
      if (variations != null) 'variations': variations,
      'partimento_schema': partimentoSchema,
    };
  }

  String get displayName => name.pt;
  String get descriptionPt => description.pt;
}

class InstrumentRange {
  final int lowest;
  final int highest;
  final InstrumentPracticalRange practical;

  InstrumentRange({
    required this.lowest,
    required this.highest,
    required this.practical,
  });

  factory InstrumentRange.fromJson(Map<String, dynamic> json) {
    return InstrumentRange(
      lowest: json['lowest'] as int,
      highest: json['highest'] as int,
      practical: InstrumentPracticalRange.fromJson(
        json['practical'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lowest': lowest,
      'highest': highest,
      'practical': practical.toJson(),
    };
  }
}

class InstrumentPracticalRange {
  final int lowest;
  final int highest;

  InstrumentPracticalRange({
    required this.lowest,
    required this.highest,
  });

  factory InstrumentPracticalRange.fromJson(Map<String, dynamic> json) {
    return InstrumentPracticalRange(
      lowest: json['lowest'] as int,
      highest: json['highest'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lowest': lowest,
      'highest': highest,
    };
  }
}

class DynamicsRange {
  final int pp;
  final int ff;

  DynamicsRange({
    required this.pp,
    required this.ff,
  });

  factory DynamicsRange.fromJson(Map<String, dynamic> json) {
    return DynamicsRange(
      pp: json['pp'] as int,
      ff: json['ff'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pp': pp,
      'ff': ff,
    };
  }
}

class MusicInstrument {
  final String id;
  final LocalizedName name;
  final InstrumentFamily family;
  final InstrumentRange range;
  final int transposition;
  final Clef clef;
  final int midiProgram;
  final List<String> articulations;
  final DynamicsRange dynamics;
  final List<String> commonIn;
  final String? xps10Category;
  final String? regionalRole;

  MusicInstrument({
    required this.id,
    required this.name,
    required this.family,
    required this.range,
    required this.transposition,
    required this.clef,
    required this.midiProgram,
    required this.articulations,
    required this.dynamics,
    required this.commonIn,
    this.xps10Category,
    this.regionalRole,
  });

  factory MusicInstrument.fromJson(Map<String, dynamic> json) {
    return MusicInstrument(
      id: json['id'] as String,
      name: LocalizedName.fromJson(json['name'] as Map<String, dynamic>),
      family: InstrumentFamily.fromString(json['family'] as String),
      range: InstrumentRange.fromJson(json['range'] as Map<String, dynamic>),
      transposition: json['transposition'] as int,
      clef: Clef.fromString(json['clef'] as String),
      midiProgram: json['midiProgram'] as int,
      articulations: List<String>.from(json['articulations'] as List),
      dynamics: DynamicsRange.fromJson(json['dynamics'] as Map<String, dynamic>),
      commonIn: List<String>.from(json['commonIn'] as List? ?? []),
      xps10Category: json['xps10Category'] as String?,
      regionalRole: json['regional_role'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name.toJson(),
      'family': family.value,
      'range': range.toJson(),
      'transposition': transposition,
      'clef': clef.value,
      'midiProgram': midiProgram,
      'articulations': articulations,
      'dynamics': dynamics.toJson(),
      'commonIn': commonIn,
      if (xps10Category != null) 'xps10Category': xps10Category,
      if (regionalRole != null) 'regional_role': regionalRole,
    };
  }

  String get displayName => name.pt;
}

class PartimentoRule {
  final int bassDegree;
  final List<int> voicing;
  final List<int>? forbiddenIntervals;
  final String? regionalException;

  PartimentoRule({
    required this.bassDegree,
    required this.voicing,
    this.forbiddenIntervals,
    this.regionalException,
  });

  factory PartimentoRule.fromJson(Map<String, dynamic> json) {
    return PartimentoRule(
      bassDegree: json['bass_degree'] as int,
      voicing: List<int>.from(json['voicing'] as List),
      forbiddenIntervals: json['forbidden_intervals'] != null
          ? List<int>.from(json['forbidden_intervals'] as List)
          : null,
      regionalException: json['regional_exception'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bass_degree': bassDegree,
      'voicing': voicing,
      if (forbiddenIntervals != null) 'forbidden_intervals': forbiddenIntervals,
      if (regionalException != null) 'regional_exception': regionalException,
    };
  }
}

class CounterpointRule {
  final int species;
  final List<String> forbiddenMovements;
  final List<String> requiredResolutions;

  CounterpointRule({
    required this.species,
    required this.forbiddenMovements,
    required this.requiredResolutions,
  });

  factory CounterpointRule.fromJson(Map<String, dynamic> json) {
    return CounterpointRule(
      species: json['species'] as int,
      forbiddenMovements:
          List<String>.from(json['forbidden_movements'] as List? ?? []),
      requiredResolutions:
          List<String>.from(json['required_resolutions'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'species': species,
      'forbidden_movements': forbiddenMovements,
      'required_resolutions': requiredResolutions,
    };
  }
}

class GenreTemplate {
  final String id;
  final String name;
  final String category;
  final TempoRange tempoRange;
  final TimeSignatureData timeSignature;
  final List<String> typicalKeys;
  final String partimentoSchema;
  final List<String> harmonicRules;
  final GrooveTemplate grooveTemplate;
  final TypicalInstrumentation typicalInstrumentation;
  final MixTemplate mixTemplate;
  final List<String> culturalReferences;
  final List<String> representativeArtists;

  GenreTemplate({
    required this.id,
    required this.name,
    required this.category,
    required this.tempoRange,
    required this.timeSignature,
    required this.typicalKeys,
    required this.partimentoSchema,
    required this.harmonicRules,
    required this.grooveTemplate,
    required this.typicalInstrumentation,
    required this.mixTemplate,
    required this.culturalReferences,
    required this.representativeArtists,
  });

  factory GenreTemplate.fromJson(Map<String, dynamic> json) {
    return GenreTemplate(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      tempoRange: TempoRange.fromJson(
        json['tempo_range'] as Map<String, dynamic>,
      ),
      timeSignature: TimeSignatureData.fromJson(
        json['time_signature'] as Map<String, dynamic>,
      ),
      typicalKeys: List<String>.from(json['typical_keys'] as List? ?? []),
      partimentoSchema: json['partimento_schema'] as String,
      harmonicRules: List<String>.from(json['harmonic_rules'] as List? ?? []),
      grooveTemplate: GrooveTemplate.fromJson(
        json['groove_template'] as Map<String, dynamic>,
      ),
      typicalInstrumentation: TypicalInstrumentation.fromJson(
        json['typical_instrumentation'] as Map<String, dynamic>,
      ),
      mixTemplate: MixTemplate.fromJson(
        json['mix_template'] as Map<String, dynamic>,
      ),
      culturalReferences:
          List<String>.from(json['cultural_references'] as List? ?? []),
      representativeArtists:
          List<String>.from(json['representative_artists'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'tempo_range': tempoRange.toJson(),
      'time_signature': timeSignature.toJson(),
      'typical_keys': typicalKeys,
      'partimento_schema': partimentoSchema,
      'harmonic_rules': harmonicRules,
      'groove_template': grooveTemplate.toJson(),
      'typical_instrumentation': typicalInstrumentation.toJson(),
      'mix_template': mixTemplate.toJson(),
      'cultural_references': culturalReferences,
      'representative_artists': representativeArtists,
    };
  }
}

class TempoRange {
  final int min;
  final int max;

  TempoRange({required this.min, required this.max});

  factory TempoRange.fromJson(Map<String, dynamic> json) {
    return TempoRange(
      min: json['min'] as int,
      max: json['max'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'min': min,
      'max': max,
    };
  }
}

class TimeSignatureData {
  final int numerator;
  final int denominator;

  TimeSignatureData({required this.numerator, required this.denominator});

  factory TimeSignatureData.fromJson(Map<String, dynamic> json) {
    return TimeSignatureData(
      numerator: json['numerator'] as int,
      denominator: json['denominator'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'numerator': numerator,
      'denominator': denominator,
    };
  }
}

class GrooveTemplate {
  final double swing;
  final List<double> accentPattern;
  final List<double> microTiming;

  GrooveTemplate({
    required this.swing,
    required this.accentPattern,
    required this.microTiming,
  });

  factory GrooveTemplate.fromJson(Map<String, dynamic> json) {
    return GrooveTemplate(
      swing: (json['swing'] as num).toDouble(),
      accentPattern: List<double>.from(json['accent_pattern'] as List),
      microTiming: List<double>.from(json['micro_timing'] as List),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'swing': swing,
      'accent_pattern': accentPattern,
      'micro_timing': microTiming,
    };
  }
}

class TypicalInstrumentation {
  final List<String> rhythm;
  final List<String> harmony;
  final List<String> melody;
  final List<String> bass;

  TypicalInstrumentation({
    required this.rhythm,
    required this.harmony,
    required this.melody,
    required this.bass,
  });

  factory TypicalInstrumentation.fromJson(Map<String, dynamic> json) {
    return TypicalInstrumentation(
      rhythm: List<String>.from(json['rhythm'] as List? ?? []),
      harmony: List<String>.from(json['harmony'] as List? ?? []),
      melody: List<String>.from(json['melody'] as List? ?? []),
      bass: List<String>.from(json['bass'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rhythm': rhythm,
      'harmony': harmony,
      'melody': melody,
      'bass': bass,
    };
  }
}

class MixTemplate {
  final int reverbDamp;
  final int compressionRatio;
  final int stereoWidth;
  final int bassBoost;

  MixTemplate({
    required this.reverbDamp,
    required this.compressionRatio,
    required this.stereoWidth,
    required this.bassBoost,
  });

  factory MixTemplate.fromJson(Map<String, dynamic> json) {
    return MixTemplate(
      reverbDamp: json['reverb_damp'] as int,
      compressionRatio: json['compression_ratio'] as int,
      stereoWidth: json['stereo_width'] as int,
      bassBoost: json['bass_boost'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reverb_damp': reverbDamp,
      'compression_ratio': compressionRatio,
      'stereo_width': stereoWidth,
      'bass_boost': bassBoost,
    };
  }
}
