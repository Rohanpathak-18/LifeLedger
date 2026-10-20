# Database schema (Phase 1)

MongoDB is canonical persistence. Mongoose timestamps are enabled on account and refresh-session records.

## User

`name` (required, max 80), normalized unique `email` (required), `passwordHash` (required and excluded by default), nullable `emailVerifiedAt`, timestamps.

## RefreshSession

`userId` (required reference, indexed), `tokenHash` (required and excluded by default), `expiresAt` (required TTL index), nullable `revokedAt` and `lastUsedAt`, timestamps. Raw refresh values are never persisted.

Product, document, warranty, repair, maintenance, notification, and audit collections will be introduced with their owning feature phases and documented before those workflows ship.
