import '../models/cycle.dart';
import '../models/training_log.dart';
import 'api_client.dart';

class TrainingApiService {
  TrainingApiService(this._client);

  final ApiClient _client;

  Future<List<TrainingLog>> fetchLogs({
    String? cycle,
    String? day,
    String? exercise,
    String? sortBy,
    String? sortOrder,
  }) async {
    final payload = await _client.get(
      '/api/training-logs',
      query: {
        if (cycle != null) 'cycle': cycle,
        if (day != null) 'day': day,
        if (exercise != null) 'exercise': exercise,
        if (sortBy != null) 'sortBy': sortBy,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );

    final list = _extractList(payload);
    return list
        .whereType<Map<String, dynamic>>()
        .map(TrainingLog.fromJson)
        .toList();
  }

  Future<List<Cycle>> fetchCycles() async {
    final payload = await _client.get('/api/cycles');
    final list = _extractList(payload);

    return list
        .whereType<Map<String, dynamic>>()
        .map(Cycle.fromJson)
        .toList();
  }

  Future<TrainingLog> createLog(TrainingLog log) async {
    final payload = await _client.post('/api/training-logs', log.toJson());
    final map = _extractMap(payload);
    return TrainingLog.fromJson(map);
  }

  Future<TrainingLog> updateLog(TrainingLog log) async {
    final payload = await _client.put('/api/training-logs/${log.id}', log.toJson());
    final map = _extractMap(payload);
    return TrainingLog.fromJson(map);
  }

  Future<void> deleteLog(String id) async {
    await _client.delete('/api/training-logs/$id');
  }

  Future<Map<String, dynamic>> fetchByShareCode(String code) async {
    final payload = await _client.get('/api/programs/fetch/$code');
    return _extractMap(payload);
  }

  List<dynamic> _extractList(dynamic payload) {
    if (payload is List<dynamic>) return payload;
    if (payload is Map<String, dynamic>) {
      final data = payload['data'];
      if (data is List<dynamic>) return data;
      final rows = payload['rows'];
      if (rows is List<dynamic>) return rows;
    }
    return const [];
  }

  Map<String, dynamic> _extractMap(dynamic payload) {
    if (payload is Map<String, dynamic>) {
      if (payload['data'] is Map<String, dynamic>) {
        return payload['data'] as Map<String, dynamic>;
      }
      return payload;
    }
    return const {};
  }
}
