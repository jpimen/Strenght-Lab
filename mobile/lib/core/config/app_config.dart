import 'package:flutter/foundation.dart';

class AppConfig {
  static const String _baseUrlFromDefine =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static String get baseUrl {
    if (_baseUrlFromDefine.trim().isNotEmpty) {
      return _baseUrlFromDefine.trim();
    }

    // Android emulator cannot resolve localhost to host machine.
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000';
    }

    return 'http://localhost:3000';
  }
}
