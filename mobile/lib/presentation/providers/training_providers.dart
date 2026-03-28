import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/app_config.dart';
import '../../data/models/cycle.dart';
import '../../data/models/training_log.dart';
import '../../data/repositories/training_repository.dart';
import '../../data/repositories/training_repository_impl.dart';
import '../../data/services/api_client.dart';
import '../../data/services/training_api_service.dart';

enum LogSortField {
  day,
  exercise,
  sets,
  reps,
  intensity,
}

enum SortOrder {
  asc,
  desc,
}

extension LogSortFieldX on LogSortField {
  String get label {
    switch (this) {
      case LogSortField.day:
        return 'DAY';
      case LogSortField.exercise:
        return 'EXERCISE';
      case LogSortField.sets:
        return 'SETS';
      case LogSortField.reps:
        return 'REPS';
      case LogSortField.intensity:
        return 'INTENSITY';
    }
  }

  String get apiKey {
    switch (this) {
      case LogSortField.day:
        return 'day';
      case LogSortField.exercise:
        return 'exerciseName';
      case LogSortField.sets:
        return 'sets';
      case LogSortField.reps:
        return 'reps';
      case LogSortField.intensity:
        return 'intensityRpe';
    }
  }
}

class TrainingLogState {
  const TrainingLogState({
    required this.rows,
    required this.cycles,
    required this.isLoading,
    required this.sortField,
    required this.sortOrder,
    this.error,
    this.selectedRowId,
    this.filterDay,
    this.filterExercise,
    this.selectedCycle,
  });

  final List<TrainingLog> rows;
  final List<Cycle> cycles;
  final bool isLoading;
  final String? error;
  final String? selectedRowId;
  final String? filterDay;
  final String? filterExercise;
  final String? selectedCycle;
  final LogSortField sortField;
  final SortOrder sortOrder;

  factory TrainingLogState.initial() {
    return const TrainingLogState(
      rows: [],
      cycles: [],
      isLoading: false,
      sortField: LogSortField.day,
      sortOrder: SortOrder.asc,
    );
  }

  double get totalVolumeKg {
    return rows.fold<double>(0, (sum, row) => sum + row.inferredVolumeKg());
  }

  double get averageIntensity {
    if (rows.isEmpty) return 0;

    final total = rows.fold<double>(0, (sum, row) => sum + row.intensityRpe);
    return total / rows.length;
  }

  TrainingLogState copyWith({
    List<TrainingLog>? rows,
    List<Cycle>? cycles,
    bool? isLoading,
    String? error,
    bool clearError = false,
    String? selectedRowId,
    bool clearSelectedRow = false,
    String? filterDay,
    bool clearDayFilter = false,
    String? filterExercise,
    bool clearExerciseFilter = false,
    String? selectedCycle,
    bool clearCycle = false,
    LogSortField? sortField,
    SortOrder? sortOrder,
  }) {
    return TrainingLogState(
      rows: rows ?? this.rows,
      cycles: cycles ?? this.cycles,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      selectedRowId: clearSelectedRow ? null : (selectedRowId ?? this.selectedRowId),
      filterDay: clearDayFilter ? null : (filterDay ?? this.filterDay),
      filterExercise:
          clearExerciseFilter ? null : (filterExercise ?? this.filterExercise),
      selectedCycle: clearCycle ? null : (selectedCycle ?? this.selectedCycle),
      sortField: sortField ?? this.sortField,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(baseUrl: AppConfig.baseUrl);
});

final trainingApiServiceProvider = Provider<TrainingApiService>((ref) {
  return TrainingApiService(ref.watch(apiClientProvider));
});

final trainingRepositoryProvider = Provider<TrainingRepository>((ref) {
  return TrainingRepositoryImpl(ref.watch(trainingApiServiceProvider));
});

final selectedTabProvider = StateProvider<int>((ref) => 0);

final trainingLogControllerProvider =
    StateNotifierProvider<TrainingLogController, TrainingLogState>((ref) {
  return TrainingLogController(ref.watch(trainingRepositoryProvider));
});

class TrainingLogController extends StateNotifier<TrainingLogState> {
  TrainingLogController(this._repository) : super(TrainingLogState.initial()) {
    loadInitial();
  }

  final TrainingRepository _repository;

  Future<void> loadInitial() async {
    await Future.wait([loadCycles(), loadLogs()]);
  }

  Future<void> loadCycles() async {
    try {
      final cycles = await _repository.fetchCycles();
      state = state.copyWith(cycles: cycles, clearError: true);
    } catch (_) {
      // Keep going even if cycle endpoint is unavailable.
    }
  }

  Future<void> loadLogs() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final rows = await _repository.fetchLogs(
        cycle: state.selectedCycle,
        day: state.filterDay,
        exercise: state.filterExercise,
        sortBy: state.sortField.apiKey,
        sortOrder: state.sortOrder.name,
      );

