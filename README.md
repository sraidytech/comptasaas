# SRACOM COMPTA MANAGEMENT System

A comprehensive multi-tenant accounting management system for accounting firms and financial service providers to manage their clients' financial declarations, accounting books, and related documents.

## Project Structure

The project is divided into two main parts:

- **Backend**: NestJS application with TypeScript, PostgreSQL, and Prisma
- **Frontend**: Next.js application with TypeScript, Tailwind CSS, and shadcn/ui

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd SRACOM_COMPTA_NEW
```

2. Create a `.env` file in the `server` directory with the following content:

```
# Environment variables
NODE_ENV=development

# Database connection
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sracom_compta?schema=public"

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Server port
PORT=3000
```

3. Start the application using Docker Compose:

```bash
docker-compose up -d
```

4. The application will be available at:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api

### Running Locally (Development)

#### Backend

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following content (adjust as needed):

```
# Environment variables
NODE_ENV=development

# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sracom_compta?schema=public"

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Server port
PORT=3000
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

6. Start the development server:

```bash
npm run start:dev
```

#### Frontend

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

5. The frontend will be available at http://localhost:3000

## Features

- Multi-tenant architecture
- Role-based access control
- Client management
- Declaration management
- Livre (accounting book) management
- Task management
- Document management
- User management

## Technology Stack

### Backend

- NestJS with TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger/OpenAPI

### Frontend

- Next.js 14+ with TypeScript and App Router
- Tailwind CSS
- shadcn/ui components
- React Hook Form with Zod validation

## Project Structure

### Backend

```
server/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── auth/            # Authentication module
│   ├── common/          # Common utilities and services
│   ├── prisma/          # Prisma service
│   ├── users/           # Users module
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
└── test/                # End-to-end tests
```

### Frontend

```
client/
├── public/              # Static assets
└── src/
    ├── app/             # Next.js App Router
    │   ├── (auth)/      # Authentication pages
    │   ├── (dashboard)/ # Dashboard pages
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/      # UI components
    │   └── ui/          # shadcn/ui components
    └── lib/             # Utility functions
```

## License

[MIT](LICENSE)
