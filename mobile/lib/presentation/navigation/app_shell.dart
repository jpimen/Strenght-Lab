import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../providers/training_providers.dart';
import '../screens/analytics/analytics_screen.dart';
import '../screens/log/log_screen.dart';
import '../screens/maxes/maxes_screen.dart';
import '../screens/profile/profile_screen.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tabIndex = ref.watch(selectedTabProvider);

    const screens = [
      LogScreen(),
      AnalyticsScreen(),
      MaxesScreen(),
      ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: tabIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          labelTextStyle: MaterialStateProperty.resolveWith((states) {
            final isSelected = states.contains(MaterialState.selected);
            return TextStyle(
              fontSize: 11,
              letterSpacing: 0.8,
              fontWeight: FontWeight.w700,
              color: isSelected ? AppTheme.accent : AppTheme.textMuted,
            );
          }),
        ),
        child: NavigationBar(
          selectedIndex: tabIndex,
          onDestinationSelected: (index) {
            ref.read(selectedTabProvider.notifier).state = index;
          },
          backgroundColor: const Color(0xFF111111),
          indicatorColor: const Color(0x33FF4444),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.table_chart_outlined),
              selectedIcon: Icon(Icons.table_chart),
              label: 'LOG',
            ),
            NavigationDestination(
              icon: Icon(Icons.query_stats_outlined),
              selectedIcon: Icon(Icons.query_stats),
              label: 'ANALYTICS',
            ),
            NavigationDestination(
              icon: Icon(Icons.fitness_center_outlined),
              selectedIcon: Icon(Icons.fitness_center),
              label: 'MAXES',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'PROFILE',
            ),
          ],
        ),
      ),
    );
  }
}
