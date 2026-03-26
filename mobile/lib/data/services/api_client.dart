import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({required this.baseUrl, http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _httpClient;

  Future<dynamic> get(
    String path, {
    Map<String, String>? query,
  }) async {
    final uri = Uri.parse('$baseUrl$path').replace(
      queryParameters: _withoutEmpty(query),
    );

    final response = await _httpClient.get(uri, headers: _headers());
    return _decode(response);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _httpClient.post(
      uri,
      headers: _headers(),
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Future<dynamic> put(String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _httpClient.put(
      uri,
      headers: _headers(),
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Future<void> delete(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await _httpClient.delete(uri, headers: _headers());
    _decode(response);
  }

  Map<String, String> _headers() {
    return const {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  dynamic _decode(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('HTTP ${response.statusCode}: ${response.body}');
    }

    if (response.body.trim().isEmpty) return null;
    return jsonDecode(response.body);
  }

  Map<String, String>? _withoutEmpty(Map<String, String>? input) {
    if (input == null) return null;

    final filtered = <String, String>{};
    for (final entry in input.entries) {
      if (entry.value.trim().isNotEmpty) {
        filtered[entry.key] = entry.value;
      }
    }
    return filtered;
  }
}
