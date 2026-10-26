# Development and deployment

Use Node.js 20+, npm 10+, and MongoDB. Copy `server/.env.example` to `server/.env`; set a MongoDB URI and a unique 32+ character JWT secret. Set `COOKIE_SECURE=true` behind HTTPS and set `CLIENT_URL` to the exact frontend origin. `VITE_API_BASE_URL` is public client configuration, never a secret.

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
