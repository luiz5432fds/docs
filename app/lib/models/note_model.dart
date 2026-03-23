/// Note Data Model
/// Represents a musical note with all its properties
library;

enum DynamicSymbol {
  pp('pp', 30),
  p('p', 50),
  mp('mp', 65),
  mf('mf', 80),
  f('f', 100),
  ff('ff', 115),
  fff('fff', 127);

  final String symbol;
  final int baseVelocity;

  const DynamicSymbol(this.symbol, this.baseVelocity);

  static DynamicSymbol fromString(String symbol) {
    return DynamicSymbol.values.firstWhere(
      (d) => d.symbol == symbol,
      orElse: () => DynamicSymbol.mf,
    );
  }
}

enum ArticulationType {
  staccato('staccato'),
  legato('legato'),
  accent('accent'),
  marcato('marcato'),
  tenuto('tenuto'),
  fermata('fermata');

  final String value;

  const ArticulationType(this.value);

  static ArticulationType fromString(String value) {
    return ArticulationType.values.firstWhere(
      (t) => t.value == value,
      orElse: () => ArticulationType.legato,
    );
  }
}

class NoteData {
  final String id;
  final int pitch; // MIDI note (0-127)
  final int duration; // Ticks (960 = semínima)
  final int velocity; // 0-127
  final int position;
  final bool tieStart;
  final bool tieEnd;
  final List<String> articulations;
  final List<String> ornaments;
  final int? partimentoDegree;

  NoteData({
    required this.id,
    required this.pitch,
    required this.duration,
    required this.velocity,
    required this.position,
    this.tieStart = false,
    this.tieEnd = false,
    this.articulations = const [],
    this.ornaments = const [],
    this.partimentoDegree,
  });

  factory NoteData.fromJson(Map<String, dynamic> json) {
    return NoteData(
      id: json['id'] as String,
      pitch: json['pitch'] as int,
      duration: json['duration'] as int,
      velocity: json['velocity'] as int,
      position: json['position'] as int,
      tieStart: json['tieStart'] as bool? ?? false,
      tieEnd: json['tieEnd'] as bool? ?? false,
      articulations: List<String>.from(json['articulations'] as List? ?? []),
      ornaments: List<String>.from(json['ornaments'] as List? ?? []),
      partimentoDegree: json['partimento_degree'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'pitch': pitch,
      'duration': duration,
      'velocity': velocity,
      'position': position,
      if (tieStart) 'tieStart': true,
      if (tieEnd) 'tieEnd': true,
      if (articulations.isNotEmpty) 'articulations': articulations,
      if (ornaments.isNotEmpty) 'ornaments': ornaments,
      if (partimentoDegree != null) 'partimento_degree': partimentoDegree,
    };
  }

  NoteData copyWith({
    String? id,
    int? pitch,
    int? duration,
    int? velocity,
    int? position,
    bool? tieStart,
    bool? tieEnd,
    List<String>? articulations,
    List<String>? ornaments,
    int? partimentoDegree,
  }) {
    return NoteData(
      id: id ?? this.id,
      pitch: pitch ?? this.pitch,
      duration: duration ?? this.duration,
      velocity: velocity ?? this.velocity,
      position: position ?? this.position,
      tieStart: tieStart ?? this.tieStart,
      tieEnd: tieEnd ?? this.tieEnd,
      articulations: articulations ?? this.articulations,
      ornaments: ornaments ?? this.ornaments,
      partimentoDegree: partimentoDegree ?? this.partimentoDegree,
    );
  }

  /// Get note name (e.g., "C4", "A#3")
  String get noteName {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    final octave = (pitch ~/ 12) - 1;
    final noteName = noteNames[pitch % 12];
    return '$noteName$octave';
  }

  /// Get frequency in Hz
  double get frequency {
    // A4 (MIDI 69) = 440 Hz
    return 440.0 * pow(2, (pitch - 69) / 12);
  }

  double pow(double x, int exponent) {
    var result = 1.0;
    for (var i = 0; i < exponent; i++) {
      result *= x;
    }
    return result;
  }

  /// Get end position
  int get endPosition => position + duration;
}

class DynamicData {
  final int position;
  final DynamicSymbol symbol;
  final int velocity;

  DynamicData({
    required this.position,
    required this.symbol,
    required this.velocity,
  });

  factory DynamicData.fromJson(Map<String, dynamic> json) {
    return DynamicData(
      position: json['position'] as int,
      symbol: DynamicSymbol.fromString(json['symbol'] as String? ?? 'mf'),
      velocity: json['velocity'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'position': position,
      'symbol': symbol.symbol,
      'velocity': velocity,
    };
  }
}

class ArticulationData {
  final ArticulationType type;
  final int position;
  final double? intensity;

  ArticulationData({
    required this.type,
    required this.position,
    this.intensity,
  });

  factory ArticulationData.fromJson(Map<String, dynamic> json) {
    return ArticulationData(
      type: ArticulationType.fromString(json['type'] as String),
      position: json['position'] as int,
      intensity: (json['intensity'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.value,
      'position': position,
      if (intensity != null) 'intensity': intensity,
    };
  }
}
