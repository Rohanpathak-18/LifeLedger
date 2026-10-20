# Security

- Passwords are hashed with bcrypt. Refresh tokens are random opaque values, persisted only as SHA-256 hashes, and rotated on refresh.
- Access tokens use a server-only HMAC secret, short TTL, and client memory storage. Set a unique, strong `JWT_ACCESS_SECRET` in each deployment.
- Refresh cookies are HttpOnly, path-scoped, and configurable for Secure and SameSite attributes.
- Authentication requests that set or use refresh cookies reject a supplied Origin that differs from `CLIENT_URL`.
- Helmet, explicit-origin CORS, auth rate limiting, Zod validation, and request-size limits are enabled.
- MongoDB-backed routes must be treated as unavailable when the database is unconfigured. Never commit real `.env` files.
- Registration and login return `503 DATABASE_UNAVAILABLE` immediately when MongoDB is disconnected instead of allowing Mongoose operations to time out.

Before production use, implement email verification, password recovery, logout-all/session management, monitoring, and comprehensive security tests. Keep the frontend and API on the same site or configure a deliberate cross-site cookie and CSRF strategy. Document storage must use private authorized access when added.
