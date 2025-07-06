# Linkly Architecture Documentation

## Overview

This document provides a detailed technical overview of the Linkly URL shortener service architecture, design decisions, and implementation details.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web App  │  Mobile App  │  Browser Extension  │  Third-party    │
│           │              │                     │  Integrations   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│          Load Balancer (Nginx) + Rate Limiting                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                    Express.js API Server                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Routes    │ │ Controllers │ │  Services   │ │ Middleware  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │   Prisma    │ │    Cache    │ │   Search    │ │   Queue     ││
│ │     ORM     │ │   (Redis)   │ │(Elasticsearch)│ │  (Bull)     ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Layer                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ PostgreSQL  │ │   File      │ │   Metrics   │ │   Logs      ││
│ │  Database   │ │  Storage    │ │  (Prometheus)│ │(Winston/ELK)││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 20.10.0 | JavaScript runtime environment |
| Language | TypeScript | 5.8.3 | Type-safe JavaScript development |
| Framework | Express.js | 5.1.0 | Web application framework |
| Database | PostgreSQL | Latest | Primary data storage |
| ORM | Prisma | 6.6.0 | Database access and migrations |
| Containerization | Docker | Latest | Application containerization |

### Development & DevOps

| Tool | Purpose |
|------|---------|
| ESLint | Code linting and quality assurance |
| Prettier | Code formatting and style consistency |
| Nodemon | Development server with hot reload |
| ts-node-dev | TypeScript development execution |
| Docker Compose | Multi-container development setup |
| Winston | Structured logging |

### Utilities & Libraries

| Library | Purpose |
|---------|---------|
| nanoid | URL-safe unique ID generation |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |
| lru-cache | In-memory caching with LRU eviction |

## Application Structure

### Directory Structure

```
server/
├── src/                    # Source code
│   ├── app.ts             # Application entry point
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── models/           # Data models and types
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── common/           # Shared components
│       └── logger.ts     # Winston logger setup
├── prisma/               # Database configuration
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── dist/                 # Compiled JavaScript (build output)
├── logs/                 # Application logs
├── tests/                # Test files
└── docs/                 # API documentation
```

### Code Organization Principles

1. **Separation of Concerns**: Clear separation between routes, controllers, services, and data access
2. **Dependency Injection**: Loose coupling between components
3. **Single Responsibility**: Each module has a single, well-defined purpose
4. **Type Safety**: Comprehensive TypeScript usage
5. **Error Handling**: Centralized error handling middleware

## Data Architecture

### Database Design

#### Current Schema (Development Phase)
```sql
-- Temporary table for initial setup
CREATE TABLE "temp" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "temp_pkey" PRIMARY KEY ("id")
);
```

#### Planned Production Schema
```sql
-- Users table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- URLs table
CREATE TABLE "urls" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "original_url" TEXT NOT NULL,
    "short_code" VARCHAR(10) UNIQUE NOT NULL,
    "custom_alias" VARCHAR(50) UNIQUE,
    "user_id" UUID REFERENCES "users"("id"),
    "clicks" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Click analytics table
CREATE TABLE "clicks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "url_id" UUID REFERENCES "urls"("id"),
    "ip_address" INET,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" VARCHAR(2),
    "city" VARCHAR(100),
    "clicked_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table
CREATE TABLE "api_keys" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id"),
    "key_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Data Access Patterns

1. **Repository Pattern**: Data access abstraction
2. **Query Optimization**: Database indexing and query optimization
3. **Connection Pooling**: Efficient database connection management
4. **Migrations**: Version-controlled schema changes

## Security Architecture

### Authentication & Authorization

```typescript
// Planned authentication flow
interface AuthStrategy {
  jwt: JWTStrategy;
  apiKey: APIKeyStrategy;
  oauth: OAuthStrategy;
}

// Role-based access control
enum UserRole {
  FREE = 'free',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}
