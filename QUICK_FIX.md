# Quick Fix for Database Connection

The issue is Windows Docker networking with PostgreSQL authentication. Here are your options:

## Option 1: Run Everything in Docker (RECOMMENDED)

This is the cleanest solution. Stop the local dev server and run everything in Docker:

```bash
# Stop local dev servers (Ctrl+C on both terminals)

# Rebuild and start everything
docker-compose down
docker-compose up --build
```

**Note**: The initial build will take a few minutes. Once it's done, access at http://localhost:3001

## Option 2: Install PostgreSQL Locally

Install PostgreSQL on Windows and skip Docker entirely:

1. Download from: https://www.postgresql.org/download/windows/
2. Install with password for `postgres` user
3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quizdb"
   ```
4. Create database:
   ```bash
   # In PowerShell as admin
   psql -U postgres
   CREATE DATABASE quizdb;
   \q
   ```
5. Run migrations:
   ```bash
   npx prisma db push
   npm run dev
   ```

## Option 3: Use Docker DB with SQLite for Development

Temporarily use SQLite for development:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
2. Run:
   ```bash
   npx prisma db push
   npm run dev
   ```

## Why This Happens

Windows Docker has networking limitations where containers can't easily be accessed from the host using `localhost`. The PostgreSQL container is running fine, but Windows can't authenticate the connection from outside Docker.

## Recommended Next Step

Try **Option 1** - run everything in Docker:

```bash
docker-compose down
docker-compose up --build
```

Wait 2-3 minutes for the build, then visit http://localhost:3001
