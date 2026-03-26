String upper(String value) => value.trim().toUpperCase();

double? tryParseDouble(String value) {
  return double.tryParse(value.trim());
}

int? tryParseInt(String value) {
  return int.tryParse(value.trim());
}
