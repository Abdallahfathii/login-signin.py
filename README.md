# Login & Sign-In — Django + React

Single-page authentication app: Login and Sign In (register) forms slide smoothly
on one page (purple palette `#BF81FD` / `#EBD6FF`), with light/dark mode.

## Stack

- **Backend**: Django 6 + Django REST Framework + SimpleJWT (access + refresh tokens, blacklisting)
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (Docker) — falls back to SQLite locally if `DATABASE_URL` is unset

## Quick start (Docker — recommended)

```bash
docker compose up --build
```


## Local development (without Docker)


## API

| Method | Endpoint                      | Auth | Description                              |
|--------|-------------------------------|------|------------------------------------------|
| POST   | `/api/auth/register`          | no   | Create account, returns JWT pair         |
| POST   | `/api/auth/login`             | no   | Login (5/min throttled), JWT pair        |
| POST   | `/api/auth/refresh`           | no   | Rotate refresh token                     |
| POST   | `/api/auth/logout`            | yes  | Blacklist refresh token                  |
| GET    | `/api/auth/me`                | yes  | Current user profile                     |
| POST   | `/api/auth/password-reset`    | no   | Request reset email (returns link in DEBUG) |
| POST   | `/api/auth/password-reset/confirm` | no | Set new password with `uid` + `token` |

## Forgot-password flow

1. On the login panel, click **Forgot password?** and enter your email.
2. The backend emails you a reset link (valid **1 hour**). Locally the link prints
   to the Django server terminal (console email backend) and is also shown on the
   page in DEBUG mode.
3. Open the link → **Set new password** page. Enter a new password twice.
4. Your old password stops working; log in with the new one.

To enable real email delivery, set `EMAIL_HOST`, `EMAIL_HOST_USER`,
`EMAIL_HOST_PASSWORD` (and optionally `EMAIL_PORT`, `EMAIL_USE_TLS`,
`DEFAULT_FROM_EMAIL`) in `backend/.env` — see `backend/.env.example`.

## Tests

```bash
cd backend
python manage.py test accounts
```

## Security notes

- Secrets come from `.env` (never commit `.env`); CORS is restricted to known origins.
- Login is throttled; passwords use Django's validators (min length, common-password checks).
- Tokens: 15-minute access, 7-day refresh (rotated and blacklisted on logout).
- Frontend stores tokens in `localStorage` for simplicity — for a hardened production
  deploy, move the refresh token to an httpOnly SameSite cookie set by the backend.
