# Social frontend

A responsive social network frontend for the [Social-App API](https://github.com/Aziz-680/Social-App). It supports sign-in and registration, a privacy-aware feed, posts with photos, profile and work experience, people search, friend requests, direct realtime messaging, post activity notifications, reactions, comments, and sharing public posts.

## Run locally

1. Start the backend on `http://localhost:3000` using its setup instructions.
2. Install frontend dependencies with `npm install`.
3. Start the frontend with `npm run dev`.
4. Open `http://localhost:3001`.

The Next.js rewrite proxies `/api/*` requests to the backend, and the frontend's development port matches the backend's configured CORS origin.

## Production deployment

The frontend can be deployed to a Node-compatible Next.js host or built with the included multi-stage `Dockerfile` (Node 22, standalone output, non-root runtime, health check). Configure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CHAT_SOCKET_URL` **in the frontend build environment**; these public values are embedded into the browser bundle. The Docker build requires both values. Example values are in `.env.example`.

Use HTTPS and custom domains under the same registrable domain, such as `app.example.com` and `api.example.com`. The API sets an HttpOnly, Secure, SameSite=Lax cookie; sibling subdomains are cross-origin but same-site, which allows the browser to send that cookie to the API and Socket.IO with credentials. Set the backend `CORS_ORIGINS` to the exact frontend origin (scheme and host, no path), and set `TRUST_PROXY_HOPS` to the actual trusted proxy count. Configure MongoDB network access for the backend host. Store all backend secrets in the platform's secret manager; never put backend secrets in `NEXT_PUBLIC_*` variables or the frontend image.

For container platforms, build the backend from `../Social-App` using its existing Dockerfile, then build this frontend image with the public API URL and socket origin as build arguments. Deploy the API first, then build/deploy the frontend with its final API domain. Verify the backend `/health/ready`, frontend `/login`, registration/login, cookie-authenticated API requests, Socket.IO chat, and image uploads on the production domains.

## Direct messaging

The `/messages` workspace uses the backend's authenticated direct-chat REST endpoints and Socket.IO events for live messages, typing indicators, and read receipts. The authenticated app shell keeps the socket connected while the user browses other pages, shows incoming-message toasts, and provides a compact recent-messages menu. Incoming messages also create persistent entries in the Activity center. Users can optionally enable browser desktop notifications from the mini menu. Local development connects Socket.IO directly to `http://localhost:3000`. To use another backend host, set `NEXT_PUBLIC_CHAT_SOCKET_URL` to its origin (for example, `https://api.example.com`) and include the frontend origin in the backend's `CORS_ORIGINS`. One image or document attachment up to 10 MB can be sent with a message, and the composer includes an emoji picker. Group chats, message editing/deletion, and voice/video calls are not implemented.

## Commands

- `npm run dev` — Start the development server on port 3001.
- `npm run lint` — Run ESLint.
- `npm run build` — Create a production build.

The backend uses an HTTP-only `token` cookie for authenticated requests. Its supported routes and validation rules are documented in the API repository.

Post activity notifications are fetched from `GET /api/notification`, marked individually with `PATCH /api/notification/:id/read`, or marked all at once with `PATCH /api/notification/read-all`.
