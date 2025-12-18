# Deployment Guide (Docker)

This project is configured for containerized deployment using Docker and Docker Compose.

## Prerequisites
- Docker Installed
- Docker Compose Installed

## Structure
- **Dockerfile**: Multi-stage build (deps -> builder -> runner) for optimized image size.
- **docker-compose.yml**: Orchestrates the service and persists the SQLite database.
- **.dockerignore**: Excludes unnecessary files.

## How to Deploy

1. **Build and Run**:
   Run the following command in the project root:
   ```bash
   docker-compose up -d --build
   ```

2. **Access**:
   The application will be available at `http://localhost:3000`.

3. **Database Persistence**:
   The SQLite database file (`dev.db`) is located in the `./prisma` directory.
   This directory is mounted to `/app/prisma` in the container.
   - **Important**: Ensure your local `prisma/dev.db` exists. If deploying fresh, the container might start without a DB if not initialized. 
   - **Initialization** (if fresh):
     If `dev.db` does not exist, you might need to run migration inside the container or locally before mounting.
     *Locally*: `npx prisma db push`
     *Inside Container*: `docker-compose exec gym-app npx prisma db push`

4. **Environment Variables**:
   Update `docker-compose.yml` or use a `.env` file to set secrets like `SESSION_SECRET`.

## Troubleshooting
- If you see database errors, ensure the `./prisma` folder permissions allow the Docker user to read/write `dev.db`.
