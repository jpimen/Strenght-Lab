# TRAINING_LOG_V1 (Flutter)

Mobile app module for STRENGHT-LAB, built with Flutter + Riverpod and connected to your existing Node/Express API.

## Run

1. Install Flutter 3.x
2. From `mobile/` run:

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

### Base URL notes
- Android emulator usually needs: `http://10.0.2.2:3000`
- iOS simulator can use `http://localhost:3000`
- Physical devices should use your machine LAN IP

## Features
- Bottom nav tabs: LOG, ANALYTICS, MAXES, PROFILE
- Spreadsheet-style log table
- Row add/edit modal
- Filter + sort controls wired to backend query params
- Total volume + average RPE summary
