# Testing the Super Admin Functionality

This guide will help you test the Super Admin functionality that has been implemented.

## Login as Super Admin

1. Restart the Docker containers to apply all changes:
   ```bash
   # Stop any running containers
   docker-compose down

   # Rebuild and start the containers
   docker-compose up --build -d
   ```

   Alternatively, if you're running the application locally:
   ```bash
   # In one terminal, start the backend
   cd server
   npm run start:dev
   
   # In another terminal, start the frontend
   cd client
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000/login`

3. Use the following credentials to log in as a Super Admin:
   - Email: `sracomconnect@gmail.com`
   - Password: `SracomConnect@2025Sr`

4. After logging in, you should be automatically redirected to the Super Admin dashboard at `/admin`

## Super Admin Features

The Super Admin dashboard provides access to the following features:

1. **Tenant Management**
   - View all tenants in the system
   - Create new tenants
   - Edit existing tenants
   - View tenant statistics

2. **User Management**
   - Create admin users for different tenants
   - Manage user roles and permissions

3. **Declaration Type Management**
   - Create and manage declaration types
   - Configure which months declarations are required

4. **Livre Type Management**
   - Create and manage livre types
   - Configure which months livres are required

5. **Role and Permission Management**
   - View and manage system roles
   - Configure permissions for each role

## Testing the Role-Based Redirection

1. Log in as a Super Admin (using the credentials above)
   - You should be redirected to `/admin`
   - The admin dashboard should display the Super Admin interface

2. Log out and log in as a regular admin (any other email/password)
   - You should be redirected to `/dashboard`
   - The regular dashboard should be displayed

## Troubleshooting

If you're not seeing the Super Admin interface after logging in with the correct credentials, try the following:

1. Clear your browser's local storage:
   - Open Developer Tools (F12 or Ctrl+Shift+I)
   - Go to the "Application" tab
   - Select "Local Storage" on the left
   - Clear all items

2. Make sure you're using the exact credentials specified above

3. Check the browser console for any errors

## Implementation Details

The Super Admin functionality is implemented using:

1. Role-based authentication and authorization
2. Client-side redirection based on user role
3. Protected routes that check user permissions
4. Separate layouts for admin and regular users

For more detailed information about the implementation, refer to the `SUPER_ADMIN_IMPLEMENTATION.md` file.
