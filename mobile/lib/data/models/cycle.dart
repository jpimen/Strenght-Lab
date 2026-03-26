class Cycle {
  const Cycle({
    required this.id,
    required this.name,
    this.isActive = false,
    this.startedAt,
    this.endedAt,
  });

  final String id;
  final String name;
  final bool isActive;
  final DateTime? startedAt;
  final DateTime? endedAt;

  factory Cycle.fromJson(Map<String, dynamic> json) {
    return Cycle(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? json['label'] ?? '').toString(),
      isActive: json['isActive'] == true,
      startedAt: _parseDate(json['startedAt'] ?? json['startDate']),
      endedAt: _parseDate(json['endedAt'] ?? json['endDate']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isActive': isActive,
      if (startedAt != null) 'startedAt': startedAt!.toIso8601String(),
      if (endedAt != null) 'endedAt': endedAt!.toIso8601String(),
    };
  }

  static DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    return DateTime.tryParse(raw.toString());
  }
}
