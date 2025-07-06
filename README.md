# Linkly - URL Shortener Service

A modern URL shortener service built with Node.js, TypeScript, Express.js, and PostgreSQL. This project provides a robust backend API for creating and managing shortened URLs.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Docker Setup](#docker-setup)
- [Database Management](#database-management)
- [Logging](#logging)
- [Code Quality](#code-quality)
- [Contributing](#contributing)

## 🎯 Project Overview

Linkly is a URL shortener service similar to bit.ly or tinyurl. The project is currently in early development phase with the following planned features:

- **URL Shortening**: Convert long URLs into short, manageable links
- **Custom Aliases**: Allow users to create custom short codes
- **Analytics**: Track click statistics and usage data
- **User Management**: User accounts and link management
- **API-First**: RESTful API design for easy integration
- **Scalable Architecture**: Built with modern technologies for scalability

## 🏗️ Architecture

The application follows a modern microservices-ready architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  Load Balancer  │    │   Monitoring    │
│   (Web/Mobile)  │◄──►│     (Nginx)     │◄──►│   (Logs/APM)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  Express.js API │
                       │   (TypeScript)  │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Prisma ORM    │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │    Database     │
                       └─────────────────┘
```

## 📁 Project Structure

```
url-shortener/
├── README.md                 # Project documentation
├── LICENSE                   # MIT License
└── server/                   # Backend API service
    ├── src/                  # Source code
    │   ├── app.ts           # Main application entry point
    │   └── common/          # Shared utilities
    │       └── logger.ts    # Winston logging configuration
    ├── prisma/              # Database configuration
    │   ├── schema.prisma    # Database schema definition
    │   └── migrations/      # Database migration files
    ├── dist/                # Compiled JavaScript output
    ├── logs/                # Application logs (created at runtime)
    ├── package.json         # Node.js dependencies and scripts
    ├── tsconfig.json        # TypeScript configuration
    ├── Dockerfile           # Docker container configuration
    ├── compose.yaml         # Docker Compose setup
    ├── eslint.config.mjs    # ESLint configuration
    ├── .prettierrc          # Prettier code formatting
    └── nodemon.json         # Development server configuration
```

## 🛠️ Technologies Used

### Backend Technologies
- **Node.js** (v20.10.0) - JavaScript runtime
- **TypeScript** - Type-safe JavaScript development
- **Express.js** (v5.1.0) - Web application framework
- **Prisma** (v6.6.0) - Next-generation ORM for database access
- **PostgreSQL** - Relational database
- **Winston** - Professional logging library

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Nodemon** - Development server with hot reload
- **ts-node-dev** - TypeScript development server

### Infrastructure
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration

### Utilities
- **nanoid** - URL-safe unique ID generator
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **lru-cache** - In-memory caching for performance

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **Docker** (v20.0.0 or higher) - [Download here](https://docker.com/)
- **Docker Compose** (v2.0.0 or higher) - Usually included with Docker
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/isthatsahil/url-shortener.git
cd url-shortener
```

### Step 2: Navigate to Server Directory
```bash
cd server
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Environment Configuration
Create a `.env` file in the `server` directory:
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/linkly_db"

# Server Configuration
PORT=4000
NODE_ENV=development

# Logging Configuration (Optional)
COMBINED_LOG_PATH="logs/combined.log"
ERROR_LOG_PATH="logs/error.log"

# Database Credentials for Docker
POSTGRES_USER=linkly_user
POSTGRES_DB=linkly_db
```

### Step 5: Database Password Setup
Create the database password file for Docker:
```bash
mkdir -p db
echo "your_secure_password_here" > db/password.txt
```

### Step 6: Generate Prisma Client
```bash
npx prisma generate
```

### Step 7: Build the Application
```bash
npm run build
```

### Step 8: Start the Development Server
```bash
npm run dev
```

The server will start at `http://localhost:4000`

## 🔄 Development Workflow

### Running in Development Mode
```bash
# Start with hot reload
npm run dev

# The server will restart automatically when you make changes
```

### Building for Production
```bash
# Clean previous build
npm run clean

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Code Quality Checks
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## 📡 API Documentation

### Current Endpoints

#### Health Check
- **GET** `/`
- **Response**: `"Hello World!"`
- **Description**: Basic health check endpoint

### Planned Endpoints (Coming Soon)

#### Shorten URL
- **POST** `/api/shorten`
- **Body**: `{ "url": "https://example.com/very/long/url" }`
- **Response**: `{ "shortUrl": "http://localhost:4000/abc123", "originalUrl": "https://example.com/very/long/url" }`

#### Redirect to Original URL
- **GET** `/:shortCode`
- **Response**: HTTP 302 redirect to original URL

#### Get URL Analytics
- **GET** `/api/analytics/:shortCode`
- **Response**: Click statistics and analytics data

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

#### Step 1: Start All Services
```bash
# Start database and application
docker compose up --build

# Run in background
docker compose up -d --build
```

#### Step 2: Access the Application
- **API**: http://localhost:1337
- **Database**: localhost:15432

#### Step 3: Stop Services
```bash
docker compose down
```

### Using Dockerfile Only

#### Build the Image
```bash
docker build -t linkly-api .
```

#### Run the Container
```bash
docker run -p 4000:4000 -e PORT=4000 linkly-api
```

## 🗄️ Database Management

### Prisma Commands

#### View Database Schema
```bash
npx prisma studio
```

#### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

#### Reset Database
```bash
npx prisma migrate reset
```

#### Deploy Migrations (Production)
```bash
npx prisma migrate deploy
```

### Current Database Schema

```prisma
model temp {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

*Note: This is a temporary model. The actual URL shortener schema will be implemented soon.*

## 📝 Logging

The application uses Winston for comprehensive logging:

### Log Levels
- **Error**: Application errors and exceptions
- **Warn**: Warning messages
- **Info**: General application information
- **Debug**: Detailed debugging information

### Log Files
- `logs/combined.log` - All log levels
- `logs/error.log` - Error level only
- Console output - Formatted with colors for development

### Log Features
- **Rate Limiting**: Prevents log spam
- **Sensitive Data Sanitization**: Automatically masks passwords
- **Structured Logging**: JSON format for production
- **Timestamp**: ISO 8601 format
- **Environment-based Levels**: Debug in development, Info in production

## ✅ Code Quality

### ESLint Configuration
- TypeScript support
- Recommended rules for JavaScript and TypeScript
- Node.js and browser globals
- Automatic imports organization

### Prettier Configuration
- Single quotes
- No semicolons
- 2-space indentation
- 80 character line width
- No trailing commas

### Development Scripts
```bash
# Check code quality
npm run lint

# Fix issues automatically
npm run lint:fix

# Format code
npm run format
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Changes**
4. **Run Quality Checks**
   ```bash
   npm run lint
   npm run format
   npm run build
   ```
5. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Winston Logger Documentation](https://github.com/winstonjs/winston)

---

**Current Status**: 🚧 Early Development Phase

The project is currently in the initial setup phase. Core URL shortening functionality is being developed. Stay tuned for updates!