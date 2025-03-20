import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeclarationType, DeclarationMonth } from '@prisma/client';

interface DeclarationTypeWithCounts extends DeclarationType {
  _count: {
    declarations: number;
    declarationMonths?: number;
  };
  declarationMonths?: DeclarationMonth[];
}

interface CreateDeclarationTypeDto {
  name: string;
  description?: string;
  articles?: string;
}

interface UpdateDeclarationTypeDto {
  name?: string;
  description?: string;
  articles?: string;
}

@Injectable()
export class DeclarationTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<DeclarationTypeWithCounts[]> {
    return this.prisma.declarationType.findMany({
      include: {
        _count: {
          select: {
            declarations: true,
            declarationMonths: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<DeclarationTypeWithCounts> {
    const declarationType = await this.prisma.declarationType.findUnique({
      where: { id },
      include: {
        declarationMonths: true,
        _count: {
          select: {
            declarations: true,
          },
        },
      },
    });

    if (!declarationType) {
      throw new NotFoundException(`Declaration type with ID ${id} not found`);
    }

    return declarationType;
  }

  async create(data: CreateDeclarationTypeDto): Promise<DeclarationType> {
    // Check if declaration type with the same name already exists
    const existingDeclarationType = await this.prisma.declarationType.findFirst(
      {
        where: { name: data.name },
      },
    );

    if (existingDeclarationType) {
      throw new ConflictException(
        `Declaration type with name '${data.name}' already exists`,
      );
    }

    return this.prisma.declarationType.create({
      data,
    });
  }

  async update(
    id: string,
    data: UpdateDeclarationTypeDto,
  ): Promise<DeclarationType> {
    // Check if declaration type exists
    await this.findOne(id);

    // If name is being updated, check for conflicts
    if (data.name) {
      const existingDeclarationType =
        await this.prisma.declarationType.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

      if (existingDeclarationType) {
        throw new ConflictException(
          `Declaration type with name '${data.name}' already exists`,
        );
      }
    }

    return this.prisma.declarationType.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<DeclarationType> {
    // Check if declaration type exists
    const declarationType = await this.findOne(id);

    // Check if declaration type has any declarations
    if (declarationType._count.declarations > 0) {
      throw new ConflictException(
        'Cannot delete declaration type that has declarations',
      );
    }

    // Delete declaration months
    await this.prisma.declarationMonth.deleteMany({
      where: { declarationTypeId: id },
    });

    // Delete declaration type
    return this.prisma.declarationType.delete({
      where: { id },
    });
  }

  async addDeclarationMonth(
    declarationTypeId: string,
    month: number,
  ): Promise<DeclarationMonth> {
    // Check if declaration type exists
    await this.findOne(declarationTypeId);

    // Check if month is valid (1-12)
    if (month < 1 || month > 12) {
      throw new ConflictException('Month must be between 1 and 12');
    }

    // Check if month already exists for this declaration type
    const existingMonth = await this.prisma.declarationMonth.findUnique({
      where: {
        month_declarationTypeId: {
          month,
          declarationTypeId,
        },
      },
    });

    if (existingMonth) {
      throw new ConflictException(
        `Month ${month} is already added to this declaration type`,
      );
    }

    return this.prisma.declarationMonth.create({
      data: {
        month,
        declarationTypeId,
      },
    });
  }

  async removeDeclarationMonth(
    declarationTypeId: string,
    month: number,
  ): Promise<DeclarationMonth> {
    // Check if declaration type exists
    await this.findOne(declarationTypeId);

    // Check if month exists for this declaration type
    const existingMonth = await this.prisma.declarationMonth.findUnique({
      where: {
        month_declarationTypeId: {
          month,
          declarationTypeId,
        },
      },
    });

    if (!existingMonth) {
      throw new NotFoundException(
        `Month ${month} is not added to this declaration type`,
      );
    }

    return this.prisma.declarationMonth.delete({
      where: {
        month_declarationTypeId: {
          month,
          declarationTypeId,
        },
      },
    });
  }
}
