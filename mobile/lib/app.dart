import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'presentation/navigation/app_shell.dart';

class TrainingLogApp extends StatelessWidget {
  const TrainingLogApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TRAINING_LOG_V1',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AppShell(),
    );
  }
}
