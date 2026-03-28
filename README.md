# personal_kasir_warung_keren

## Docker Setup

This project is dockerized with two services and non-colliding host ports:

- Frontend: `http://localhost:5180`
- Backend API: `http://localhost:8010`

### Prerequisites

- Docker
- Docker Compose
- Existing env files:
  - `backend/.env`
  - `frontend/.env`

### Run

```bash
docker compose up --build -d
```

### Verify

```bash
docker compose ps
curl http://localhost:8010/
```

Then open `http://localhost:5180` in your browser.

### Stop

```bash
docker compose down
```
