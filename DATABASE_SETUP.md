# Database Setup Guide

You're getting a database connection error because PostgreSQL is not running. Here are your options:

## Option 1: Install PostgreSQL Locally (Recommended for Development)

### Step 1: Download & Install PostgreSQL
1. Download PostgreSQL 16 from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set a password for the default `postgres` user (remember this!)
   - Keep the default port: 5432
   - Install pgAdmin 4 (recommended for database management)

### Step 2: Create Database and User
After installation, open pgAdmin or use psql command line:

**Option A: Using pgAdmin**
1. Open pgAdmin 4
2. Connect to localhost server (use the password you set)
3. Right-click "Databases" → Create → Database
   - Name: `quizdb`
4. Right-click "Login/Group Roles" → Create → Login/Group Role
   - General tab: Name: `quizuser`
   - Definition tab: Password: `quizpassword`
   - Privileges tab: Check "Can login?"

**Option B: Using Command Line**
```bash
# Open PowerShell as Administrator
psql -U postgres

# In psql prompt, run these commands:
CREATE DATABASE quizdb;
CREATE USER quizuser WITH PASSWORD 'quizpassword';
GRANT ALL PRIVILEGES ON DATABASE quizdb TO quizuser;
\q
```

### Step 3: Update .env File
Your `.env` file should have:
```env
DATABASE_URL="postgresql://quizuser:quizpassword@localhost:5432/quizdb"
```

### Step 4: Run Migrations
```bash
npx prisma migrate dev --name init
```

---

## Option 2: Use Different Database Credentials

If PostgreSQL is already installed but with different credentials, update your `.env` file:

```env
# Use your existing PostgreSQL credentials
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE"
```

For example, if you're using the default `postgres` superuser:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/quizdb"
```

Then create the database:
```bash
# Using psql
psql -U postgres
CREATE DATABASE quizdb;
\q

# Run migrations
npx prisma migrate dev --name init
```

---

## Option 3: Use Docker (If Docker is Installed)

If you have Docker Desktop installed and running:

```bash
# Start only the database container
docker-compose up -d db

# Wait a few seconds for it to start, then run migrations
npx prisma migrate dev --name init

# To run the full app with Docker:
docker-compose up --build
```

---

## Quick Test: Check PostgreSQL Connection

Once PostgreSQL is running, test the connection:

```bash
# This should connect without errors
npx prisma db push
```

If successful, you'll see:
```
✔ Database synchronized with Prisma schema.
```

---

## Troubleshooting

### "Connection refused"
- PostgreSQL service is not running
- Windows: Open Services → Find "postgresql-x64-16" → Start it

### "Authentication failed"
- Wrong username/password in DATABASE_URL
- Check your `.env` file credentials match your PostgreSQL user

### "Database does not exist"
- Create the database first using pgAdmin or psql
- Or use `npx prisma db push` which creates it automatically

---

## Next Steps After Database Setup

1. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit http://localhost:3000

4. Register with a real email to test email verification
   (Don't forget to add Gmail credentials to .env!)

---

Need help? Check the main README.md for more details.