```

### Security Measures

1. **Input Validation**: Comprehensive request validation
2. **Rate Limiting**: API rate limiting to prevent abuse
3. **CORS Configuration**: Secure cross-origin requests
4. **Environment Variables**: Secure configuration management
5. **SQL Injection Prevention**: Prisma ORM protection
6. **Password Hashing**: bcrypt for password security
7. **JWT Tokens**: Stateless authentication

## Logging Architecture

### Winston Logger Configuration

```typescript
// Multi-transport logging setup
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

### Log Structure

- **Levels**: error, warn, info, debug
- **Format**: Structured JSON for production
- **Rotation**: Log rotation for disk space management
- **Monitoring**: Integration with monitoring systems

## Performance Architecture

### Caching Strategy

1. **In-Memory Cache**: LRU cache for frequently accessed URLs
2. **Database Query Optimization**: Indexed queries and connection pooling
3. **CDN Integration**: Static asset delivery
4. **Response Compression**: gzip compression for API responses

### Scalability Considerations

1. **Horizontal Scaling**: Stateless application design
2. **Database Sharding**: Future database partitioning strategy
3. **Load Balancing**: Multiple instance support
4. **Microservices Ready**: Modular architecture for service separation

## API Design

### RESTful Principles

```typescript
// Planned API endpoints structure
interface APIEndpoints {
  'POST /api/auth/login': AuthEndpoint;
  'POST /api/auth/register': AuthEndpoint;
  'POST /api/urls': CreateURLEndpoint;
  'GET /api/urls': ListURLsEndpoint;
  'GET /api/urls/:id': GetURLEndpoint;
  'PUT /api/urls/:id': UpdateURLEndpoint;
  'DELETE /api/urls/:id': DeleteURLEndpoint;
  'GET /api/analytics/:shortCode': AnalyticsEndpoint;
  'GET /:shortCode': RedirectEndpoint;
}
```

### Response Format

```typescript
// Standardized API response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    timestamp: string;
  };
}
```

## Deployment Architecture

### Docker Configuration

```dockerfile
# Multi-stage build for optimization
FROM node:20.10.0-alpine as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.10.0-alpine as build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20.10.0-alpine as runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Configuration

```yaml
# docker-compose.yml structure
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: linkly
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## Monitoring & Observability

### Application Metrics

1. **Performance Metrics**: Response times, throughput
2. **Business Metrics**: URL creation rate, click-through rate
3. **Error Tracking**: Error rates and error details
4. **Resource Usage**: CPU, memory, disk usage

### Health Checks

```typescript
// Health check endpoint structure
interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: {
    database: 'connected' | 'disconnected';
    cache: 'connected' | 'disconnected';
  };
}
```

## Future Enhancements

### Planned Features

1. **Analytics Dashboard**: Real-time URL analytics
2. **Custom Domains**: User-defined short domains
3. **QR Code Generation**: Automatic QR code creation
4. **Bulk URL Operations**: Batch URL processing
5. **API Rate Limiting**: Tiered API access
6. **Webhook Support**: Real-time event notifications

### Technical Improvements

1. **Microservices Migration**: Service decomposition
2. **Event-Driven Architecture**: Asynchronous processing
3. **GraphQL API**: Alternative API interface
4. **Real-time Features**: WebSocket support
5. **Advanced Analytics**: Machine learning insights

## Development Guidelines

### Code Style

- **TypeScript First**: Full type coverage
- **Functional Programming**: Prefer pure functions
- **Error Handling**: Comprehensive error handling
- **Testing**: Unit and integration tests
- **Documentation**: Inline code documentation

### Git Workflow

1. **Feature Branches**: Isolated feature development
2. **Pull Requests**: Code review process
3. **Automated Testing**: CI/CD pipeline
4. **Semantic Versioning**: Version management

This architecture document serves as a living guide for the Linkly URL shortener service development and will be updated as the project evolves.