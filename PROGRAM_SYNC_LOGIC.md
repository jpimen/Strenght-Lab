# Program Sync Logic: Admin to Mobile

This document outlines the end-to-end logic for creating a training program in the **Strength Lab** Admin dashboard and syncing it to the **Mobile App** via a unique share code.

---

## 1. Admin Creation Flow (Web Frontend)

1. **Build**: The admin/coach designs a program using the spreadsheet-style grid in the React frontend.
2. **Publish**: When the admin clicks "Publish", the frontend sends a `POST` request to the backend with the program details and the full grid state (`builder_data`).
3. **Backend Storage**: The Django backend saves the program to the `programs_program` table.
4. **Code Generation**: Upon saving, the backend automatically generates a unique 6-character alphanumeric code (e.g., `KT7B9X`).
5. **Response**: The backend returns the `share_code` to the frontend, which the admin can then send to the athlete.

### Backend Logic (Python/Django)
```python
# programs/models.py
def save(self, *args, **kwargs):
    if not self.share_code:
        self.share_code = _generate_share_code() # Unique 6-char code
    super().save(*args, **kwargs)
```

---

## 2. Syncing to Mobile (Flutter)

The athlete receives the 6-character code and enters it into the mobile app to "Import" their program.

### A. The Fetch Request
The mobile app makes a `GET` request to:
`{{API_BASE_URL}}/api/programs/sync/{{SHARE_CODE}}/`

### B. Mobile Logic (Dart/Flutter)

#### 1. API Repository
```dart
// mobile/lib/data/repositories/program_repository.dart

Future<Map<String, dynamic>?> fetchProgramByCode(String code) async {
  final response = await http.get(
    Uri.parse('${AppConfig.baseUrl}/api/programs/sync/$code/'),
  );

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to fetch program. Check your share code.');
  }
}
```

#### 2. Sync Controller (Riverpod)
```dart
// mobile/lib/presentation/providers/program_sync_provider.dart

final programSyncProvider = StateNotifierProvider<ProgramSyncNotifier, AsyncValue<void>>((ref) {
  return ProgramSyncNotifier(ref.watch(programRepositoryProvider));
});

class ProgramSyncNotifier extends StateNotifier<AsyncValue<void>> {
  final ProgramRepository _repo;
  ProgramSyncNotifier(this._repo) : super(const AsyncValue.data(null));

  Future<void> syncProgram(String code) async {
    state = const AsyncValue.loading();
    try {
      final programData = await _repo.fetchProgramByCode(code);
      // Logic to save programData locally (SQLite/SharedPreferences)
      // and redirect user to the Log screen.
      state = const AsyncValue.data(null);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }
}
```

---

## 3. Data Transformation

The backend converts the complex spreadsheet grid into a simple list of exercises for the mobile app before sending the JSON response.

**Original Grid Cell:**
`{ "raw": "Squat", "resolved": "Squat" }` at `R1_exercise`

**Mobile-Ready Exercise Object:**
```json
{
  "day": "Day 1",
  "exerciseName": "Squat",
  "sets": 3,
  "reps": "5",
  "intensityRpe": "8",
  "notes": "Fast descent"
}
```

---

## 4. API Endpoint (Backend View)

```python
# programs/views.py
@api_view(["GET"])
@permission_classes([AllowAny]) # Allows athletes to fetch without login if needed
def sync_program(request, share_code):
    try:
        program = Program.objects.get(share_code=share_code.upper())
        # to_mobile_dict() flattens the grid for the app
        return Response(program.to_mobile_dict())
    except Program.DoesNotExist:
        return Response({"error": "Program not found"}, status=404)
```

---

## Implementation Status
- [x] Backend Model & Code Generation
- [x] Backend `to_mobile_dict` logic
- [x] Backend API View (`sync_program`)
- [ ] Mobile UI for entering code
- [ ] Mobile Local Storage for imported programs
