import 'exercise.dart';
import 'set_entry.dart';

class TrainingLog {
  const TrainingLog({
    required this.id,
    required this.day,
    required this.exerciseName,
    required this.sets,
    required this.reps,
    required this.intensityRpe,
    this.cycleId,
    this.exercise,
    this.setEntries = const [],
    this.volumeKg,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String day;
  final String exerciseName;
  final int sets;
  final String reps;
  final double intensityRpe;
  final String? cycleId;
  final Exercise? exercise;
  final List<SetEntry> setEntries;
  final double? volumeKg;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool get isAmrap => reps.toUpperCase() == 'AMRAP';

  TrainingLog copyWith({
    String? id,
    String? day,
    String? exerciseName,
    int? sets,
    String? reps,
    double? intensityRpe,
    String? cycleId,
    Exercise? exercise,
    List<SetEntry>? setEntries,
    double? volumeKg,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return TrainingLog(
      id: id ?? this.id,
      day: day ?? this.day,
      exerciseName: exerciseName ?? this.exerciseName,
      sets: sets ?? this.sets,
      reps: reps ?? this.reps,
      intensityRpe: intensityRpe ?? this.intensityRpe,
      cycleId: cycleId ?? this.cycleId,
      exercise: exercise ?? this.exercise,
      setEntries: setEntries ?? this.setEntries,
      volumeKg: volumeKg ?? this.volumeKg,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory TrainingLog.fromJson(Map<String, dynamic> json) {
    final rawReps = json['reps'];
    final parsedReps = rawReps == null ? '' : rawReps.toString();
    final rawIntensity = json['intensityRpe'] ?? json['rpe'] ?? 0;
    final parsedIntensity = rawIntensity is num
        ? rawIntensity.toDouble()
        : double.tryParse(rawIntensity.toString()) ?? 0;

    return TrainingLog(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      day: (json['day'] ?? '').toString().toUpperCase(),
      exerciseName: (json['exerciseName'] ?? json['exercise'] ?? '').toString(),
      sets: (json['sets'] as num?)?.toInt() ?? 0,
      reps: parsedReps.toUpperCase(),
      intensityRpe: parsedIntensity,
      cycleId: json['cycleId']?.toString(),
      exercise: json['exercise'] is Map<String, dynamic>
          ? Exercise.fromJson(json['exercise'] as Map<String, dynamic>)
          : null,
      setEntries: ((json['setEntries'] ?? json['setsData']) as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(SetEntry.fromJson)
          .toList(),
      volumeKg: (json['volumeKg'] as num?)?.toDouble(),
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'day': day,
      'exerciseName': exerciseName,
      'sets': sets,
      'reps': reps,
      'intensityRpe': intensityRpe,
      if (cycleId != null) 'cycleId': cycleId,
      if (exercise != null) 'exercise': exercise!.toJson(),
      if (setEntries.isNotEmpty)
        'setEntries': setEntries.map((entry) => entry.toJson()).toList(),
      if (volumeKg != null) 'volumeKg': volumeKg,
    };
  }

  double inferredVolumeKg() {
    if (volumeKg != null) return volumeKg!;

    final numericReps = int.tryParse(reps);
    if (numericReps == null) return 0;

    // Keep fallback simple when backend does not send weight/volume.
    return (sets * numericReps).toDouble();
  }

  static DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    return DateTime.tryParse(raw.toString());
  }
}
