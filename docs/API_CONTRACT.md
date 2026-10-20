# API contract (Phase 1)

All endpoints use `/api/v1` and JSON. Success responses follow `{ "success": true, "data": ..., "message": "..." }`. Errors follow `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`.

| Method | Path             | Auth                | Purpose                                                |
| ------ | ---------------- | ------------------- | ------------------------------------------------------ |
| GET    | `/health`        | No                  | API and MongoDB configuration status                   |
| POST   | `/auth/register` | No                  | Create account and session                             |
| POST   | `/auth/login`    | No                  | Authenticate and create session                        |
| POST   | `/auth/session`  | Optional cookie     | Restore session without an error when no cookie exists |
| POST   | `/auth/refresh`  | Refresh cookie      | Rotate refresh session and issue access token          |
| POST   | `/auth/logout`   | Refresh cookie      | Revoke current session                                 |
| GET    | `/auth/me`       | Bearer access token | Return current account                                 |

Registration accepts `{ name, email, password }`; passwords must be at least 10 characters. Login accepts `{ email, password }`. Refresh tokens are only sent in an HttpOnly cookie and are not returned in JSON.

Authenticated collection APIs also include `/products`, `/warranties`, `/documents`, `/care`, and `/dashboard/summary`. Notifications are available at `GET /notifications` (latest 100 and unread count), `PATCH /notifications/:id/read`, and `PATCH /notifications/read-all`. New product, document, warranty, repair, and maintenance activity is added to the signed-in user's notification feed.
