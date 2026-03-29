# Strength Lab

A comprehensive training program platform with coach program creation and athlete tracking.

## Project Structure

- **`frontend/`** - React + Vite web app for coaches to build training programs
- **`backend/`** - Django REST API for authentication, programs, and data management
- **`mobile/`** - Mobile app for athletes to view and log workouts

## Quick Start

### From Root Directory

```bash
# Install all dependencies
npm install

# Run both backend and frontend in development mode
npm run dev:backend  # Django server on :8000
npm run dev:frontend # Vite dev server on :5173
```

### Backend Only

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

See [backend/README.md](backend/README.md) for detailed backend setup and API documentation.

### Frontend Only

```bash
cd frontend
npm run dev
```

## API Documentation

The backend provides a complete REST API:

- **Authentication**: Sign up, login, sessions, password reset
- **Programs**: Create and publish training programs with share codes
- **Exercises**: Exercise inventory with muscle groups and equipment
- **Communication**: Messaging between coaches and athletes
- **Training Logs**: Track completed workouts and performance

Full API documentation available in [backend/README.md](backend/README.md)

## Development

Each service can be run independently:

```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend  
cd frontend
npm run dev
```

## Technology Stack

- **Backend**: Python + Django 5.2 + SQLite/PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **Mobile**: Flutter (Dart)
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Documentation

- [Backend README](backend/README.md) - API setup, endpoints, configuration
- [PROJECT_PROPOSAL.md](PROJECT_PROPOSAL.md) - Feature overview and architecture
- [PROGRAM_SYNC_LOGIC.md](PROGRAM_SYNC_LOGIC.md) - Data synchronization details

## License

See LICENSE file.