      state = state.copyWith(
        rows: rows,
        isLoading: false,
        clearError: true,
      );
    } catch (error) {
      // Seed local rows so the UI stays usable if API route is unavailable.
      state = state.copyWith(
        rows: state.rows.isEmpty ? _seedRows() : state.rows,
        isLoading: false,
        error: 'FAILED TO LOAD FROM API. SHOWING LOCAL DATA.',
      );
    }
  }

  void selectRow(String? rowId) {
    state = state.copyWith(selectedRowId: rowId);
  }

  Future<void> applyFilters({
    String? day,
    String? exerciseQuery,
  }) async {
    state = state.copyWith(
      filterDay: day,
      filterExercise: exerciseQuery,
    );
    await loadLogs();
  }

  Future<void> applySort({
    required LogSortField field,
    required SortOrder order,
  }) async {
    state = state.copyWith(
      sortField: field,
      sortOrder: order,
    );
    await loadLogs();
  }

  Future<void> setCycle(String? cycleId) async {
    state = state.copyWith(selectedCycle: cycleId);
    await loadLogs();
  }

  Future<void> saveRow(TrainingLog row) async {
    if (row.id.startsWith('local_')) {
      _replaceLocal(row);
      return;
    }

    try {
      if (row.id.isEmpty) {
        final created = await _repository.createLog(row);
        state = state.copyWith(rows: [created, ...state.rows]);
      } else {
        final updated = await _repository.updateLog(row);
        _replaceLocal(updated);
      }
    } catch (_) {
      final localRow = row.id.isEmpty
          ? row.copyWith(id: 'local_${DateTime.now().microsecondsSinceEpoch}')
          : row;
      _replaceLocal(localRow);
    }
  }

  Future<void> addQuickRow() async {
    final blank = TrainingLog(
      id: '',
      day: 'D1',
      exerciseName: 'NEW EXERCISE',
      sets: 0,
      reps: '0',
      intensityRpe: 0,
      cycleId: state.selectedCycle,
    );

    await saveRow(blank);
  }

  Future<void> deleteRow(String id) async {
    final original = state.rows;
    state = state.copyWith(rows: original.where((row) => row.id != id).toList());

    if (id.startsWith('local_')) return;

    try {
      await _repository.deleteLog(id);
    } catch (_) {
      state = state.copyWith(rows: original, error: 'FAILED TO DELETE ROW');
    }
  }

  Future<void> syncProgram(String code) async {
    state = state.copyWith(isLoading: true, clearError: true);
    
    try {
      final programData = await _repository.importProgram(code);
      final exercises = programData['exercises'] as List<dynamic>? ?? [];
      final programName = programData['name'] as String? ?? 'IMPORTED_PROGRAM';
      
      // Optionally create a cycle here if needed, but for now we'll just add the logs
      // to the current view or with a standard label.
      
      final List<TrainingLog> importedLogs = [];
      for (final ex in exercises) {
        if (ex is Map<String, dynamic>) {
          final log = TrainingLog(
            id: '',
            day: ex['day']?.toString() ?? 'D1',
            exerciseName: ex['exerciseName']?.toString() ?? 'UNKNOWN',
            sets: (ex['sets'] as num?)?.toInt() ?? 0,
            reps: ex['reps']?.toString() ?? '0',
            intensityRpe: double.tryParse(ex['intensityRpe']?.toString() ?? '0') ?? 0,
            // You can add more mapping here for 'rest', 'notes' etc if TrainingLog supports it
          );
          importedLogs.add(log);
        }
      }

      // Save all imported logs
      for (final log in importedLogs) {
        await saveRow(log);
      }

      state = state.copyWith(
        isLoading: false,
        clearError: true,
        error: 'SUCCESSFULLY IMPORTED ${importedLogs.length} EXERCISES FROM $programName',
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'FAILED TO SYNC PROGRAM: ${e.toString()}',
      );
    }
  }

  void _replaceLocal(TrainingLog row) {
    final index = state.rows.indexWhere((item) => item.id == row.id);

    if (index < 0) {
      state = state.copyWith(rows: [row, ...state.rows]);
      return;
    }

    final updated = [...state.rows];
    updated[index] = row;
    state = state.copyWith(rows: updated);
  }

  List<TrainingLog> _seedRows() {
    return const [
      TrainingLog(
        id: 'local_1',
        day: 'D1',
        exerciseName: 'SQUAT (LOW BAR)',
        sets: 5,
        reps: '3',
        intensityRpe: 8,
        volumeKg: 2500,
      ),
      TrainingLog(
        id: 'local_2',
        day: 'D1',
        exerciseName: 'PAUSED BENCH',
        sets: 3,
        reps: '8',
        intensityRpe: 7.5,
        volumeKg: 1800,
      ),
      TrainingLog(
        id: 'local_3',
        day: 'D2',
        exerciseName: 'CONV. DEADLIFT',
        sets: 1,
        reps: '1',
        intensityRpe: 9,
        volumeKg: 180,
      ),
      TrainingLog(
        id: 'local_4',
        day: 'D4',
        exerciseName: 'WEIGHTED DIPS',
        sets: 3,
        reps: 'AMRAP',
        intensityRpe: 8.5,
        volumeKg: 0,
      ),
    ];
  }
}
