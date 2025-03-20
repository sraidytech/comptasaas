# Testing Guide for SRACOM_COMPTA_MANAGEMENT

This guide will help you test the implemented features of the SRACOM_COMPTA_MANAGEMENT system.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- Postman or another API testing tool (optional)

## Setup and Running the Application

1. **Start the application using Docker Compose**:

```bash
docker-compose up -d
```

This will start the PostgreSQL database, the NestJS backend, and the Next.js frontend.

2. **Reset and seed the database**:

```bash
# If using Docker:
docker-compose exec backend sh -c "npm run prisma:reset"

# If running locally:
cd server
npm run prisma:reset
```

This will reset the database and run the seed script, creating the roles, tenants, and users defined in `server/prisma/seed.ts`.

You can also run individual Prisma commands using the npm scripts:

```bash
# Run migrations
npm run prisma:migrate

# Run seed script only
npm run prisma:seed
```

## User Credentials for Testing

The seed script creates the following users:

1. **Super Admin**:
   - Email: `superadmin@example.com`
   - Password: `password123`
   - Role: SUPER_ADMIN
   - No tenant association (can access all tenants)

2. **Default Tenant Admin**:
   - Email: `admin@example.com`
   - Password: `password123`
   - Role: ADMIN
   - Tenant: Default Tenant

3. **Default Tenant Employee**:
   - Email: `employee@example.com`
   - Password: `password123`
   - Role: EMPLOYEE
   - Tenant: Default Tenant

4. **Second Tenant Admin**:
   - Email: `admin2@example.com`
   - Password: `password123`
   - Role: ADMIN
   - Tenant: Second Tenant

## Testing Authentication

### 1. Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "superadmin@example.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "superadmin@example.com",
    "username": "superadmin",
    "role": "SUPER_ADMIN"
  }
}
```

### 2. Register a New User

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "password123",
  "tenantId": "ID_OF_DEFAULT_TENANT"
}
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "newuser@example.com",
    "username": "newuser",
    "role": "EMPLOYEE",
    "tenantId": "ID_OF_DEFAULT_TENANT"
  }
}
```

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Testing Client Management

For all these requests, you need to include the Authorization header with the Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1. Create a Client

**Endpoint**: `POST /clients`

**Request Body**:
```json
{
  "name": "Test Client",
  "email": "client@example.com",
  "phone": "+212 555-1234",
  "type": "PERSONNE_MORALE",
  "tenantId": "ID_OF_DEFAULT_TENANT",
  "ice": "001234567890123",
  "if": "12345678"
}
```

### 2. Get All Clients

**Endpoint**: `GET /clients`

To filter by tenant:

**Endpoint**: `GET /clients?tenantId=ID_OF_DEFAULT_TENANT`

### 3. Get Client by ID

**Endpoint**: `GET /clients/:id`

### 4. Update Client

**Endpoint**: `PATCH /clients/:id`

**Request Body**:
```json
{
  "name": "Updated Client Name",
  "email": "updated@example.com"
}
```

### 5. Delete Client

**Endpoint**: `DELETE /clients/:id`

### 6. Assign Client to User

**Endpoint**: `POST /clients/:clientId/assign/:userId`

### 7. Remove Client from User

**Endpoint**: `DELETE /clients/:clientId/assign/:userId`

### 8. Get Users Assigned to Client

**Endpoint**: `GET /clients/:clientId/users`

## Testing Tenant Isolation

To test tenant isolation, you can:

1. Login as the Default Tenant Admin (`admin@example.com`)
2. Try to access clients from the Second Tenant
3. You should receive a 403 Forbidden error

Then:

1. Login as the Super Admin (`superadmin@example.com`)
2. Try to access clients from both tenants
3. You should be able to access all clients

## Testing with Postman

We've provided a Postman collection and environment to help you test the API endpoints.

### Setting Up Postman

1. Import the Postman collection:
   - Open Postman
   - Click "Import" > "File" > Select `SRACOM_COMPTA_MANAGEMENT.postman_collection.json`

2. Import the Postman environment:
   - Click "Import" > "File" > Select `SRACOM_COMPTA_MANAGEMENT.postman_environment.json`

3. Populate the environment variables:
   - After running the seed script, run the populate-postman-env script to automatically fill in the role and tenant IDs:
   ```bash
   # If using Docker:
   docker-compose exec backend sh -c "npm run postman:env"
   
   # If running locally:
   cd server
   npm run postman:env
   ```

4. Select the environment:
   - In Postman, select the "SRACOM_COMPTA_MANAGEMENT" environment from the dropdown in the top right

### Using the Postman Collection

1. Start with authentication:
   - Run the "Login (Super Admin)" request to get an access token
   - The script automatically sets the `accessToken` and `refreshToken` environment variables

2. Test other endpoints:
   - All requests in the collection are pre-configured to use the access token
   - The collection includes requests for all implemented endpoints
   - Some requests automatically set environment variables (like `clientId` and `userId`) for use in subsequent requests

3. Test tenant isolation:
   - Login as different users (Super Admin, Admin, Employee)
   - Try accessing resources from different tenants to verify the tenant isolation middleware works correctly

## Testing with curl

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

### Create Client

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"name":"Test Client","email":"client@example.com","phone":"+212 555-1234","type":"PERSONNE_MORALE","tenantId":"ID_OF_DEFAULT_TENANT"}'
```

## Testing the Frontend

1. Navigate to `http://localhost:3000` in your browser
2. Login with one of the test user credentials
3. Explore the UI to test the implemented features

## Troubleshooting

- If you encounter CORS issues, ensure the backend is properly configured to allow requests from the frontend
- If authentication fails, check that the JWT_SECRET in the .env file matches the one used by the application
- If database seeding fails, check the Prisma schema and seed file for errors
