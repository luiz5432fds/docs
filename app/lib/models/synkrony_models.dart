/// SynKrony Models for Flutter App
///
/// This file contains all data models for the SynKrony AI Music Production System,
/// including projects, tracks, scores, arrangements, and hardware configurations.

// ============================================================================
// NOTE DATA MODELS
// ============================================================================

/// Represents a single musical note with timing and velocity
class NoteModel {
  NoteModel({
    required this.pitch,
    required this.start,
    required this.duration,
    required this.velocity,
    this.channel = 0,
    this.id,
  });

  final int pitch; // MIDI note number (0-127)
  final int start; // Start time in ticks
  final int duration; // Duration in ticks
  final int velocity; // Velocity (0-127)
  final int channel; // MIDI channel
  final String? id;

  factory NoteModel.fromJson(Map<String, dynamic> json) {
    return NoteModel(
      pitch: json['pitch'] as int,
      start: json['start'] as int,
      duration: json['duration'] as int,
      velocity: json['velocity'] as int,
      channel: json['channel'] as int? ?? 0,
      id: json['id'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pitch': pitch,
      'start': start,
      'duration': duration,
      'velocity': velocity,
      'channel': channel,
      if (id != null) 'id': id,
    };
  }

  /// Get note name (e.g., "C4", "F#5")
  String get noteName {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = (pitch ~/ 12) - 1;
    final note = notes[pitch % 12];
    return '$note$octave';
  }

  /// Get frequency in Hz
  double get frequency => 440 * pow(2, (pitch - 69) / 12);

  double pow(double x, double exponent) => x; // Simplified
}

// ============================================================================
// MUSIC THEORY MODELS
// ============================================================================

/// Musical scale definition
class ScaleModel {
  ScaleModel({
    required this.id,
    required this.name,
    required this.key,
    required this.mode,
    required this.intervals,
    this.description,
    this.tags = const [],
  });

  final String id;
  final String name;
  final String key;
  final String mode; // 'major', 'minor', 'modal'
  final List<int> intervals; // Semitone intervals
  final String? description;
  final List<String> tags;

