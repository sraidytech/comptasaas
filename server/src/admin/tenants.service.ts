/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto, UpdateTenantSubscriptionDto } from './dto';
import { SubscriptionPlan, PaymentStatus } from './entities';

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

    // If isActive is being updated to false, also update all users in this tenant
    if (updateTenantDto.isActive === false) {
      // Update all users in this tenant to be inactive
      await this.prisma.user.updateMany({
        where: { tenantId: id },
        data: { isActive: false },
      });
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

  async updateSubscription(id: string, updateSubscriptionDto: UpdateTenantSubscriptionDto) {
    // Check if tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    // Validate subscription dates
    const startDate = new Date(updateSubscriptionDto.subscriptionStart);
    const endDate = new Date(updateSubscriptionDto.subscriptionEnd);
    
    if (startDate >= endDate) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    // Calculate expected end date based on plan
    let expectedEndDate: Date;
    if (updateSubscriptionDto.subscriptionPlan === SubscriptionPlan.SIX_MONTHS) {
      expectedEndDate = new Date(startDate);
      expectedEndDate.setMonth(expectedEndDate.getMonth() + 6);
    } else if (updateSubscriptionDto.subscriptionPlan === SubscriptionPlan.ONE_YEAR) {
      expectedEndDate = new Date(startDate);
      expectedEndDate.setFullYear(expectedEndDate.getFullYear() + 1);
    } else {
      throw new BadRequestException('Plan d\'abonnement invalide');
    }

    // Check if end date matches expected end date (with 1 day tolerance)
    const timeDiff = Math.abs(expectedEndDate.getTime() - endDate.getTime());
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff > 1) {
      throw new BadRequestException(
        `La date de fin ne correspond pas à la durée du plan. Pour un plan de ${
          updateSubscriptionDto.subscriptionPlan === SubscriptionPlan.SIX_MONTHS ? '6 mois' : '1 an'
        }, la date de fin devrait être ${expectedEndDate.toISOString().split('T')[0]}`
      );
    }

    // Validate payment reference if status is PAID or PENDING
    if (
      (updateSubscriptionDto.paymentStatus === PaymentStatus.PAID || 
       updateSubscriptionDto.paymentStatus === PaymentStatus.PENDING) && 
      !updateSubscriptionDto.paymentReference
    ) {
      throw new BadRequestException('La référence de paiement est requise lorsque le statut est PAYÉ ou EN ATTENTE');
    }

    // Prepare update data
    const updateData: any = {
      subscriptionPlan: updateSubscriptionDto.subscriptionPlan,
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
      paymentStatus: updateSubscriptionDto.paymentStatus,
      paymentMethod: updateSubscriptionDto.paymentMethod,
      paymentReference: updateSubscriptionDto.paymentReference,
    };
    
    // If payment status is PAID, ensure tenant is active
    if (updateSubscriptionDto.paymentStatus === PaymentStatus.PAID) {
      updateData.isActive = true;
    }

    // Update tenant subscription
    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }
}
