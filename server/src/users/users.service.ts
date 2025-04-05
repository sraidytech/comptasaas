/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { FilterUsersDto } from '../admin/dto';
import { Prisma } from '@prisma/client';
import { PaginatedUsersResponse } from '../common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findAll(
    tenantIdOrFilter?: string | FilterUsersDto,
  ): Promise<User[] | PaginatedUsersResponse> {
    // Handle the case where tenantIdOrFilter is a string (backward compatibility)
    if (typeof tenantIdOrFilter === 'string' || !tenantIdOrFilter) {
      // If tenantIdOrFilter is a string, use it as tenantId, otherwise it's undefined
      const tenantId = 
        typeof tenantIdOrFilter === 'string' ? tenantIdOrFilter
        : undefined;
      const where: Prisma.UserWhereInput = tenantId ? { tenantId } : {};
      const users = await this.prisma.user.findMany({
        where,
        include: {
          role: true,
          tenant: true,
        },
      });
      return users;
    }

    // Handle the case where tenantIdOrFilter is a FilterUsersDto
    const filter = tenantIdOrFilter;

    // Build the where clause
    const where: Prisma.UserWhereInput = {};

    if (filter.tenantId) {
      where.tenantId = filter.tenantId;
    }

    if (filter.roleId) {
      where.roleId = filter.roleId;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.search) {
      where.OR = [
        { username: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Build the orderBy clause
    let orderBy: Prisma.UserOrderByWithRelationInput = {};

    if (filter.sortBy) {
      const direction = filter.sortDirection === 'desc' ? 'desc' : 'asc';

      // Handle nested sorting
      if (filter.sortBy.includes('.')) {
        const [relation, field] = filter.sortBy.split('.');
        orderBy = {
          [relation]: {
            [field]: direction,
          },
        };
      } else {
        orderBy = {
          [filter.sortBy]: direction,
        };
      }
    } else {
      // Default sorting
      orderBy = { createdAt: 'desc' };
    }

    // Calculate pagination
    const page = filter.page || 0;
    const pageSize = filter.pageSize || 10;
    const skip = page * pageSize;

    // Get total count for pagination
    const total = await this.prisma.user.count({ where });

    // Execute the query
    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        tenant: true,
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    // Return the paginated response
    return {
      users,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        tenant: true,
      },
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        role: true,
        tenant: true,
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await this.passwordService.hash(
        updateUserDto.password,
      );
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: true,
        tenant: true,
      },
    });
    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
