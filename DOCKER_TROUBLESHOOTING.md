# Docker Database Connection Troubleshooting

## Issue
The database container is running, but Prisma can't connect from the host machine.

## Quick Fix Options

### Option 1: Run Migrations Inside Docker Container (Recommended)

Instead of running migrations from your host, run them inside the Docker container where the connection definitely works:

```bash
# Run migrations inside the container
docker exec quiz_db psql -U quizuser -d quizdb -c "
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DOUBLE PRECISION NOT NULL,
    quiz_data JSONB NOT NULL,
    user_answers JSONB NOT NULL,
    time_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS quiz_results_created_at_idx ON quiz_results(created_at);
"
```

### Option 2: Run the Entire App in Docker

Build and run the full application in Docker (which includes running migrations):

```bash
# Stop just the database
docker-compose down

# Start everything (app + database)
docker-compose up --build
```

The app will be available at http://localhost:3000

### Option 3: Check Windows Firewall

Windows may be blocking the PostgreSQL port. Try:

```bash
# Check if port 5432 is accessible
Test-NetConnection -ComputerName localhost -Port 5432
```

If it fails, temporarily disable Windows Firewall or add an exception for port 5432.

### Option 4: Use Docker Network

Connect your host to the Docker network:

```bash
# Get the database container's IP
docker inspect quiz_db | findstr "IPAddress"

# Update your .env DATABASE_URL to use that IP instead of localhost
# DATABASE_URL="postgresql://quizuser:quizpassword@172.x.x.x:5432/quizdb"
```

## Verification

To verify the database is working from inside the container:

```bash
# This should list your tables
docker exec quiz_db psql -U quizuser -d quizdb -c "\dt"
```

## Recommended: Use Docker for Everything

The simplest solution is to run the entire stack in Docker:

1. Stop the database:
   ```bash
   docker-compose down
   ```

2. Start everything:
   ```bash
   docker-compose up --build
   ```

3. Open http://localhost:3000

This way, everything runs in containers and networking "just works"!

## Alternative: Skip Docker Entirely

If you want to develop without Docker:

1. Stop Docker containers:
   ```bash
   docker-compose down
   ```

2. Install PostgreSQL locally (see DATABASE_SETUP.md)

3. Use localhost PostgreSQL

4. Run:
   ```bash
   npx prisma migrate dev --name init
   npm run dev
   ```
