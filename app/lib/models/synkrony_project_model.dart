/// SynKrony Project Model
/// Represents a complete SynKrony music production project
library;

import 'note_model.dart';

enum GenreType {
  bregaRomantico('brega_romantico', 'Brega Romântico'),
  forroPiseiro('forro_piseiro', 'Forró Piseiro'),
  tecnobrega('tecnobrega', 'Tecnobrega'),
  popNacional('pop_nacional', 'Pop Nacional');

  final String value;
  final String label;

  const GenreType(this.value, this.label);

  static GenreType fromString(String value) {
    return GenreType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => GenreType.popNacional,
    );
  }
}

enum HardwareTarget {
  mm8('mm8', 'Yamaha MM8'),
  xps10('xps10', 'Roland XPS-10'),
  vst('vst', 'VST Plugin'),
  none('none', 'None');

  final String value;
  final String label;

  const HardwareTarget(this.value, this.label);

  static HardwareTarget fromString(String value) {
    return HardwareTarget.values.firstWhere(
      (type) => type.value == value,
      orElse: () => HardwareTarget.none,
    );
  }
}

class TimeSignature {
  final int numerator;
  final int denominator;

  const TimeSignature({
    required this.numerator,
    required this.denominator,
  });

  factory TimeSignature.fromJson(Map<String, dynamic> json) {
    return TimeSignature(
      numerator: json['numerator'] as int? ?? 4,
      denominator: json['denominator'] as int? ?? 4,
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

class KeySignature {
  final String key;
  final String mode; // 'major' or 'minor'

  const KeySignature({
    required this.key,
    required this.mode,
  });

  factory KeySignature.fromJson(Map<String, dynamic> json) {
    return KeySignature(
      key: json['key'] as String? ?? 'C',
      mode: json['mode'] as String? ?? 'major',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'mode': mode,
    };
  }

  @override
  String toString() => '$key ${mode == 'major' ? 'Maior' : 'Menor'}';
}

class HardwareSetup {
  final bool mm8Connected;
  final bool xps10Connected;
  final Map<String, int> midiChannels;

  const HardwareSetup({
    this.mm8Connected = false,
    this.xps10Connected = false,
    this.midiChannels = const {'mm8': 1, 'xps10': 2},
  });

  factory HardwareSetup.fromJson(Map<String, dynamic> json) {
    return HardwareSetup(
      mm8Connected: json['mm8_connected'] as bool? ?? false,
      xps10Connected: json['xps10_connected'] as bool? ?? false,
      midiChannels: Map<String, int>.from(
        json['midi_channels'] as Map? ?? {'mm8': 1, 'xps10': 2},
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'mm8_connected': mm8Connected,
      'xps10_connected': xps10Connected,
      'midi_channels': midiChannels,
    };
  }
}

class SynKronyTrack {
  final String id;
  final String name;
  final String instrument;
  final String instrumentId;
  final HardwareTarget hardwareTarget;
  final int midiChannel;
  final int? midiProgram;
  final List<NoteData> notes;
  final String generatedBy;
  final double volume;
  final double pan;

  SynKronyTrack({
    required this.id,
    required this.name,
    required this.instrument,
    required this.instrumentId,
    required this.hardwareTarget,
    required this.midiChannel,
    this.midiProgram,
    List<NoteData>? notes,
    this.generatedBy = 'user',
    this.volume = 0.8,
    this.pan = 0.0,
  }) : notes = notes ?? [];

  factory SynKronyTrack.fromJson(Map<String, dynamic> json) {
    return SynKronyTrack(
      id: json['id'] as String,
      name: json['name'] as String,
      instrument: json['instrument'] as String,
      instrumentId: json['instrumentId'] as String,
      hardwareTarget: HardwareTarget.fromString(
        json['hardware_target'] as String? ?? 'none',
      ),
      midiChannel: json['midiChannel'] as int? ?? 1,
      midiProgram: json['midiProgram'] as int?,
      notes: (json['notes'] as List<dynamic>?)
              ?.map((note) => NoteData.fromJson(note as Map<String, dynamic>))
              .toList() ??
          [],
      generatedBy: json['generated_by'] as String? ?? 'user',
      volume: (json['volume'] as num?)?.toDouble() ?? 0.8,
      pan: (json['pan'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'instrument': instrument,
      'instrumentId': instrumentId,
      'hardware_target': hardwareTarget.value,
      'midiChannel': midiChannel,
      if (midiProgram != null) 'midiProgram': midiProgram,
      'notes': notes.map((note) => note.toJson()).toList(),
      'generated_by': generatedBy,
      'volume': volume,
      'pan': pan,
    };
  }

  SynKronyTrack copyWith({
    String? id,
    String? name,
    String? instrument,
    String? instrumentId,
    HardwareTarget? hardwareTarget,
    int? midiChannel,
    int? midiProgram,
    List<NoteData>? notes,
    String? generatedBy,
    double? volume,
    double? pan,
  }) {
    return SynKronyTrack(
      id: id ?? this.id,
      name: name ?? this.name,
      instrument: instrument ?? this.instrument,
      instrumentId: instrumentId ?? this.instrumentId,
      hardwareTarget: hardwareTarget ?? this.hardwareTarget,
      midiChannel: midiChannel ?? this.midiChannel,
      midiProgram: midiProgram ?? this.midiProgram,
      notes: notes ?? this.notes,
      generatedBy: generatedBy ?? this.generatedBy,
      volume: volume ?? this.volume,
      pan: pan ?? this.pan,
    );
  }
}

class SynKronyProject {
  final String id;
  final String name;
  final String? description;
  final GenreType genre;
  final int bpm;
  final TimeSignature timeSignature;
  final KeySignature keySignature;
  final HardwareSetup hardwareSetup;
  final bool reaperSynced;
  final bool musescoreSynced;
  final String? reaperProjectPath;
  final String? musescoreScorePath;
  final bool partimentoEnabled;
  final String partimentoSchema;
  final List<String> tags;
  final String? mood;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastSyncAt;
  final List<SynKronyTrack> tracks;

  SynKronyProject({
    required this.id,
    required this.name,
    this.description,
    required this.genre,
    required this.bpm,
    required this.timeSignature,
    required this.keySignature,
    required this.hardwareSetup,
    this.reaperSynced = false,
    this.musescoreSynced = false,
    this.reaperProjectPath,
    this.musescoreScorePath,
    this.partimentoEnabled = false,
    this.partimentoSchema = 'Rule_of_Octave',
    this.tags = const [],
    this.mood,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastSyncAt,
    List<SynKronyTrack>? tracks,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now(),
        tracks = tracks ?? [];

  factory SynKronyProject.fromJson(Map<String, dynamic> json) {
    return SynKronyProject(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      genre: GenreType.fromString(json['genre'] as String? ?? 'pop_nacional'),
      bpm: json['bpm'] as int? ?? 120,
      timeSignature: TimeSignature.fromJson(
        json['timeSignature'] as Map<String, dynamic>? ?? {},
      ),
      keySignature: KeySignature.fromJson(
        json['keySignature'] as Map<String, dynamic>? ?? {},
      ),
      hardwareSetup: HardwareSetup.fromJson(
        json['hardware_setup'] as Map<String, dynamic>? ?? {},
      ),
      reaperSynced: json['reaper_synced'] as bool? ?? false,
      musescoreSynced: json['musescore_synced'] as bool? ?? false,
      reaperProjectPath: json['reaper_project_path'] as String?,
      musescoreScorePath: json['musescore_score_path'] as String?,
      partimentoEnabled: json['partimento_enabled'] as bool? ?? false,
      partimentoSchema: json['partimento_schema'] as String? ?? 'Rule_of_Octave',
      tags: List<String>.from(json['tags'] as List? ?? []),
      mood: json['mood'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
      lastSyncAt: json['lastSyncAt'] != null
          ? DateTime.parse(json['lastSyncAt'] as String)
          : null,
      tracks: (json['tracks'] as List<dynamic>?)
              ?.map((track) => SynKronyTrack.fromJson(track as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (description != null) 'description': description,
      'genre': genre.value,
      'bpm': bpm,
      'timeSignature': timeSignature.toJson(),
      'keySignature': keySignature.toJson(),
      'hardware_setup': hardwareSetup.toJson(),
      'reaper_synced': reaperSynced,
      'musescore_synced': musescoreSynced,
      if (reaperProjectPath != null) 'reaper_project_path': reaperProjectPath,
      if (musescoreScorePath != null) 'musescore_score_path': musescoreScorePath,
      'partimento_enabled': partimentoEnabled,
      'partimento_schema': partimentoSchema,
      'tags': tags,
      if (mood != null) 'mood': mood,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      if (lastSyncAt != null) 'lastSyncAt': lastSyncAt!.toIso8601String(),
      'tracks': tracks.map((track) => track.toJson()).toList(),
    };
  }

  SynKronyProject copyWith({
    String? id,
    String? name,
    String? description,
    GenreType? genre,
    int? bpm,
    TimeSignature? timeSignature,
    KeySignature? keySignature,
    HardwareSetup? hardwareSetup,
    bool? reaperSynced,
    bool? musescoreSynced,
    String? reaperProjectPath,
    String? musescoreScorePath,
    bool? partimentoEnabled,
    String? partimentoSchema,
    List<String>? tags,
    String? mood,
    DateTime? lastSyncAt,
    List<SynKronyTrack>? tracks,
  }) {
    return SynKronyProject(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      genre: genre ?? this.genre,
      bpm: bpm ?? this.bpm,
      timeSignature: timeSignature ?? this.timeSignature,
      keySignature: keySignature ?? this.keySignature,
      hardwareSetup: hardwareSetup ?? this.hardwareSetup,
      reaperSynced: reaperSynced ?? this.reaperSynced,
      musescoreSynced: musescoreSynced ?? this.musescoreSynced,
      reaperProjectPath: reaperProjectPath ?? this.reaperProjectPath,
      musescoreScorePath: musescoreScorePath ?? this.musescoreScorePath,
      partimentoEnabled: partimentoEnabled ?? this.partimentoEnabled,
      partimentoSchema: partimentoSchema ?? this.partimentoSchema,
      tags: tags ?? this.tags,
      mood: mood ?? this.mood,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      lastSyncAt: lastSyncAt ?? this.lastSyncAt,
      tracks: tracks ?? this.tracks,
    );
  }

  String get displayName => name;
  String get genreLabel => genre.label;
  String get keyDisplay => keySignature.toString();
}
