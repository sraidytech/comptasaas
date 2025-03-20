import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
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
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
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

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async create(createTenantDto: CreateTenantDto) {
    // Check if tenant with the same name already exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { name: createTenantDto.name },
    });

    if (existingTenant) {
      throw new ConflictException(
        `Tenant with name '${createTenantDto.name}' already exists`,
      );
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    // Check if tenant exists
    await this.findOne(id);

    // Check if name is being updated and if it conflicts with an existing tenant
    if (updateTenantDto.name) {
      const existingTenant = await this.prisma.tenant.findFirst({
        where: {
          name: updateTenantDto.name,
          id: { not: id },
        },
      });

      if (existingTenant) {
        throw new ConflictException(
          `Tenant with name '${updateTenantDto.name}' already exists`,
        );
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    // Check if tenant exists
    await this.findOne(id);

    // Check if tenant has any associated data
    const tenantData = await this.prisma.tenant.findUnique({
      where: { id },
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

    if (!tenantData) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    const hasAssociatedData =
      tenantData._count.users > 0 ||
      tenantData._count.clients > 0 ||
      tenantData._count.declarations > 0 ||
      tenantData._count.livres > 0;

    if (hasAssociatedData) {
      throw new ConflictException(
        'Cannot delete tenant with associated users, clients, declarations, or livres',
      );
    }

    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async getTenantStats(id: string) {
    // Check if tenant exists
    await this.findOne(id);

    const [userCount, clientCount, declarationCount, livreCount] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId: id } }),
        this.prisma.client.count({ where: { tenantId: id } }),
        this.prisma.declaration.count({ where: { tenantId: id } }),
        this.prisma.livre.count({ where: { tenantId: id } }),
      ]);

    // Get user counts by role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      where: { tenantId: id },
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

    return {
      userCount,
      clientCount,
      declarationCount,
      livreCount,
      userRoleDistribution,
    };
  }
}
