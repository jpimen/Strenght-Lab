# Strength Lab Backend

Django REST API for the Strength Lab training program platform.

## Tech Stack

- **Python 3.10+**
- **Django 5.2**
- **SQLite** (development) or PostgreSQL (production)
- **django-cors-headers** for CORS support

## Project Structure

```
backend/
├── authentication/    # User auth (signup, login, password reset)
├── programs/         # Training programs and workout management
├── exercises/        # Exercise inventory
├── communication/    # Messaging and conversations
├── config/          # Django settings and URL configuration
├── manage.py        # Django management script
├── requirements.txt # Python dependencies
└── db.sqlite3       # SQLite database (development)
```

## Setup & Installation

### 1. Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Apply Database Migrations

```bash
python manage.py migrate
```

## Running the Server

### Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### Run with Custom Port

```bash
python manage.py runserver 0.0.0.0:8080
```

### From Root Directory

```bash
npm run dev:backend
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session (requires Bearer token)
- `POST /api/auth/logout` - Logout (invalidate session)
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

### Programs
- `POST /api/programs/create` - Create a training program
- `GET /api/programs/fetch/<code>` - Fetch program by share code (mobile)
- `GET /api/programs/list` - List user's programs (requires auth)

### Compatibility (Mobile)
- `GET /api/training-logs` - Get training logs
- `POST /api/training-logs` - Create a training log
- `PUT /api/training-logs/<id>` - Update a training log
- `DELETE /api/training-logs/<id>` - Delete a training log
- `GET /api/cycles` - Get training cycles

## Configuration

Configuration is in `config/settings.py`:

```python
# Enable/disable debug mode
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

# Secret key (change in production!)
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "...")

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Session TTL
SESSION_TTL_DAYS = 7

# Password reset TTL
PASSWORD_RESET_TTL_MINUTES = 15
```

### Environment Variables

For production, set these environment variables:

```bash
export DJANGO_SECRET_KEY="your-secure-secret-key"
export DJANGO_DEBUG="False"
export DATABASE_URL="postgresql://user:pass@localhost/dbname"
```

## Database

### SQLite (Development - Default)
Database file: `db.sqlite3` (auto-created on first migration)

### PostgreSQL (Production)
Update `DATABASES` in `config/settings.py` to use PostgreSQL:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "strength_lab",
        "USER": "postgres",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

## Development Tools

### Run Django Check
Validates the project configuration:

```bash
python manage.py check
```

### Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### Make Migrations
After model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Shell
Interactive Python shell with Django context:

```bash
python manage.py shell
```

## Authentication

The backend uses **Bearer tokens** for authentication. 

### Header Format
```
Authorization: Bearer <token>
```

### How It Works
1. User signs up or logs in → receives a session token
2. Client includes token in `Authorization` header for protected endpoints
3. Sessions expire after 7 days (configurable)

## Error Handling

All API errors return JSON with a `code` field:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

Common error codes:
- `AUTH_EMAIL_REQUIRED` - Email is required
- `AUTH_PASSWORD_TOO_SHORT` - Password must be 8+ characters
- `AUTH_EMAIL_IN_USE` - Email already registered
- `AUTH_INVALID_CREDENTIALS` - Wrong email/password
- `AUTH_UNAUTHORIZED` - Missing/invalid token
- `PROGRAM_NOT_FOUND` - Program share code not found

## Testing

Run tests with:

```bash
python manage.py test
```

## Troubleshooting

### "django.core.exceptions.ImproperlyConfigured"
- Ensure `DJANGO_SETTINGS_MODULE` is set to `config.settings`
- Check `INSTALLED_APPS` in `config/settings.py`

### Database locked errors
- Delete `db.sqlite3` and re-run migrations (development only)

### Port already in use
```bash
python manage.py runserver 0.0.0.0:8080  # Use different port
```

## Production Deployment

For production, follow these steps:

1. Set `DEBUG = False`
2. Set a secure `SECRET_KEY`
3. Whitelist `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Collect static files: `python manage.py collectstatic`
6. Use a production WSGI server (Gunicorn, uWSGI)

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## Contributing

1. Create feature branches
2. Make changes and test
3. Run `python manage.py check` before committing
4. Update migrations if models change

## License

See root LICENSE file.
