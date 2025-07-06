# Development Setup Guide

This guide provides detailed instructions for setting up the Linkly URL shortener development environment.

## Quick Start (TL;DR)

```bash
# Clone and setup
git clone https://github.com/isthatsahil/url-shortener.git
cd url-shortener/server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Start development
npm run dev
```

## Detailed Setup Instructions

### Prerequisites Check

Before starting, verify you have the required tools:

```bash
# Check Node.js version (should be ≥18.0.0)
node --version

# Check npm version (should be ≥8.0.0)
npm --version

# Check Docker version (should be ≥20.0.0)
docker --version

# Check Docker Compose version (should be ≥2.0.0)
docker compose version
```

### Step 1: Repository Setup

```bash
# Clone the repository
git clone https://github.com/isthatsahil/url-shortener.git

# Navigate to the project directory
cd url-shortener

# Navigate to the server directory
cd server
```

### Step 2: Environment Configuration

#### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

#### Configure Environment Variables

Edit the `.env` file with your settings:

```bash
# Database Configuration
DATABASE_URL="postgresql://linkly_user:your_password@localhost:5432/linkly_db"

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration (for future authentication)
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN="7d"

# Logging Configuration
LOG_LEVEL="debug"
COMBINED_LOG_PATH="logs/combined.log"
ERROR_LOG_PATH="logs/error.log"

# Docker Database Configuration
POSTGRES_USER=linkly_user
POSTGRES_DB=linkly_db
POSTGRES_PASSWORD=your_secure_password

# Redis Configuration (for future caching)
REDIS_URL="redis://localhost:6379"

# Rate Limiting (for future implementation)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window

# Analytics Configuration (for future implementation)
ANALYTICS_ENABLED=true
GEOLOCATION_API_KEY="your_geolocation_api_key"
```

#### Create Database Password File

```bash
# Create db directory
mkdir -p db

# Create password file for Docker
echo "your_secure_password" > db/password.txt

# Secure the password file
chmod 600 db/password.txt
```

### Step 3: Dependency Installation

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 4: Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker compose up db -d

# Wait for database to be ready
docker compose logs db -f
# Wait for "database system is ready to accept connections"
```

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
createdb linkly_db

# Create user
psql -c "CREATE USER linkly_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE linkly_db TO linkly_user;"
```

### Step 5: Prisma Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 6: Build and Test

```bash
# Build the TypeScript code
npm run build

# Verify build was successful
ls -la dist/

# Run linting
npm run lint

# Format code
npm run format
```

### Step 7: Start Development Server

```bash
# Start development server with hot reload
npm run dev

# Alternative: Start production build
npm start
```

The server should now be running at `http://localhost:4000`

### Step 8: Verify Setup

Test the API endpoints:

```bash
# Test health check endpoint
curl http://localhost:4000/

# Expected response: "Hello World!"
```

## Development Workflow

### Daily Development

```bash
# Start your development session
npm run dev

# In another terminal, run tests (when available)
npm test

# Run linting to check code quality
npm run lint

# Format code before committing
npm run format
```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Edit TypeScript files in `src/`
   - The development server will automatically reload

3. **Test your changes**:
   ```bash
   # Run linting
   npm run lint
   
   # Fix linting issues
   npm run lint:fix
   
   # Format code
   npm run format
   
   # Build to check for compilation errors
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Database Changes

When modifying the database schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name your_migration_name

# 3. Regenerate Prisma client
npx prisma generate
```

## Docker Development

### Full Docker Setup

```bash
# Start all services (database + application)
docker compose up --build

# Start in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Database Only

```bash
# Start only the database
docker compose up db -d

# Connect to database
docker compose exec db psql -U linkly_user -d linkly_db
```

### Application Container

```bash
# Build application image
docker build -t linkly-api .

# Run application container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://linkly_user:password@host.docker.internal:5432/linkly_db" \
  linkly-api
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3000 npm run dev
```

#### 2. Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

#### 3. Prisma Issues

```bash
# Reset database (⚠️ This will delete all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Check database status
npx prisma migrate status
```

#### 4. TypeScript Compilation Errors

```bash
# Clean build directory
npm run clean

# Rebuild
npm run build

# Check TypeScript configuration
npx tsc --showConfig
```

#### 5. Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment-Specific Issues

#### Windows Users

```powershell
# Use PowerShell or Command Prompt
# Replace forward slashes with backslashes in paths
# Use 'copy' instead of 'cp' for file operations

# Example:
copy .env.example .env
```

#### macOS Users

```bash
# Install Docker Desktop for Mac
# Use Homebrew for additional tools:
brew install postgresql  # If using local PostgreSQL
```

#### Linux Users

```bash
# Install Docker and Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

## Development Tools

### VS Code Setup

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-docker",
    "ms-vscode.vscode-prisma"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Useful Commands

```bash
# Development commands
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run clean        # Clean build directory

# Code quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Database commands
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed   # Seed database (when implemented)

# Docker commands
docker compose up    # Start all services
docker compose down  # Stop all services
docker compose logs  # View logs
docker compose ps    # List running services
```

## Performance Tips

### Development Performance

1. **Use SSD**: Store the project on an SSD for faster file I/O
2. **Increase Node.js Memory**: For large projects:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```
3. **Use TypeScript Project References**: For faster compilation in larger codebases

### Docker Performance

1. **Use .dockerignore**: Exclude unnecessary files
2. **Multi-stage Builds**: Optimize Docker image size
3. **Volume Mounts**: Use volumes for persistent data

## Getting Help

### Documentation

- [Express.js Documentation](https://expressjs.com/en/guide/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Community Support

- [Express.js GitHub Issues](https://github.com/expressjs/express/issues)
- [Prisma Community](https://www.prisma.io/community)
- [Node.js Help](https://nodejs.org/en/help/)

### Project-Specific Help

For project-specific issues:

1. Check the [GitHub Issues](https://github.com/isthatsahil/url-shortener/issues)
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment details
   - Error messages (if any)

## Next Steps

After completing the setup:

1. **Explore the codebase**: Understand the current structure
2. **Read the Architecture document**: Learn about the system design
3. **Check the project roadmap**: See planned features
4. **Start contributing**: Pick up a beginner-friendly issue

Happy coding! 🚀