# Sansaland Admin Dashboard

Web dashboard for Sansaland admins: pet owners, business owners, subscribers, services and bookings, ads, support requests, notifications, FAQ and legal pages.

## Run locally

```bash
cp .env.example .env     # set VITE_API_ORIGIN to your backend, e.g. http://localhost:5000
npm install
npm run dev              # http://localhost:5173
```

The backend (`../petApp_backend`) must allow this origin in `CORS_ORIGIN`. Sign in with an `ADMIN` or `SUPER_ADMIN` account.

## Build

```bash
npm run build            # output in dist/
npm run lint
```

`dist/` is a single-page app: configure the host to serve `index.html` for unknown paths.

See `../CLAUDE.md` for the project structure and conventions.
