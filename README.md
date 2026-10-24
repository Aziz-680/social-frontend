# Social frontend

A responsive social network frontend for the [Social-App API](https://github.com/Aziz-680/Social-App). It supports sign-in and registration, a privacy-aware feed, posts with photos, profile and work experience, people search, friend requests, reactions, comments, and sharing public posts.

## Run locally

1. Start the backend on `http://localhost:3000` using its setup instructions.
2. Install frontend dependencies with `npm install`.
3. Start the frontend with `npm run dev`.
4. Open `http://localhost:3001`.

The Next.js rewrite proxies `/api/*` requests to the backend, and the frontend's development port matches the backend's configured CORS origin.

## Commands

- `npm run dev` — Start the development server on port 3001.
- `npm run lint` — Run ESLint.
- `npm run build` — Create a production build.

The backend uses an HTTP-only `token` cookie for authenticated requests. Its supported routes and validation rules are documented in the API repository.
