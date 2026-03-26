import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../providers/training_providers.dart';

class MaxesScreen extends ConsumerWidget {
  const MaxesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rows = ref.watch(trainingLogControllerProvider).rows;
    final maxItems = rows
        .where((row) => int.tryParse(row.reps) != null && row.inferredVolumeKg() > 0)
        .map((row) {
          final reps = int.tryParse(row.reps)!;
          final estLoad = row.inferredVolumeKg() / (row.sets * reps).clamp(1, 9999);
          final oneRm = estLoad * (1 + reps / 30);
          return (exercise: row.exerciseName, oneRm: oneRm);
        })
        .toList()
      ..sort((a, b) => b.oneRm.compareTo(a.oneRm));

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'MAXES',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: maxItems.length.clamp(0, 12),
                itemBuilder: (context, index) {
                  final item = maxItems[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.exercise.toUpperCase(),
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ),
                        Text(
                          '${item.oneRm.toStringAsFixed(1)} KG',
                          style: const TextStyle(
                            color: AppTheme.accent,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
