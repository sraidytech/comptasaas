/**
 * This script queries the database to get IDs for roles and tenants
 * and updates the Postman environment file with these values.
 * 
 * Run this script after seeding the database to prepare for API testing.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching data from database...');
    
    // Get roles
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });
    
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });
    
    const employeeRole = await prisma.role.findUnique({
      where: { name: 'EMPLOYEE' },
    });
    
    // Get tenants
    const defaultTenant = await prisma.tenant.findFirst({
      where: { name: 'Default Tenant' },
    });
    
    const secondTenant = await prisma.tenant.findFirst({
      where: { name: 'Second Tenant' },
    });
    
    if (!superAdminRole || !adminRole || !employeeRole || !defaultTenant || !secondTenant) {
      console.error('Required data not found in database. Have you run the seed script?');
      process.exit(1);
    }
    
    // Read the Postman environment file
    const envFilePath = path.join(__dirname, '../../SRACOM_COMPTA_MANAGEMENT.postman_environment.json');
    const envData = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
    
    // Update the values
    envData.values.forEach(item => {
      switch (item.key) {
        case 'superAdminRoleId':
          item.value = superAdminRole.id;
          break;
        case 'adminRoleId':
          item.value = adminRole.id;
          break;
        case 'employeeRoleId':
          item.value = employeeRole.id;
          break;
        case 'defaultTenantId':
          item.value = defaultTenant.id;
          break;
        case 'secondTenantId':
          item.value = secondTenant.id;
          break;
      }
    });
    
    // Update the export timestamp
    envData._postman_exported_at = new Date().toISOString();
    
    // Write the updated file
    fs.writeFileSync(envFilePath, JSON.stringify(envData, null, 2));
    
    console.log('Postman environment file updated successfully!');
    console.log(`Role IDs:
  - Super Admin: ${superAdminRole.id}
  - Admin: ${adminRole.id}
  - Employee: ${employeeRole.id}
    
Tenant IDs:
  - Default Tenant: ${defaultTenant.id}
  - Second Tenant: ${secondTenant.id}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
