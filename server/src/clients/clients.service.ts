import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { Client } from './entities';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId?: string): Promise<Client[]> {
    const where = tenantId ? { tenantId } : {};
    const clients = await this.prisma.client.findMany({
      where,
    });
    return clients;
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = await this.prisma.client.create({
      data: createClientDto,
    });
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const client = await this.prisma.client.update({
        where: { id },
        data: updateClientDto,
      });
      return client;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Client> {
    try {
      const client = await this.prisma.client.delete({
        where: { id },
      });
      return client;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByTenant(tenantId: string): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: { tenantId },
    });
    return clients;
  }

  async assignToUser(clientId: string, userId: string): Promise<void> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.clientAssignment.findUnique({
      where: {
        clientId_userId: {
          clientId,
          userId,
        },
      },
    });

    if (existingAssignment) {
      return; // Assignment already exists, no need to create it again
    }

    // Create client assignment
    await this.prisma.clientAssignment.create({
      data: {
        clientId,
        userId,
        clientPermissions: {
          create: [
            { permission: 'READ' },
            { permission: 'WRITE' },
          ],
        },
      },
    });
  }

  async removeFromUser(clientId: string, userId: string): Promise<void> {
    // Check if assignment exists
    const assignment = await this.prisma.clientAssignment.findUnique({
      where: {
        clientId_userId: {
          clientId,
          userId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment for client ${clientId} and user ${userId} not found`,
      );
    }

    // Delete client permissions first (due to foreign key constraints)
    await this.prisma.clientPermission.deleteMany({
      where: { clientAssignmentId: assignment.id },
    });

    // Delete client assignment
    await this.prisma.clientAssignment.delete({
      where: { id: assignment.id },
    });
  }

  async getAssignedUsers(clientId: string): Promise<any[]> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        clientAssignments: {
          include: {
            user: true,
            clientPermissions: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.clientAssignments.map((assignment) => ({
      user: {
        id: assignment.user.id,
        email: assignment.user.email,
        username: assignment.user.username,
      },
      permissions: assignment.clientPermissions.map((p) => p.permission),
    }));
  }
}
