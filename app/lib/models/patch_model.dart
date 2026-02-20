class PatchModel {
  PatchModel({
    required this.name,
    required this.category,
    required this.tags,
    required this.macro,
    required this.panel,
    this.isPublic = false,
    this.favorite = false,
  });

  final String name;
  final String category;
  final List<String> tags;
  final Map<String, num> macro;
  final Map<String, num> panel;
  final bool isPublic;
  final bool favorite;

  Map<String, dynamic> toJson() => {
        'name': name,
        'category': category,
        'tags': tags,
        'deviceId': 'roland-xps10',
        'isPublic': isPublic,
        'favorite': favorite,
        'macro': macro,
        'panel': panel,
      };
}
