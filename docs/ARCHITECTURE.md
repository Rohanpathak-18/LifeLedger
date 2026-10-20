# Architecture

LifeLedger is an npm-workspace monorepo. The React client lives under `client/src`; its routes are in `app/`, shared page chrome in `components/layout/`, and feature-specific screens, components, and API services under `features/<feature>/`. Shared HTTP configuration is in `services/`.

The Express API lives under `server/src`. Requests flow through routes, middleware, controllers, services, and Mongoose models. Each feature is isolated under `modules/<feature>/`; HTTP concerns stay in controllers and application rules stay in services. The API prefix is `/api/v1`.

## Current phase

This first implementation establishes MongoDB configuration, health check, account registration/login, access tokens held in client memory, hashed rotating refresh sessions, and the responsive design foundation. Dashboard values remain unavailable until backed by persisted records. Product inventory, document storage, reminders, and AI integrations are future phases.
