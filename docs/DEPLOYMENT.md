# Development and deployment

Use Node.js 20+, npm 10+, and MongoDB. Copy `server/.env.example` to `server/.env`; set a MongoDB URI and a unique 32+ character JWT secret. Set `COOKIE_SECURE=true` behind HTTPS and set `CLIENT_URL` to the exact frontend origin. `VITE_API_BASE_URL` is public client configuration, never a secret.

## Recommended Render setup: one origin

The API service can serve the built client, keeping the UI and refresh cookie on
the same origin. In the Render web service for this repository, use the
repository root as the service root, set the build command to
`npm ci && npm run build`, and set the start command to `npm start -w server`.
Set `VITE_API_BASE_URL=/api/v1` in that service's build environment so the
client calls the API on its own origin. Set `CLIENT_URL` to the API service's
public URL (for example, `https://lifeledger-3tvt.onrender.com`). Then deploy
that service and use its URL for the website. This avoids cross-site cookie
restrictions in browsers.

## Separate Render services

When the frontend and API are deployed as separate Render services, set the
frontend service's `VITE_API_BASE_URL` to the API origin **including the API
prefix**, for example `https://lifeledger-3tvt.onrender.com/api/v1`. This app
already appends paths such as `/auth/login`, so omitting `/api/v1` causes API
requests to return 404. Set the API service's `CLIENT_URL` to the frontend
origin only, for example `https://lifeledger-web-4yx1.onrender.com` (no path).
After changing a `VITE_` variable in Render, redeploy the frontend so Vite
embeds the new value in its build.

In production, refresh cookies default to `SameSite=None` and `Secure` so the
browser can send them from a separately hosted frontend to the API. Set
`COOKIE_SAME_SITE` explicitly only when your deployment needs a different
policy; `SameSite=None` requires `COOKIE_SECURE=true` (already enforced in
production).

The separate-service setup relies on cross-site cookies, which some browser
privacy settings can block. Prefer the one-origin setup above when session
restoration does not work reliably across browsers.

## Local development

Copy `server/.env.example` to `server/.env`, then configure `MONGODB_URI` and a
unique 32+ character `JWT_ACCESS_SECRET`. The local frontend origin is
`http://localhost:5173`; the API runs at `http://localhost:5000`, and Vite
proxies `/api` requests to it. `APP_URL` should also be
`http://localhost:5173` for links in reminder emails.

Run `npm install` and `npm run dev`. Build the client with `npm run build`. The
API can be started separately with `npm start -w server`; its health endpoint
is `http://localhost:5000/api/v1/health`.

# Warranty email reminders

The API checks for warranties ending in the next 30 days at startup and then
on the configured interval. In-app reminders are always created. To deliver
email, configure `RESEND_API_KEY` and `EMAIL_FROM` in the server environment;
the `EMAIL_FROM` address must be allowed by the Resend account. Messages go to
the email address on the user's LifeLedger account and are sent once for each
warranty end date. `WARRANTY_REMINDER_INTERVAL_HOURS` defaults to 24, and
`APP_URL` sets the link in the email. See `server/.env.example` for the full
configuration.

The public homepage contact form stores submissions in MongoDB. To receive
those submissions by email, also set `CONTACT_EMAIL` to the inbox that should
receive them. Set `VITE_CONTACT_EMAIL` in the client environment to the public
address displayed in the site footer, then rebuild the client. The default
`hello@lifeledger.app` value is a placeholder and should be replaced with a
real mailbox before launch.
