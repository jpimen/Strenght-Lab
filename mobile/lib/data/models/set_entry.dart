class SetEntry {
  const SetEntry({
    required this.order,
    this.reps,
    this.weightKg,
    this.rpe,
    this.isAmrap = false,
  });

  final int order;
  final int? reps;
  final double? weightKg;
  final double? rpe;
  final bool isAmrap;

  factory SetEntry.fromJson(Map<String, dynamic> json) {
    final rawOrder = json['order'] ?? json['setNumber'] ?? 1;
    return SetEntry(
      order: (rawOrder as num?)?.toInt() ?? 1,
      reps: (json['reps'] as num?)?.toInt(),
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      rpe: (json['rpe'] as num?)?.toDouble(),
      isAmrap: json['isAmrap'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order': order,
      if (reps != null) 'reps': reps,
      if (weightKg != null) 'weightKg': weightKg,
      if (rpe != null) 'rpe': rpe,
      'isAmrap': isAmrap,
    };
  }
}
