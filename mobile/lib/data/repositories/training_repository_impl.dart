import '../models/cycle.dart';
import '../models/training_log.dart';
import '../services/training_api_service.dart';
import 'training_repository.dart';

class TrainingRepositoryImpl implements TrainingRepository {
  TrainingRepositoryImpl(this._api);

  final TrainingApiService _api;

  @override
  Future<TrainingLog> createLog(TrainingLog log) => _api.createLog(log);

  @override
  Future<void> deleteLog(String id) => _api.deleteLog(id);

  @override
  Future<List<Cycle>> fetchCycles() => _api.fetchCycles();

  @override
  Future<List<TrainingLog>> fetchLogs({
    String? cycle,
    String? day,
    String? exercise,
    String? sortBy,
    String? sortOrder,
  }) {
    return _api.fetchLogs(
      cycle: cycle,
      day: day,
      exercise: exercise,
      sortBy: sortBy,
      sortOrder: sortOrder,
    );
  }

  @override
  Future<TrainingLog> updateLog(TrainingLog log) => _api.updateLog(log);
}
