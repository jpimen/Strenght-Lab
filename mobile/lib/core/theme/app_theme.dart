import 'package:flutter/material.dart';

class AppTheme {
  static const Color bg = Color(0xFF1A1A1A);
  static const Color surface = Color(0xFF1F1F1F);
  static const Color surfaceAlt = Color(0xFF242424);
  static const Color border = Color(0xFF323232);
  static const Color accent = Color(0xFFFF4444);
  static const Color textPrimary = Color(0xFFE8E8E8);
  static const Color textMuted = Color(0xFF9A9A9A);

  static ThemeData get darkTheme {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: bg,
      colorScheme: base.colorScheme.copyWith(
        primary: accent,
        secondary: accent,
        surface: surface,
      ),
      cardColor: surface,
      dividerColor: border,
      textTheme: base.textTheme.apply(
        bodyColor: textPrimary,
        displayColor: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF202020),
        foregroundColor: textPrimary,
        centerTitle: true,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceAlt,
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: border),
          borderRadius: BorderRadius.circular(6),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: accent, width: 1.2),
          borderRadius: BorderRadius.circular(6),
        ),
      ),
    );
  }
}
