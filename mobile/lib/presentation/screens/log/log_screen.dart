import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/parse_utils.dart';
import '../../../data/models/training_log.dart';
import '../../providers/training_providers.dart';

class LogScreen extends ConsumerWidget {
  const LogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(trainingLogControllerProvider);

    return SafeArea(
      child: Column(
        children: [
          _TopBar(
            onMenuPressed: () {},
            onSettingsPressed: () {},
          ),
          _ActionRow(
            state: state,
            onAddRow: () => _openRowEditor(
              context,
              ref,
              null,
            ),
            onFilter: () => _openFilterSheet(context, ref, state),
            onSort: () => _openSortSheet(context, ref, state),
            onCycleChanged: (cycleId) =>
                ref.read(trainingLogControllerProvider.notifier).setCycle(cycleId),
          ),
          if (state.isLoading)
            const LinearProgressIndicator(
              minHeight: 2,
              color: AppTheme.accent,
            ),
          if (state.error != null)
            Container(
              width: double.infinity,
              color: const Color(0x22FF4444),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Text(
                state.error!,
                style: const TextStyle(
                  color: AppTheme.accent,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          _TableHeader(),
          Expanded(
            child: Container(
              color: const Color(0xFF121212),
              child: ListView.builder(
                itemCount: state.rows.length,
                itemBuilder: (context, index) {
                  final row = state.rows[index];
                  final isSelected = row.id == state.selectedRowId;

                  return _LogRow(
                    index: index + 1,
                    row: row,
                    selected: isSelected,
                    onTap: () {
                      final controller =
                          ref.read(trainingLogControllerProvider.notifier);

                      if (isSelected) {
                        _openRowEditor(context, ref, row);
                        return;
                      }

                      controller.selectRow(row.id);
                    },
                    onDoubleTap: () => _openRowEditor(context, ref, row),
                    onDelete: () => ref
                        .read(trainingLogControllerProvider.notifier)
                        .deleteRow(row.id),
                  );
                },
              ),
            ),
          ),
          _SummaryBar(
            totalVolumeKg: state.totalVolumeKg,
            averageIntensity: state.averageIntensity,
          ),
        ],
      ),
    );
  }

  Future<void> _openFilterSheet(
    BuildContext context,
    WidgetRef ref,
    TrainingLogState state,
  ) async {
    String day = state.filterDay ?? 'ALL';
    final exerciseController = TextEditingController(
      text: state.filterExercise ?? '',
    );

    final applied = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1D1D1D),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 18,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'FILTER',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: day,
                    decoration: const InputDecoration(labelText: 'DAY'),
                    dropdownColor: const Color(0xFF242424),
                    items: const ['ALL', 'D1', 'D2', 'D3', 'D4']
                        .map(
                          (value) => DropdownMenuItem(
                            value: value,
                            child: Text(value),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setSheetState(() {
                        day = value ?? 'ALL';
                      });
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: exerciseController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'EXERCISE CONTAINS',
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('CANCEL'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('APPLY'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    if (applied == true && context.mounted) {
      await ref.read(trainingLogControllerProvider.notifier).applyFilters(
            day: day == 'ALL' ? null : day,
            exerciseQuery: exerciseController.text.trim().isEmpty
                ? null
                : upper(exerciseController.text),
          );
    }

    exerciseController.dispose();
  }

  Future<void> _openSortSheet(
    BuildContext context,
    WidgetRef ref,
    TrainingLogState state,
  ) async {
    var sortField = state.sortField;
    var sortOrder = state.sortOrder;

    final applied = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: const Color(0xFF1D1D1D),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SORT',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<LogSortField>(
                    value: sortField,
                    decoration: const InputDecoration(labelText: 'FIELD'),
                    dropdownColor: const Color(0xFF242424),
                    items: LogSortField.values
                        .map(
                          (field) => DropdownMenuItem(
                            value: field,
                            child: Text(field.label),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      if (value == null) return;
                      setSheetState(() => sortField = value);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<SortOrder>(
                    value: sortOrder,
                    decoration: const InputDecoration(labelText: 'ORDER'),
                    dropdownColor: const Color(0xFF242424),
                    items: const [
                      DropdownMenuItem(value: SortOrder.asc, child: Text('ASC')),
                      DropdownMenuItem(value: SortOrder.desc, child: Text('DESC')),
                    ],
                    onChanged: (value) {
                      if (value == null) return;
                      setSheetState(() => sortOrder = value);
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('CANCEL'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('APPLY'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    if (applied == true && context.mounted) {
      await ref.read(trainingLogControllerProvider.notifier).applySort(
            field: sortField,
            order: sortOrder,
          );
    }
  }

  Future<void> _openRowEditor(
    BuildContext context,
    WidgetRef ref,
    TrainingLog? row,
  ) async {
    var day = row?.day ?? 'D1';
    final exerciseController = TextEditingController(text: row?.exerciseName ?? '');
    final setsController = TextEditingController(text: row?.sets.toString() ?? '0');
    final repsController = TextEditingController(text: row?.reps ?? '0');
    final intensityController =
        TextEditingController(text: row?.intensityRpe.toStringAsFixed(1) ?? '0');

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1D1D1D),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 18,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    row == null ? 'ADD ROW' : 'EDIT ROW',
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: day,
                    decoration: const InputDecoration(labelText: 'DAY'),
                    dropdownColor: const Color(0xFF242424),
                    items: const ['D1', 'D2', 'D3', 'D4']
                        .map(
                          (value) => DropdownMenuItem(
                            value: value,
                            child: Text(value),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setSheetState(() {
                        day = value ?? 'D1';
                      });
                    },
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: exerciseController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(labelText: 'EXERCISE'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: setsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'SETS'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: repsController,
                          textCapitalization: TextCapitalization.characters,
                          decoration: const InputDecoration(labelText: 'REPS / AMRAP'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: intensityController,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'INTENSITY (RPE)'),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      if (row != null)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              await ref
                                  .read(trainingLogControllerProvider.notifier)
                                  .deleteRow(row.id);
                              if (context.mounted) {
                                Navigator.pop(context, false);
                              }
                            },
                            child: const Text('DELETE'),
                          ),
                        ),
                      if (row != null) const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('CANCEL'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('SAVE'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    if (saved == true && context.mounted) {
      final parsedSets = tryParseInt(setsController.text) ?? 0;
      final parsedIntensity = tryParseDouble(intensityController.text) ?? 0;
      final reps = upper(repsController.text);

      final edited = TrainingLog(
        id: row?.id ?? '',
        day: day,
        exerciseName: upper(exerciseController.text),
        sets: parsedSets,
        reps: reps,
        intensityRpe: parsedIntensity,
        cycleId: row?.cycleId,
        volumeKg: row?.volumeKg,
      );

      await ref.read(trainingLogControllerProvider.notifier).saveRow(edited);
    }

    exerciseController.dispose();
    setsController.dispose();
    repsController.dispose();
    intensityController.dispose();
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.onMenuPressed,
    required this.onSettingsPressed,
  });

  final VoidCallback onMenuPressed;
  final VoidCallback onSettingsPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF2A2A2A), Color(0xFF171717)],
        ),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: onMenuPressed,
            icon: const Icon(Icons.menu),
          ),
          const Expanded(
            child: Text(
              'TRAINING_LOG_V1',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          IconButton(
            onPressed: onSettingsPressed,
            icon: const Icon(Icons.settings),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({
    required this.state,
    required this.onAddRow,
    required this.onFilter,
    required this.onSort,
    required this.onCycleChanged,
  });

  final TrainingLogState state;
  final VoidCallback onAddRow;
  final VoidCallback onFilter;
  final VoidCallback onSort;
  final ValueChanged<String?> onCycleChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      color: const Color(0xFF171717),
      child: Row(
        children: [
          FilledButton.icon(
            onPressed: onAddRow,
            icon: const Icon(Icons.add, size: 16),
            label: const Text('ADD ROW'),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFF2CCCC),
              foregroundColor: Colors.black,
              visualDensity: VisualDensity.compact,
              textStyle: const TextStyle(
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton.icon(
            onPressed: onFilter,
            icon: const Icon(Icons.filter_alt_outlined, size: 14),
            label: const Text('FILTER'),
            style: OutlinedButton.styleFrom(
              visualDensity: VisualDensity.compact,
              foregroundColor: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton.icon(
            onPressed: onSort,
            icon: const Icon(Icons.sort, size: 14),
            label: const Text('SORT'),
            style: OutlinedButton.styleFrom(
              visualDensity: VisualDensity.compact,
              foregroundColor: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(width: 10),
          const Text(
            'CYCLE:',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 12,
              letterSpacing: 0.7,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF222222),
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(4),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: state.selectedCycle ?? '_ALL',
                  dropdownColor: const Color(0xFF222222),
                  isExpanded: true,
                  items: [
                    const DropdownMenuItem(value: '_ALL', child: Text('ALL')),
                    ...state.cycles.map(
                      (cycle) => DropdownMenuItem(
                        value: cycle.id,
                        child: Text(cycle.name.toUpperCase()),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    if (value == null || value == '_ALL') {
                      onCycleChanged(null);
                      return;
                    }
                    onCycleChanged(value);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TableHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
      decoration: const BoxDecoration(
        color: Color(0xFF242424),
        border: Border(
          top: BorderSide(color: AppTheme.border),
          bottom: BorderSide(color: AppTheme.border),
        ),
      ),
      child: const Row(
        children: [
          _HeaderCell(width: 32, label: '#'),
          _HeaderCell(width: 52, label: 'DAY'),
          _HeaderCell(expanded: true, label: 'EXERCISE'),
          _HeaderCell(width: 56, label: 'SETS'),
          _HeaderCell(width: 62, label: 'REPS'),
          _HeaderCell(width: 86, label: 'INTENSITY'),
        ],
      ),
    );
  }
}

class _HeaderCell extends StatelessWidget {
  const _HeaderCell({
    this.width,
    this.expanded = false,
    required this.label,
  });

  final double? width;
  final bool expanded;
  final String label;

  @override
  Widget build(BuildContext context) {
    final child = Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        border: Border(right: BorderSide(color: AppTheme.border)),
      ),
      child: Text(
        label,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 11,
          letterSpacing: 0.8,
          color: AppTheme.textMuted,
          fontWeight: FontWeight.w700,
        ),
      ),
    );

    if (expanded) return Expanded(child: child);
    return SizedBox(width: width, child: child);
  }
}

class _LogRow extends StatelessWidget {
  const _LogRow({
    required this.index,
    required this.row,
    required this.selected,
    required this.onTap,
    required this.onDoubleTap,
    required this.onDelete,
  });

  final int index;
  final TrainingLog row;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onDoubleTap;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onDoubleTap: onDoubleTap,
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          border: Border(
            bottom: const BorderSide(color: AppTheme.border),
            left: BorderSide(
              color: selected ? AppTheme.accent : Colors.transparent,
              width: 1.4,
            ),
            right: BorderSide(
              color: selected ? AppTheme.accent : Colors.transparent,
              width: 1.4,
            ),
            top: BorderSide(
              color: selected ? AppTheme.accent : Colors.transparent,
              width: 1.4,
            ),
          ),
        ),
        child: Row(
          children: [
            _BodyCell(
              width: 32,
              text: index.toString(),
              color: const Color(0xFF676767),
              tiny: true,
            ),
            _BodyCell(width: 52, text: row.day, bold: true),
            _BodyCell(expanded: true, text: row.exerciseName),
            _BodyCell(width: 56, text: row.sets.toString()),
            _BodyCell(
              width: 62,
              text: row.reps,
              color: row.isAmrap ? AppTheme.accent : null,
            ),
            _BodyCell(
              width: 86,
              text: row.intensityRpe.toStringAsFixed(1),
              color: AppTheme.accent,
            ),
            IconButton(
              onPressed: onDelete,
              icon: const Icon(Icons.close, size: 14, color: AppTheme.textMuted),
              splashRadius: 14,
            ),
          ],
        ),
      ),
    );
  }
}

class _BodyCell extends StatelessWidget {
  const _BodyCell({
    this.width,
    this.expanded = false,
    required this.text,
    this.color,
    this.bold = false,
    this.tiny = false,
  });

  final double? width;
  final bool expanded;
  final String text;
  final Color? color;
  final bool bold;
  final bool tiny;

  @override
  Widget build(BuildContext context) {
    final child = Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        border: Border(right: BorderSide(color: AppTheme.border)),
      ),
      child: Text(
        upper(text),
        overflow: TextOverflow.ellipsis,
        maxLines: 2,
        style: TextStyle(
          color: color ?? AppTheme.textPrimary,
          fontSize: tiny ? 10 : 13,
          letterSpacing: 0.6,
          fontWeight: bold ? FontWeight.w700 : FontWeight.w600,
        ),
      ),
    );

    if (expanded) return Expanded(child: child);
    return SizedBox(width: width, child: child);
  }
}

class _SummaryBar extends StatelessWidget {
  const _SummaryBar({
    required this.totalVolumeKg,
    required this.averageIntensity,
  });

  final double totalVolumeKg;
  final double averageIntensity;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
      color: const Color(0xFF141414),
      child: Row(
        children: [
          Expanded(
            child: _SummaryCard(
              title: 'TOTAL VOLUME',
              value: '${_formatInt(totalVolumeKg)} KG',
              valueColor: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _SummaryCard(
              title: 'AVG INTENSITY',
              value: 'RPE ${averageIntensity.toStringAsFixed(1)}',
              valueColor: AppTheme.accent,
            ),
          ),
        ],
      ),
    );
  }

  String _formatInt(double value) {
    final intValue = value.round();
    final text = intValue.toString();
    final buffer = StringBuffer();

    for (var i = 0; i < text.length; i++) {
      final reverseIndex = text.length - i;
      buffer.write(text[i]);
      if (reverseIndex > 1 && reverseIndex % 3 == 1) {
        buffer.write(',');
      }
    }
    return buffer.toString();
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.title,
    required this.value,
    required this.valueColor,
  });

  final String title;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF202020),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 30,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}
