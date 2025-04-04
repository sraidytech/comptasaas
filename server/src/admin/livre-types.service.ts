import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LivreType, LivreMonth } from '@prisma/client';

interface LivreTypeWithCounts extends LivreType {
  _count: {
    livres: number;
    livreMonths?: number;
  };
  livreMonths?: LivreMonth[];
}

interface CreateLivreTypeDto {
  name: string;
  description?: string;
  articles?: string;
  months?: number[];
}

interface UpdateLivreTypeDto {
  name?: string;
  description?: string;
  articles?: string;
}

@Injectable()
export class LivreTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<LivreTypeWithCounts[]> {
    return this.prisma.livreType.findMany({
      include: {
        _count: {
          select: {
            livres: true,
            livreMonths: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<LivreTypeWithCounts> {
    const livreType = await this.prisma.livreType.findUnique({
      where: { id },
      include: {
        livreMonths: true,
        _count: {
          select: {
            livres: true,
          },
        },
      },
    });

    if (!livreType) {
      throw new NotFoundException(`Livre type with ID ${id} not found`);
    }

    return livreType;
  }

  async create(data: CreateLivreTypeDto): Promise<LivreType> {
    // Check if livre type with the same name already exists
    const existingLivreType = await this.prisma.livreType.findFirst({
      where: { name: data.name },
    });

    if (existingLivreType) {
      throw new ConflictException(
        `Livre type with name '${data.name}' already exists`,
      );
    }

    return this.prisma.livreType.create({
      data,
    });
  }

  async update(id: string, data: UpdateLivreTypeDto): Promise<LivreType> {
    // Check if livre type exists
    await this.findOne(id);

    // If name is being updated, check for conflicts
    if (data.name) {
      const existingLivreType = await this.prisma.livreType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (existingLivreType) {
        throw new ConflictException(
          `Livre type with name '${data.name}' already exists`,
        );
      }
    }

    return this.prisma.livreType.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<LivreType> {
    // Check if livre type exists
    const livreType = await this.findOne(id);

    // Check if livre type has any livres
    if (livreType._count.livres > 0) {
      throw new ConflictException('Cannot delete livre type that has livres');
    }

    // Delete livre months
    await this.prisma.livreMonth.deleteMany({
      where: { livreTypeId: id },
    });

    // Delete livre type
    return this.prisma.livreType.delete({
      where: { id },
    });
  }

  async addLivreMonth(livreTypeId: string, month: number): Promise<LivreMonth> {
    // Check if livre type exists
    await this.findOne(livreTypeId);

    // Check if month is valid (1-12)
    if (month < 1 || month > 12) {
      throw new ConflictException('Month must be between 1 and 12');
    }

    // Check if month already exists for this livre type
    const existingMonth = await this.prisma.livreMonth.findUnique({
      where: {
        month_livreTypeId: {
          month,
          livreTypeId,
        },
      },
    });

    if (existingMonth) {
      throw new ConflictException(
        `Month ${month} is already added to this livre type`,
      );
    }

    return this.prisma.livreMonth.create({
      data: {
        month,
        livreTypeId,
      },
    });
  }

  async removeLivreMonth(
    livreTypeId: string,
    month: number,
  ): Promise<LivreMonth> {
    // Check if livre type exists
    await this.findOne(livreTypeId);

    // Check if month exists for this livre type
    const existingMonth = await this.prisma.livreMonth.findUnique({
      where: {
        month_livreTypeId: {
          month,
          livreTypeId,
        },
      },
    });

    if (!existingMonth) {
      throw new NotFoundException(
        `Month ${month} is not added to this livre type`,
      );
    }

    return this.prisma.livreMonth.delete({
      where: {
        month_livreTypeId: {
          month,
          livreTypeId,
        },
      },
    });
  }
}
