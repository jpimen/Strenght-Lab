import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../providers/training_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(trainingLogControllerProvider);
    final notifier = ref.read(trainingLogControllerProvider.notifier);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'PROFILE',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 12),
              const _ProfileItem(label: 'ACCOUNT SETTINGS', value: 'CONNECTED'),
              const _ProfileItem(label: 'API STATUS', value: 'ACTIVE', valueAccent: true),
              const _ProfileItem(label: 'THEME', value: 'DARK'),
              const _ProfileItem(label: 'VERSION', value: 'TRAINING_LOG_V1'),
              
              const SizedBox(height: 24),
              const Text(
                'SYNC PROGRAM',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E),
                  border: Border.all(color: AppTheme.border),
                ),
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    TextField(
                      autocorrect: false,
                      style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 18),
                      decoration: const InputDecoration(
                        hintText: 'PASTE LINK OR ENTER 6-DIGIT CODE',
                        hintStyle: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        border: InputBorder.none,
                      ),
                      textCapitalization: TextCapitalization.characters,
                      onSubmitted: (input) async {
                        if (input.trim().isNotEmpty) {
                          await notifier.syncProgram(input.trim());
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    Material(
                      color: AppTheme.accent,
                      child: InkWell(
                        onTap: state.isLoading ? null : () {
                           // This is just a verification button
                           notifier.loadInitial();
                        },
                        child: Container(
                          width: double.infinity,
                          height: 44,
                          alignment: Orientation.portrait == MediaQuery.of(context).orientation ? Alignment.center : Alignment.center,
                          child: Text(
                            state.isLoading ? 'SYNCING...' : 'SYNC PROGRAM DATA',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              if (state.error != null) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  color: state.error!.contains('SUCCESSFULLY') ? Colors.green[900]?.withOpacity(0.3) : Colors.red[900]?.withOpacity(0.3),
                  child: Text(
                    state.error!,
                    style: TextStyle(
                      color: state.error!.contains('SUCCESSFULLY') ? Colors.green[300] : Colors.red[300],
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  const _ProfileItem({
    required this.label,
    required this.value,
    this.valueAccent = false,
  });

  final String label;
  final String value;
  final bool valueAccent;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
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
              label,
              style: const TextStyle(
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.6,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueAccent ? AppTheme.accent : AppTheme.textPrimary,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}
