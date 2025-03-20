# Creating a Super Admin User with Postman

You can create a super admin user directly using the API through Postman. Here's how to do it:

## Prerequisites

1. Make sure your Docker containers are running:
   ```
   docker-compose up -d
   ```

2. Import the Postman collection and environment:
   - Open Postman
   - Import `SRACOM_COMPTA_MANAGEMENT.postman_collection.json`
   - Import `SRACOM_COMPTA_MANAGEMENT.postman_environment.json`

## Step 1: Get the Role IDs

### Option 1: Using Prisma Studio

Now that port 5555 is exposed in the docker-compose.yml file, you can access Prisma Studio directly:

```
docker exec -it sracom-backend sh -c "npx prisma studio"
```

Then access Prisma Studio at http://localhost:5555 in your browser.

1. Click on the "Role" table
2. Look for the "SUPER_ADMIN" role and note its ID
3. Also note the IDs of other roles (ADMIN, EMPLOYEE) for future use

### Option 2: Using Direct Database Query

If Prisma Studio doesn't work, you can get the role IDs directly from the database:

```
docker exec -it sracom-backend sh -c "node -e \"const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function main() { const roles = await prisma.role.findMany(); console.log(roles); } main().finally(() => prisma.$disconnect());\""
```

This will output all roles with their IDs.

### Creating Roles (If Needed)

If you don't have any roles yet, you need to create them first:

```
docker exec -it sracom-backend sh -c "node -e \"const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function main() { const superAdminRole = await prisma.role.create({ data: { name: 'SUPER_ADMIN', description: 'Super administrator role with unrestricted access across all tenants' } }); console.log('Created SUPER_ADMIN role:', superAdminRole); } main().finally(() => prisma.$disconnect());\""
```

## Step 2: Update the Postman Environment

1. In Postman, click on the environment dropdown in the top right
2. Select "SRACOM_COMPTA_MANAGEMENT"
3. Click on the "Edit" button (eye icon)
4. Update the values for:
   - `superAdminRoleId`: ID of the SUPER_ADMIN role from Prisma Studio
   - `adminRoleId`: ID of the ADMIN role
   - `employeeRoleId`: ID of the EMPLOYEE role
5. Save the environment

## Step 3: Create a Super Admin User

### Option 1: Using the Register Endpoint

1. In the Postman collection, go to "Authentication" > "Register"
2. Update the request body with your super admin details:
   ```json
   {
     "email": "sracomconnect@gmail.com",
     "username": "sracomadmin",
     "password": "SracomConnect@2025Sr",
     "roleId": "{{superAdminRoleId}}"
   }
   ```
   Note: Do not include a `tenantId` for a super admin user
3. Send the request
4. The response will include access and refresh tokens

### Option 2: Using the Users Endpoint (Requires Authentication)

1. First, login as an existing admin:
   - Go to "Authentication" > "Login (Admin)"
   - Send the request to get an access token
2. Then create the super admin:
   - Go to "Users" > "Create User"
   - Update the request body:
   ```json
   {
     "email": "sracomconnect@gmail.com",
     "username": "sracomadmin",
     "password": "SracomConnect@2025Sr",
     "roleId": "{{superAdminRoleId}}"
   }
   ```
3. Send the request

## Step 4: Test the Super Admin Login

1. Go to "Authentication" > "Login (Super Admin)"
2. Update the request body:
   ```json
   {
     "email": "sracomconnect@gmail.com",
     "password": "SracomConnect@2025Sr"
   }
   ```
3. Send the request
4. You should receive access and refresh tokens

## Step 5: Test Super Admin Privileges

To verify the super admin has cross-tenant access:

1. Create clients in different tenants:
   - Go to "Clients" > "Create Client"
   - Create a client for the default tenant
   - Create another client for the second tenant
2. Get all clients:
   - Go to "Clients" > "Get All Clients"
   - Send the request
   - The super admin should see clients from all tenants

## Direct API Calls (Without Postman)

If you prefer to use curl or another tool, here are the direct API calls:

### Register a Super Admin

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sracomconnect@gmail.com",
    "username": "sracomadmin",
    "password": "SracomConnect@2025Sr",
    "roleId": "YOUR_SUPER_ADMIN_ROLE_ID"
  }'
```

### Login as Super Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sracomconnect@gmail.com",
    "password": "SracomConnect@2025Sr"
  }'
```

Replace `YOUR_SUPER_ADMIN_ROLE_ID` with the actual role ID from your database.