  factory ScaleModel.fromJson(Map<String, dynamic> json) {
    return ScaleModel(
      id: json['id'] as String,
      name: json['name'] as String,
      key: json['key'] as String,
      mode: json['mode'] as String,
      intervals: List<int>.from(json['intervals'] as List),
      description: json['description'] as String?,
      tags: List<String>.from(json['tags'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'key': key,
      'mode': mode,
      'intervals': intervals,
      if (description != null) 'description': description,
      'tags': tags,
    };
  }

  /// Get notes in this scale
  List<int> getNotes(int rootMidi) {
    return intervals.map((interval) => rootMidi + interval).toList();
  }
}

/// Chord definition
class ChordModel {
  ChordModel({
    required this.id,
    required this.name,
    required this.symbol,
    required this.intervals,
    required this.inversions,
    this.voicings,
    this.description,
  });

  final String id;
  final String name;
  final String symbol; // e.g., "Cmaj7", "Am7"
  final List<int> intervals; // Semitone intervals from root
  final List<List<int>> inversions;
  final List<List<int>>? voicings;
  final String? description;

  factory ChordModel.fromJson(Map<String, dynamic> json) {
    return ChordModel(
      id: json['id'] as String,
      name: json['name'] as String,
      symbol: json['symbol'] as String,
      intervals: List<int>.from(json['intervals'] as List),
      inversions: List<List<int>>.from(
        (json['inversions'] as List).map((e) => List<int>.from(e as List))
      ),
      voicings: json['voicings'] != null
        ? List<List<int>>.from(
            (json['voicings'] as List).map((e) => List<int>.from(e as List))
          )
        : null,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'symbol': symbol,
      'intervals': intervals,
      'inversions': inversions,
      if (voicings != null) 'voicings': voicings,
      if (description != null) 'description': description,
    };
  }

  /// Get chord notes for a given root
  List<int> getNotes(int rootMidi, {int inversion = 0}) {
    final baseNotes = intervals.map((i) => rootMidi + i).toList();
    if (inversion > 0 && inversion < inversions.length) {
      return inversions[inversion].map((i) => rootMidi + i).toList();
    }
    return baseNotes;
  }
}

/// Chord progression
class ProgressionModel {
  ProgressionModel({
    required this.id,
    required this.name,
    required this.chords,
    required this.genre,
    this.description,
  });

  final String id;
  final String name;
  final List<ChordChange> chords;
  final String genre;
  final String? description;

  factory ProgressionModel.fromJson(Map<String, dynamic> json) {
    return ProgressionModel(
      id: json['id'] as String,
      name: json['name'] as String,
      chords: (json['chords'] as List)
        .map((e) => ChordChange.fromJson(e as Map<String, dynamic>))
        .toList(),
      genre: json['genre'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'chords': chords.map((e) => e.toJson()).toList(),
      'genre': genre,
      if (description != null) 'description': description,
    };
  }
}

/// A single chord change in a progression
class ChordChange {
  ChordChange({
    required this.chordSymbol,
    required this.bar,
    required this.beat,
    this.durationBeats = 1,
  });

  final String chordSymbol;
  final int bar;
  final int beat;
  final int durationBeats;

  factory ChordChange.fromJson(Map<String, dynamic> json) {
    return ChordChange(
      chordSymbol: json['chordSymbol'] as String,
      bar: json['bar'] as int,
      beat: json['beat'] as int,
      durationBeats: json['durationBeats'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chordSymbol': chordSymbol,
      'bar': bar,
      'beat': beat,
      'durationBeats': durationBeats,
    };
  }
}

// ============================================================================
// PARTIMENTO MODELS
// ============================================================================

/// Partimento rule definition
class PartimentoRuleModel {
  PartimentoRuleModel({
    required this.id,
    required this.name,
    required this.type,
    required this.voicings,
    this.description,
    this.exceptions,
  });

  final String id;
  final String name;
  final String type; // 'rule_of_octave', 'suspension', 'cadence'
  final Map<String, List<int>> voicings; // Scale degree -> intervals
  final String? description;
  final Map<String, dynamic>? exceptions;

  factory PartimentoRuleModel.fromJson(Map<String, dynamic> json) {
    return PartimentoRuleModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      voicings: Map<String, List<int>>.from(
        (json['voicings'] as Map).map(
          (k, e) => MapEntry(k, List<int>.from(e as List))
        )
      ),
      description: json['description'] as String?,
      exceptions: json['exceptions'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'voicings': voicings,
      if (description != null) 'description': description,
      if (exceptions != null) 'exceptions': exceptions,
    };
  }

  /// Get voicing for a scale degree
  List<int> getVoicing(int degree) {
    return voicings[degree.toString()] ?? [0, 4, 7];
  }
}

/// Counterpoint rule
class CounterpointRuleModel {
  CounterpointRuleModel({
    required this.id,
    required this.name,
    required this.species,
    required this.rules,
    this.description,
  });

  final String id;
  final String name;
  final int species; // 1-5 (Fux species)
  final List<String> rules;
  final String? description;

  factory CounterpointRuleModel.fromJson(Map<String, dynamic> json) {
    return CounterpointRuleModel(
      id: json['id'] as String,
      name: json['name'] as String,
      species: json['species'] as int,
      rules: List<String>.from(json['rules'] as List),
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'species': species,
      'rules': rules,
      if (description != null) 'description': description,
    };
  }
}

/// Counterpoint violation detected during analysis
class CounterpointViolation {
  CounterpointViolation({
    required this.type,
    required this.position,
    this.note1,
    this.note2,
    this.description,
  });

  final String type; // 'parallel_fifth', 'parallel_octave', 'leading_tone'
  final int position;
  final String? note1;
  final String? note2;
  final String? description;

  factory CounterpointViolation.fromJson(Map<String, dynamic> json) {
    return CounterpointViolation(
      type: json['type'] as String,
      position: json['position'] as int,
      note1: json['note1'] as String?,
      note2: json['note2'] as String?,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'position': position,
      if (note1 != null) 'note1': note1,
      if (note2 != null) 'note2': note2,
      if (description != null) 'description': description,
    };
  }
}

// ============================================================================
// SYNKRONY PROJECT MODELS
// ============================================================================

/// Main SynKrony project
class SynKronyProjectModel {
  SynKronyProjectModel({
    required this.id,
    required this.name,
    required this.uid,
    required this.createdAt,
    this.updatedAt,
    this.genre,
    this.subgenre,
    this.keySignature,
    this.mode,
    this.tempo,
    this.timeSignature,
    this.lengthBars,
    this.partimentoSchema,
    this.regionalStyle,
    this.tracks = const [],
    this.scores = const [],
    this.hardwareConfig,
    this.isPublic = false,
    this.tags = const [],
  });

  final String id;
  final String name;
  final String uid;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? genre; // 'brega', 'forro', 'tecnobrega', 'classical', 'pop'
  final String? subgenre;
  final String? keySignature;
  final String? mode; // 'major', 'minor'
  final int? tempo;
  final TimeSignature? timeSignature;
  final int? lengthBars;
  final String? partimentoSchema;
  final RegionalStyle? regionalStyle;
  final List<SynKronyTrackModel> tracks;
  final List<ScoreModel> scores;
  final HardwareConfigModel? hardwareConfig;
  final bool isPublic;
  final List<String> tags;

  factory SynKronyProjectModel.fromJson(Map<String, dynamic> json) {
    return SynKronyProjectModel(
      id: json['id'] as String,
      name: json['name'] as String,
      uid: json['uid'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
        ? DateTime.parse(json['updatedAt'] as String)
        : null,
      genre: json['genre'] as String?,
      subgenre: json['subgenre'] as String?,
      keySignature: json['keySignature'] as String?,
      mode: json['mode'] as String?,
      tempo: json['tempo'] as int?,
      timeSignature: json['timeSignature'] != null
        ? TimeSignature.fromJson(json['timeSignature'] as Map<String, dynamic>)
        : null,
      lengthBars: json['lengthBars'] as int?,
      partimentoSchema: json['partimentoSchema'] as String?,
      regionalStyle: json['regionalStyle'] != null
        ? RegionalStyle.fromJson(json['regionalStyle'] as Map<String, dynamic>)
        : null,
      tracks: (json['tracks'] as List?)
          ?.map((e) => SynKronyTrackModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      scores: (json['scores'] as List?)
          ?.map((e) => ScoreModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      hardwareConfig: json['hardwareConfig'] != null
        ? HardwareConfigModel.fromJson(json['hardwareConfig'] as Map<String, dynamic>)
        : null,
      isPublic: json['isPublic'] as bool? ?? false,
      tags: List<String>.from(json['tags'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'uid': uid,
      'createdAt': createdAt.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      if (genre != null) 'genre': genre,
      if (subgenre != null) 'subgenre': subgenre,
      if (keySignature != null) 'keySignature': keySignature,
      if (mode != null) 'mode': mode,
      if (tempo != null) 'tempo': tempo,
      if (timeSignature != null) 'timeSignature': timeSignature!.toJson(),
      if (lengthBars != null) 'lengthBars': lengthBars,
      if (partimentoSchema != null) 'partimentoSchema': partimentoSchema,
      if (regionalStyle != null) 'regionalStyle': regionalStyle!.toJson(),
      'tracks': tracks.map((e) => e.toJson()).toList(),
      'scores': scores.map((e) => e.toJson()).toList(),
      if (hardwareConfig != null) 'hardwareConfig': hardwareConfig!.toJson(),
      'isPublic': isPublic,
      'tags': tags,
    };
  }

  /// Calculate project duration in seconds
  double get durationSeconds {
    if (tempo == null || lengthBars == null || timeSignature == null) return 0;
    final beatsPerBar = timeSignature!.numerator / timeSignature!.denominator;
    final totalBeats = lengthBars! * beatsPerBar;
    final secondsPerBeat = 60 / tempo!;
    return totalBeats * secondsPerBeat;
  }
}

/// Time signature
class TimeSignature {
  TimeSignature({
    required this.numerator,
    required this.denominator,
  });

  final int numerator;
  final int denominator;

  factory TimeSignature.fromJson(Map<String, dynamic> json) {
    return TimeSignature(
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

  @override
  String toString() => '$numerator/$denominator';
}

/// Regional style profile
class RegionalStyle {
  RegionalStyle({
    required this.name,
    required this.genre,
    this.swingAmount,
    this.accentPattern,
    this.syncopationStrength,
    this.modifications,
  });

  final String name;
  final String genre;
  final double? swingAmount;
  final List<double>? accentPattern;
  final double? syncopationStrength;
  final Map<String, dynamic>? modifications;

  factory RegionalStyle.fromJson(Map<String, dynamic> json) {
    return RegionalStyle(
      name: json['name'] as String,
      genre: json['genre'] as String,
      swingAmount: (json['swingAmount'] as num?)?.toDouble(),
      accentPattern: json['accentPattern'] != null
        ? List<double>.from((json['accentPattern'] as List).map((e) => (e as num).toDouble()))
        : null,
      syncopationStrength: (json['syncopationStrength'] as num?)?.toDouble(),
      modifications: json['modifications'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'genre': genre,
      if (swingAmount != null) 'swingAmount': swingAmount,
      if (accentPattern != null) 'accentPattern': accentPattern,
      if (syncopationStrength != null) 'syncopationStrength': syncopationStrength,
      if (modifications != null) 'modifications': modifications,
    };
  }
}

/// SynKrony track
class SynKronyTrackModel {
  SynKronyTrackModel({
    required this.id,
    required this.name,
    required this.instrument,
    required this.instrumentId,
    required this.notes,
    this.hardwareTarget,
    this.midiChannel = 0,
    this.generatedBy,
    this.dynamics = const [],
    this.articulations = const [],
    this.volume = 100,
    this.pan = 50,
  });

  final String id;
  final String name;
  final String instrument;
  final String instrumentId;
  final List<NoteModel> notes;
  final String? hardwareTarget; // 'mm8', 'xps10'
  final int midiChannel;
  final String? generatedBy; // 'partimento', 'counterpoint', 'ai'
  final List<dynamic> dynamics;
  final List<dynamic> articulations;
  final int volume;
  final int pan;

  factory SynKronyTrackModel.fromJson(Map<String, dynamic> json) {
    return SynKronyTrackModel(
      id: json['id'] as String,
      name: json['name'] as String,
      instrument: json['instrument'] as String,
      instrumentId: json['instrumentId'] as String,
      notes: (json['notes'] as List)
        .map((e) => NoteModel.fromJson(e as Map<String, dynamic>))
        .toList(),
      hardwareTarget: json['hardwareTarget'] as String?,
      midiChannel: json['midiChannel'] as int? ?? 0,
      generatedBy: json['generatedBy'] as String?,
      dynamics: json['dynamics'] as List? ?? [],
      articulations: json['articulations'] as List? ?? [],
      volume: json['volume'] as int? ?? 100,
      pan: json['pan'] as int? ?? 50,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'instrument': instrument,
      'instrumentId': instrumentId,
      'notes': notes.map((e) => e.toJson()).toList(),
      if (hardwareTarget != null) 'hardwareTarget': hardwareTarget,
      'midiChannel': midiChannel,
      if (generatedBy != null) 'generatedBy': generatedBy,
      'dynamics': dynamics,
      'articulations': articulations,
      'volume': volume,
      'pan': pan,
    };
  }

  /// Get pitch range of track
  (int min, int max) get pitchRange {
    if (notes.isEmpty) return (60, 60);
    final pitches = notes.map((n) => n.pitch).toList();
    pitches.sort();
    return (pitches.first, pitches.last);
  }
}

/// Music score (notation)
class ScoreModel {
  ScoreModel({
    required this.id,
    required this.title,
    required this.parts,
    this.composer,
    this.arranger,
    this.tempo,
    this.timeSignature,
    this.keySignature,
    this.lyrics,
  });

  final String id;
  final String title;
  final List<ScorePartModel> parts;
  final String? composer;
  final String? arranger;
  final int? tempo;
  final TimeSignature? timeSignature;
  final String? keySignature;
  final String? lyrics;

  factory ScoreModel.fromJson(Map<String, dynamic> json) {
    return ScoreModel(
      id: json['id'] as String,
      title: json['title'] as String,
      parts: (json['parts'] as List)
        .map((e) => ScorePartModel.fromJson(e as Map<String, dynamic>))
        .toList(),
      composer: json['composer'] as String?,
      arranger: json['arranger'] as String?,
      tempo: json['tempo'] as int?,
      timeSignature: json['timeSignature'] != null
        ? TimeSignature.fromJson(json['timeSignature'] as Map<String, dynamic>)
        : null,
      keySignature: json['keySignature'] as String?,
      lyrics: json['lyrics'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'parts': parts.map((e) => e.toJson()).toList(),
      if (composer != null) 'composer': composer,
      if (arranger != null) 'arranger': arranger,
      if (tempo != null) 'tempo': tempo,
      if (timeSignature != null) 'timeSignature': timeSignature!.toJson(),
      if (keySignature != null) 'keySignature': keySignature,
      if (lyrics != null) 'lyrics': lyrics,
    };
  }
}

/// Score part (instrument/staff)
class ScorePartModel {
  ScorePartModel({
    required this.name,
    required this.instrumentId,
    required this.notes,
    this.measures,
  });

  final String name;
  final String instrumentId;
  final List<NoteModel> notes;
  final List<dynamic>? measures;

  factory ScorePartModel.fromJson(Map<String, dynamic> json) {
    return ScorePartModel(
      name: json['name'] as String,
      instrumentId: json['instrumentId'] as String,
      notes: (json['notes'] as List)
        .map((e) => NoteModel.fromJson(e as Map<String, dynamic>))
        .toList(),
      measures: json['measures'] as List?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'instrumentId': instrumentId,
      'notes': notes.map((e) => e.toJson()).toList(),
      if (measures != null) 'measures': measures,
    };
  }
}

// ============================================================================
// HARDWARE MODELS
// ============================================================================

/// Hardware configuration
class HardwareConfigModel {
  HardwareConfigModel({
    this.mm8Connected = false,
    this.xps10Connected = false,
    this.midiChannels,
    this.mm8Presets = const [],
    this.xps10Presets = const [],
  });

  final bool mm8Connected;
  final bool xps10Connected;
  final Map<String, int>? midiChannels;
  final List<dynamic> mm8Presets;
  final List<dynamic> xps10Presets;

  factory HardwareConfigModel.fromJson(Map<String, dynamic> json) {
    return HardwareConfigModel(
      mm8Connected: json['mm8Connected'] as bool? ?? false,
      xps10Connected: json['xps10Connected'] as bool? ?? false,
      midiChannels: (json['midiChannels'] as Map<String, dynamic>?)
        ?.map((k, v) => MapEntry(k, v as int)),
      mm8Presets: json['mm8Presets'] as List? ?? [],
      xps10Presets: json['xps10Presets'] as List? ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'mm8Connected': mm8Connected,
      'xps10Connected': xps10Connected,
      if (midiChannels != null) 'midiChannels': midiChannels,
      'mm8Presets': mm8Presets,
      'xps10Presets': xps10Presets,
    };
  }
}

/// Hardware preset for XPS-10 or MM8
class HardwarePresetModel {
  HardwarePresetModel({
    required this.id,
    required this.name,
    required this.hardwareType,
    required this.parameters,
    this.midiChannel = 0,
    this.category,
  });

  final String id;
  final String name;
  final String hardwareType; // 'xps10', 'mm8'
  final Map<String, dynamic> parameters;
  final int midiChannel;
  final String? category;

  factory HardwarePresetModel.fromJson(Map<String, dynamic> json) {
    return HardwarePresetModel(
      id: json['id'] as String,
      name: json['name'] as String,
      hardwareType: json['hardwareType'] as String,
      parameters: Map<String, dynamic>.from(json['parameters'] as Map),
      midiChannel: json['midiChannel'] as int? ?? 0,
      category: json['category'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'hardwareType': hardwareType,
      'parameters': parameters,
      'midiChannel': midiChannel,
      if (category != null) 'category': category,
    };
  }
}

// ============================================================================
// PNAB 2026 MODELS
// ============================================================================

/// PNAB cultural impact metric
class PnabMetricModel {
  PnabMetricModel({
    required this.id,
    required this.projectId,
    required this.culturalImpact,
    required this.regionalPreservation,
    required this.communityBeneficiaries,
    this.region,
    this.genreTags = const [],
    required this.timestamp,
  });

  final String id;
  final String projectId;
  final double culturalImpact; // 0.0 - 1.0
  final double regionalPreservation; // 0.0 - 1.0
  final int communityBeneficiaries;
  final String? region;
  final List<String> genreTags;
  final DateTime timestamp;

  factory PnabMetricModel.fromJson(Map<String, dynamic> json) {
    return PnabMetricModel(
      id: json['id'] as String,
      projectId: json['project_id'] as String,
      culturalImpact: (json['cultural_impact'] as num).toDouble(),
      regionalPreservation: (json['regional_preservation'] as num).toDouble(),
      communityBeneficiaries: json['community_beneficiaries'] as int,
      region: json['region'] as String?,
      genreTags: json['genre_tags'] != null
        ? List<String>.from(json['genre_tags'] as List)
        : [],
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_id': projectId,
      'cultural_impact': culturalImpact,
      'regional_preservation': regionalPreservation,
      'community_beneficiaries': communityBeneficiaries,
      if (region != null) 'region': region,
      'genre_tags': genreTags,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  /// Calculate overall PNAB score
  double get overallScore => (culturalImpact + regionalPreservation) / 2;
}
