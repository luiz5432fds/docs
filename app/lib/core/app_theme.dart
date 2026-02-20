import 'package:flutter/material.dart';

ThemeData buildJunoTheme() {
  const base = Color(0xFF0F1115);
  const panel = Color(0xFF1A1D25);
  const accent = Color(0xFFE53935);

  return ThemeData.dark().copyWith(
    scaffoldBackgroundColor: base,
    colorScheme: const ColorScheme.dark(primary: accent, secondary: Color(0xFF42A5F5), surface: panel),
    cardTheme: const CardTheme(color: panel, margin: EdgeInsets.all(10)),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: panel,
      border: OutlineInputBorder(),
    ),
    textTheme: const TextTheme(
      titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(fontSize: 16),
    ),
  );
}
