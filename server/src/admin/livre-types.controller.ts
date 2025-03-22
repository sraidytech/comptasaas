import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { LivreType, LivreMonth } from '@prisma/client';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { LivreTypesService } from './livre-types.service';

// Define interfaces for API
interface LivreTypeWithCounts extends LivreType {
  _count?: {
    livres: number;
    livreMonths?: number;
  };
  livreMonths?: LivreMonth[];
}

// Define DTOs for API documentation
class CreateLivreTypeDto {
  name: string;
  description?: string;
  articles?: string;
  months?: number[];
}

class UpdateLivreTypeDto {
  name?: string;
  description?: string;
  articles?: string;
}

class AddMonthsDto {
  months: number[];
}

@ApiTags('admin/livre-types')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/livre-types')
export class LivreTypesController {
  constructor(private readonly livreTypesService: LivreTypesService) {}

  @ApiOperation({ summary: 'Get all livre types' })
  @ApiResponse({
    status: 200,
    description: 'Return all livre types',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<LivreTypeWithCounts[]> {
    return this.livreTypesService.findAll();
  }

  @ApiOperation({ summary: 'Get livre type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return livre type by ID',
  })
  @ApiResponse({ status: 404, description: 'Livre type not found' })
  @ApiParam({ name: 'id', description: 'Livre Type ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LivreTypeWithCounts> {
    return this.livreTypesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new livre type' })
  @ApiResponse({
    status: 201,
    description: 'Livre type successfully created',
  })
  @ApiBody({ type: CreateLivreTypeDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createLivreTypeDto: CreateLivreTypeDto,
  ): Promise<LivreTypeWithCounts | LivreType> {
    // Extract months from the DTO
    const { months, ...livreTypeData } = createLivreTypeDto;

    // Create the livre type
    const livreType = await this.livreTypesService.create(livreTypeData);

    // Add months if provided
    if (months && months.length > 0) {
      for (const month of months) {
        try {
          await this.livreTypesService.addLivreMonth(livreType.id, month);
        } catch (error) {
          console.error(`Error adding month ${month}:`, error);
          // Continue with other months even if one fails
        }
      }

      // Fetch the updated livre type with months
      return this.livreTypesService.findOne(livreType.id);
    }

    return livreType;
  }

  @ApiOperation({ summary: 'Update livre type' })
  @ApiResponse({
    status: 200,
    description: 'Livre type successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Livre type not found' })
  @ApiParam({ name: 'id', description: 'Livre Type ID' })
  @ApiBody({ type: UpdateLivreTypeDto })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLivreTypeDto: UpdateLivreTypeDto,
  ): Promise<LivreType> {
    return this.livreTypesService.update(id, updateLivreTypeDto);
  }

  @ApiOperation({ summary: 'Delete livre type' })
  @ApiResponse({
    status: 200,
    description: 'Livre type successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Livre type not found' })
  @ApiParam({ name: 'id', description: 'Livre Type ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<LivreType> {
    return this.livreTypesService.remove(id);
  }

  @ApiOperation({ summary: 'Add months to livre type' })
  @ApiResponse({
    status: 200,
    description: 'Months successfully added to livre type',
  })
  @ApiResponse({ status: 404, description: 'Livre type not found' })
  @ApiParam({ name: 'id', description: 'Livre Type ID' })
  @ApiBody({ type: AddMonthsDto })
  @HttpCode(HttpStatus.OK)
  @Post(':id/months')
  async addMonths(
    @Param('id') id: string,
    @Body() addMonthsDto: AddMonthsDto,
  ): Promise<LivreTypeWithCounts> {
    if (
      !addMonthsDto.months ||
      !Array.isArray(addMonthsDto.months) ||
      addMonthsDto.months.length === 0
    ) {
      throw new BadRequestException(
        'Months array is required and must not be empty',
      );
    }

    // Add each month
    for (const month of addMonthsDto.months) {
      try {
        await this.livreTypesService.addLivreMonth(id, month);
      } catch (error) {
        console.error(`Error adding month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Return the updated livre type
    return this.livreTypesService.findOne(id);
  }

  @ApiOperation({ summary: 'Remove months from livre type' })
  @ApiResponse({
    status: 200,
    description: 'Months successfully removed from livre type',
  })
  @ApiResponse({ status: 404, description: 'Livre type not found' })
  @ApiParam({ name: 'id', description: 'Livre Type ID' })
  @ApiBody({ type: AddMonthsDto })
  @HttpCode(HttpStatus.OK)
  @Delete(':id/months')
  async removeMonths(
    @Param('id') id: string,
    @Body() removeMonthsDto: AddMonthsDto,
  ): Promise<LivreTypeWithCounts> {
    if (
      !removeMonthsDto.months ||
      !Array.isArray(removeMonthsDto.months) ||
      removeMonthsDto.months.length === 0
    ) {
      throw new BadRequestException(
        'Months array is required and must not be empty',
      );
    }

    // Remove each month
    for (const month of removeMonthsDto.months) {
      try {
        await this.livreTypesService.removeLivreMonth(id, month);
      } catch (error) {
        console.error(`Error removing month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Return the updated livre type
    return this.livreTypesService.findOne(id);
  }
}
