import '../models/cycle.dart';
import '../models/training_log.dart';

abstract class TrainingRepository {
  Future<List<TrainingLog>> fetchLogs({
    String? cycle,
    String? day,
    String? exercise,
    String? sortBy,
    String? sortOrder,
  });

  Future<List<Cycle>> fetchCycles();

  Future<TrainingLog> createLog(TrainingLog log);

  Future<TrainingLog> updateLog(TrainingLog log);

  Future<void> deleteLog(String id);

  Future<Map<String, dynamic>> importProgram(String code);
}
