import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      tenantCount,
      userCount,
      clientCount,
      declarationCount,
      livreCount,
      roleCount,
      permissionCount,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.client.count(),
      this.prisma.declaration.count(),
      this.prisma.livre.count(),
      this.prisma.role.count(),
      this.prisma.permission.count(),
    ]);

    // Get user counts by role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      _count: true,
    });

    // Get role names
    const roles = await this.prisma.role.findMany({
      select: { id: true, name: true },
    });

    // Map role IDs to names and counts
    const userRoleDistribution = usersByRole.map((item) => {
      const role = roles.find((r) => r.id === item.roleId);
      return {
        role: role ? role.name : 'Unknown',
        count: item._count,
      };
    });

    // Get tenant statistics
    const tenants = await this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            declarations: true,
            livres: true,
          },
        },
      },
    });

    return {
      counts: {
        tenants: tenantCount,
        users: userCount,
        clients: clientCount,
        declarations: declarationCount,
        livres: livreCount,
        roles: roleCount,
        permissions: permissionCount,
      },
      userRoleDistribution,
      tenants: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        userCount: tenant._count.users,
        clientCount: tenant._count.clients,
        declarationCount: tenant._count.declarations,
        livreCount: tenant._count.livres,
      })),
    };
  }

  async getSystemHealth() {
    // Get database connection status
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    // Get system memory usage
    const memoryUsage = process.memoryUsage();

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      },
    };
  }
}
