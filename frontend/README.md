# Stockboard (Lab 6 frontend)

React app for the Product Management System. Login is required before product CRUD. All HTTP calls go to a LavaLust API — never directly to MySQL.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `.env.example` to `.env`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | LavaLust API base URL, no trailing slash |
| `VITE_USE_MOCK` | `true` for a local demo (no backend). `false` to call the real API |

Mock login: `admin@stockboard.local` / `password123`

## Expected LavaLust endpoints

Bearer JWT on every product request.

- `POST /auth/login` body `{ "email", "password" }` → `{ access_token, refresh_token, expires_in, token_type, user }`
- `POST /auth/refresh` body `{ "refresh_token" }`
- `POST /auth/logout`
- `GET /products`
- `POST /products` body `{ product_name, description, price, quantity }`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Product fields match the lab table: `id`, `product_name`, `description`, `price`, `quantity`, `created_at`.
