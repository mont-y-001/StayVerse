# StayVerse

StayVerse is a MERN property-booking application. Guests register as **users** to browse and book stays; **owners** register separately to publish and manage only their own properties. An optional **admin** role can manage all data.

## Stack

- React 19 + Vite frontend (`frontend`)
- Express + MongoDB/Mongoose API (`backend`)
- JWT authentication and bcrypt password hashing
- Vercel frontend deployment and Render API deployment

## Roles and flows

- **User:** browse rooms, select dates, make a booking, view and cancel their own bookings.
- **Owner:** publish properties, view their published properties, and update/delete only those properties through the API.
- **Admin:** set `role: "admin"` (or legacy `is_admin: true`) directly in MongoDB; this role can manage all properties and data.

Bookings are validated by the API. The server calculates the price from the saved property rate and rejects date ranges that overlap an active booking. The card form is a demo checkout UI only; no payment gateway is connected.

## Local setup

1. Install dependencies:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Create `backend/.env` from `backend/.env.example` and set `MONGODB_URI`, a long `JWT_SECRET`, and `CLIENT_URL=http://localhost:5173`.

3. Start the API and frontend in separate terminals:

   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

The Vite development server proxies `/api` to `http://localhost:5000`.

## Deploy

### Render API

Create a Render Web Service from this repository, using `backend` as the root directory (or deploy using `render.yaml`). Set:

- `MONGODB_URI` — a MongoDB Atlas connection string
- `JWT_SECRET` — long random secret
- `CLIENT_URL` — your Vercel URL, for example `https://stayverse.vercel.app`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials used only by the API to upload owner property photos

After deployment, copy the API URL, for example `https://stayverse-api.onrender.com`.

### Vercel frontend

Import the same repository in Vercel. `vercel.json` builds `frontend` and serves its `dist` directory. Add this Vercel environment variable before deploying:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
```

Then update Render's `CLIENT_URL` to the final Vercel URL and redeploy the Render service. For preview domains, provide a comma-separated `CLIENT_URL` list.

Never put `CLOUDINARY_API_SECRET` or any other secret in the frontend `.env`, Git, or a browser-facing Vercel variable. Rotate any secret that has been shared publicly.

## API summary

- `POST /api/auth/register` (`role`: `user` or `owner`)
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/rooms`, `GET /api/rooms/:id`
- Owner: `GET /api/rooms/mine`, `POST|PUT|DELETE /api/rooms`
- User: `POST /api/bookings`, `GET /api/bookings/my`, `PATCH /api/bookings/:id/cancel`
- Owner: `GET /api/bookings/owner`
