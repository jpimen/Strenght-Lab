class Exercise {
  const Exercise({
    required this.name,
    this.id,
    this.category,
  });

  final String? id;
  final String name;
  final String? category;

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id']?.toString(),
      name: (json['name'] ?? json['exerciseName'] ?? '').toString(),
      category: json['category']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'name': name,
      if (category != null) 'category': category,
    };
  }
}
