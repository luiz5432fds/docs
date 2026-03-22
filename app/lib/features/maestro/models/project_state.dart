/// Maestro IA Project State Models
/// Represents the state of a Maestro IA musical production project

class MaestroProject {
  final String id;
  final String userId;
  final MaestroStatus status;
  final MaestroIntent intent;
  final String prompt;
  final AudioSource? audioSource;
  final MusicalAnalysis? analysis;
  final MusicalArrangement? arrangement;
  final MaestroProgress progress;
  final ExportResult? exports;
  final int createdAt;
  final int updatedAt;

  MaestroProject({
    required this.id,
    required this.userId,
    required this.status,
    required this.intent,
    required this.prompt,
    this.audioSource,
    this.analysis,
    this.arrangement,
    required this.progress,
    this.exports,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MaestroProject.fromJson(Map<String, dynamic> json) {
    return MaestroProject(
      id: json['id'] as String,
      userId: json['userId'] as String,
      status: MaestroStatus.fromString(json['status'] as String? ?? 'processing'),
      intent: MaestroIntent.fromString(json['intent'] as String? ?? 'arranjo'),
      prompt: json['prompt'] as String,
      audioSource: json['audioSource'] != null
          ? AudioSource.fromJson(json['audioSource'] as Map<String, dynamic>)
          : null,
      analysis: json['analysis'] != null
          ? MusicalAnalysis.fromJson(json['analysis'] as Map<String, dynamic>)
          : null,
      arrangement: json['arrangement'] != null
          ? MusicalArrangement.fromJson(json['arrangement'] as Map<String, dynamic>)
          : null,
      progress: MaestroProgress.fromJson(json['progress'] as Map<String, dynamic>),
      exports: json['exports'] != null
          ? ExportResult.fromJson(json['exports'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] as int,
      updatedAt: json['updatedAt'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'status': status.toString(),
      'intent': intent.toString(),
      'prompt': prompt,
      if (audioSource != null) 'audioSource': audioSource!.toJson(),
      if (analysis != null) 'analysis': analysis!.toJson(),
      if (arrangement != null) 'arrangement': arrangement!.toJson(),
      'progress': progress.toJson(),
      if (exports != null) 'exports': exports!.toJson(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  MaestroProject copyWith({
    String? id,
    String? userId,
    MaestroStatus? status,
    MaestroIntent? intent,
    String? prompt,
    AudioSource? audioSource,
    MusicalAnalysis? analysis,
    MusicalArrangement? arrangement,
    MaestroProgress? progress,
    ExportResult? exports,
    int? createdAt,
    int? updatedAt,
  }) {
    return MaestroProject(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      intent: intent ?? this.intent,
      prompt: prompt ?? this.prompt,
      audioSource: audioSource ?? this.audioSource,
      analysis: analysis ?? this.analysis,
      arrangement: arrangement ?? this.arrangement,
      progress: progress ?? this.progress,
      exports: exports ?? this.exports,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool get isProcessing => status == MaestroStatus.processing;
  bool get isCompleted => status == MaestroStatus.completed;
  bool get hasError => status == MaestroStatus.error;
}

enum MaestroStatus {
  processing('processing'),
  analyzing('analyzing'),
  arranging('arranging'),
  generating('generating'),
  exporting('exporting'),
  completed('completed'),
  error('error');

  final String value;
  const MaestroStatus(this.value);

  static MaestroStatus fromString(String value) {
    return MaestroStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MaestroStatus.processing,
    );
  }

  @override
  String toString() => value;
}

enum MaestroIntent {
  composicao('composicao'),
  arranjo('arranjo'),
  producao('producao'),
  analise('analise'),
  transcricao('transcricao');

  final String value;
  const MaestroIntent(this.value);

  static MaestroIntent fromString(String value) {
    return MaestroIntent.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MaestroIntent.arranjo,
    );
  }

  @override
  String toString() => value;
}

class AudioSource {
  final AudioSourceType type;
  final String? url;
  final String? messageId;
  final String? filename;

  AudioSource({
    required this.type,
    this.url,
    this.messageId,
    this.filename,
  });

  factory AudioSource.fromJson(Map<String, dynamic> json) {
    return AudioSource(
      type: AudioSourceType.fromString(json['type'] as String),
      url: json['url'] as String?,
      messageId: json['messageId'] as String?,
      filename: json['filename'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.toString(),
      if (url != null) 'url': url,
      if (messageId != null) 'messageId': messageId,
      if (filename != null) 'filename': filename,
    };
  }
}

enum AudioSourceType {
  youtube('youtube'),
  whatsapp('whatsapp'),
  upload('upload'),
  url('url');

  final String value;
  const AudioSourceType(this.value);

  static AudioSourceType fromString(String value) {
    return AudioSourceType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => AudioSourceType.upload,
    );
  }

  @override
  String toString() => value;
}

class MusicalAnalysis {
  final double bpm;
  final String key;
  final String timeSignature;
  final ChordProgression chords;
  final MelodyContour melody;
  final List<SongSection> sections;
  final List<DetectedInstrument> instruments;
  final double duration;

  MusicalAnalysis({
    required this.bpm,
    required this.key,
    required this.timeSignature,
    required this.chords,
    required this.melody,
    required this.sections,
    required this.instruments,
    required this.duration,
  });

  factory MusicalAnalysis.fromJson(Map<String, dynamic> json) {
    return MusicalAnalysis(
      bpm: (json['bpm'] as num).toDouble(),
      key: json['key'] as String,
      timeSignature: json['timeSignature'] as String,
      chords: ChordProgression.fromJson(json['chords'] as Map<String, dynamic>),
      melody: MelodyContour.fromJson(json['melody'] as Map<String, dynamic>),
      sections: (json['sections'] as List<dynamic>?)
              ?.map((e) => SongSection.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      instruments: (json['instruments'] as List<dynamic>?)
              ?.map((e) => DetectedInstrument.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      duration: (json['duration'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bpm': bpm,
      'key': key,
      'timeSignature': timeSignature,
      'chords': chords.toJson(),
      'melody': melody.toJson(),
      'sections': sections.map((e) => e.toJson()).toList(),
      'instruments': instruments.map((e) => e.toJson()).toList(),
      'duration': duration,
    };
  }
}

class ChordProgression {
  final List<ChordEvent> chords;
  final String key;
  final String scaleType;

  ChordProgression({
    required this.chords,
    required this.key,
    required this.scaleType,
  });

  factory ChordProgression.fromJson(Map<String, dynamic> json) {
    return ChordProgression(
      chords: (json['chords'] as List<dynamic>?)
              ?.map((e) => ChordEvent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      key: json['key'] as String,
      scaleType: json['scaleType'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chords': chords.map((e) => e.toJson()).toList(),
      'key': key,
      'scaleType': scaleType,
    };
  }
}

class ChordEvent {
  final String chord;
  final double startBeat;
  final double durationBeats;

  ChordEvent({
    required this.chord,
    required this.startBeat,
    required this.durationBeats,
  });

  factory ChordEvent.fromJson(Map<String, dynamic> json) {
    return ChordEvent(
      chord: json['chord'] as String,
      startBeat: (json['startBeat'] as num).toDouble(),
      durationBeats: (json['durationBeats'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chord': chord,
      'startBeat': startBeat,
      'durationBeats': durationBeats,
    };
  }
}

class MelodyContour {
  final List<MelodyNote> notes;
  final PitchRange range;
  final String tessitura;

  MelodyContour({
    required this.notes,
    required this.range,
    required this.tessitura,
  });

  factory MelodyContour.fromJson(Map<String, dynamic> json) {
    return MelodyContour(
      notes: (json['notes'] as List<dynamic>?)
              ?.map((e) => MelodyNote.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      range: PitchRange.fromJson(json['range'] as Map<String, dynamic>),
      tessitura: json['tessitura'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notes': notes.map((e) => e.toJson()).toList(),
      'range': range.toJson(),
      'tessitura': tessitura,
    };
  }
}

class MelodyNote {
  final int pitch;
  final double startBeat;
  final double durationBeats;
  final int velocity;

  MelodyNote({
    required this.pitch,
    required this.startBeat,
    required this.durationBeats,
    required this.velocity,
  });

  factory MelodyNote.fromJson(Map<String, dynamic> json) {
    return MelodyNote(
      pitch: json['pitch'] as int,
      startBeat: (json['startBeat'] as num).toDouble(),
      durationBeats: (json['durationBeats'] as num).toDouble(),
      velocity: json['velocity'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pitch': pitch,
      'startBeat': startBeat,
      'durationBeats': durationBeats,
      'velocity': velocity,
    };
  }
}

class PitchRange {
  final int lowest;
  final int highest;

  PitchRange({required this.lowest, required this.highest});

  factory PitchRange.fromJson(Map<String, dynamic> json) {
    return PitchRange(
      lowest: json['lowest'] as int,
      highest: json['highest'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {'lowest': lowest, 'highest': highest};
  }
}

class SongSection {
  final String type;
  final double startBeat;
  final double endBeat;
  final String label;

  SongSection({
    required this.type,
    required this.startBeat,
    required this.endBeat,
    required this.label,
  });

  factory SongSection.fromJson(Map<String, dynamic> json) {
    return SongSection(
      type: json['type'] as String,
      startBeat: (json['startBeat'] as num).toDouble(),
      endBeat: (json['endBeat'] as num).toDouble(),
      label: json['label'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'startBeat': startBeat,
      'endBeat': endBeat,
      'label': label,
    };
  }
}

class DetectedInstrument {
  final String type;
  final double confidence;
  final String role;

  DetectedInstrument({
    required this.type,
    required this.confidence,
    required this.role,
  });

  factory DetectedInstrument.fromJson(Map<String, dynamic> json) {
    return DetectedInstrument(
      type: json['type'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'confidence': confidence,
      'role': role,
    };
  }
}

class MusicalArrangement {
  final String style;
  final List<ArrangementInstrument> instruments;
  final List<SongSection> structure;
  final ChordProgression harmony;
  final int tempo;
  final String timeSignature;
  final String key;

  MusicalArrangement({
    required this.style,
    required this.instruments,
    required this.structure,
    required this.harmony,
    required this.tempo,
    required this.timeSignature,
    required this.key,
  });

  factory MusicalArrangement.fromJson(Map<String, dynamic> json) {
    return MusicalArrangement(
      style: json['style'] as String,
      instruments: (json['instruments'] as List<dynamic>?)
              ?.map((e) => ArrangementInstrument.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      structure: (json['structure'] as List<dynamic>?)
              ?.map((e) => SongSection.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      harmony: ChordProgression.fromJson(json['harmony'] as Map<String, dynamic>),
      tempo: json['tempo'] as int,
      timeSignature: json['timeSignature'] as String,
      key: json['key'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'style': style,
      'instruments': instruments.map((e) => e.toJson()).toList(),
      'structure': structure.map((e) => e.toJson()).toList(),
      'harmony': harmony.toJson(),
      'tempo': tempo,
      'timeSignature': timeSignature,
      'key': key,
    };
  }
}

class ArrangementInstrument {
  final String name;
  final int midiChannel;
  final String role;
  final Map<String, dynamic> settings;

  ArrangementInstrument({
    required this.name,
    required this.midiChannel,
    required this.role,
    required this.settings,
  });

  factory ArrangementInstrument.fromJson(Map<String, dynamic> json) {
    return ArrangementInstrument(
      name: json['name'] as String,
      midiChannel: json['midiChannel'] as int,
      role: json['role'] as String,
      settings: json['settings'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'midiChannel': midiChannel,
      'role': role,
      'settings': settings,
    };
  }
}

class MaestroProgress {
  final String currentStep;
  final List<String> completedSteps;
  final int percentage;
  final String message;
  final List<ProgressLog> logs;

  MaestroProgress({
    required this.currentStep,
    required this.completedSteps,
    required this.percentage,
    required this.message,
    required this.logs,
  });

  factory MaestroProgress.fromJson(Map<String, dynamic> json) {
    return MaestroProgress(
      currentStep: json['currentStep'] as String,
      completedSteps:
          (json['completedSteps'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      percentage: json['percentage'] as int,
      message: json['message'] as String,
      logs: (json['logs'] as List<dynamic>?)
              ?.map((e) => ProgressLog.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentStep': currentStep,
      'completedSteps': completedSteps,
      'percentage': percentage,
      'message': message,
      'logs': logs.map((e) => e.toJson()).toList(),
    };
  }
}

class ProgressLog {
  final int timestamp;
  final String step;
  final String message;
  final String level;

  ProgressLog({
    required this.timestamp,
    required this.step,
    required this.message,
    required this.level,
  });

  factory ProgressLog.fromJson(Map<String, dynamic> json) {
    return ProgressLog(
      timestamp: json['timestamp'] as int,
      step: json['step'] as String,
      message: json['message'] as String,
      level: json['level'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp,
      'step': step,
      'message': message,
      'level': level,
    };
  }
}

class ExportResult {
  final String? reaperProject;
  final List<String>? audioStems;
  final String? midiFile;
  final String? musicXml;
  final String? pdfScore;
  final String? downloadUrl;

  ExportResult({
    this.reaperProject,
    this.audioStems,
    this.midiFile,
    this.musicXml,
    this.pdfScore,
    this.downloadUrl,
  });

  factory ExportResult.fromJson(Map<String, dynamic> json) {
    return ExportResult(
      reaperProject: json['reaperProject'] as String?,
      audioStems: (json['audioStems'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList(),
      midiFile: json['midiFile'] as String?,
      musicXml: json['musicXml'] as String?,
      pdfScore: json['pdfScore'] as String?,
      downloadUrl: json['downloadUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (reaperProject != null) 'reaperProject': reaperProject,
      if (audioStems != null) 'audioStems': audioStems,
      if (midiFile != null) 'midiFile': midiFile,
      if (musicXml != null) 'musicXml': musicXml,
      if (pdfScore != null) 'pdfScore': pdfScore,
      if (downloadUrl != null) 'downloadUrl': downloadUrl,
    };
  }
}

class ChatMessage {
  final String id;
  final String content;
  final ChatRole role;
  final int timestamp;
  final Map<String, dynamic>? metadata;

  ChatMessage({
    required this.id,
    required this.content,
    required this.role,
    required this.timestamp,
    this.metadata,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      content: json['content'] as String,
      role: ChatRole.fromString(json['role'] as String),
      timestamp: json['timestamp'] as int,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'role': role.toString(),
      'timestamp': timestamp,
      if (metadata != null) 'metadata': metadata,
    };
  }
}

enum ChatRole {
  user('user'),
  assistant('assistant'),
  system('system');

  final String value;
  const ChatRole(this.value);

  static ChatRole fromString(String value) {
    return ChatRole.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ChatRole.user,
    );
  }

  @override
  String toString() => value;
}
