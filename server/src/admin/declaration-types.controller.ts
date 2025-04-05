/* eslint-disable */
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
import { DeclarationType, DeclarationMonth } from '@prisma/client';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { DeclarationTypesService } from './declaration-types.service';
import {
  CreateDeclarationTypeDto,
  UpdateDeclarationTypeDto,
  AddMonthsDto,
} from './dto';

// Define interfaces for API
interface DeclarationTypeWithCounts extends DeclarationType {
  _count?: {
    declarations: number;
    declarationMonths?: number;
  };
  declarationMonths?: DeclarationMonth[];
}

@ApiTags('admin/declaration-types')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/declaration-types')
export class DeclarationTypesController {
  constructor(
    private readonly declarationTypesService: DeclarationTypesService,
  ) {}

  @ApiOperation({ summary: 'Get all declaration types' })
  @ApiResponse({
    status: 200,
    description: 'Return all declaration types',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<DeclarationTypeWithCounts[]> {
    // Get all types with their declaration months included
    return this.declarationTypesService.findAll();
  }

  @ApiOperation({ summary: 'Get declaration type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return declaration type by ID',
  })
  @ApiResponse({ status: 404, description: 'Declaration type not found' })
  @ApiParam({ name: 'id', description: 'Declaration Type ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DeclarationTypeWithCounts> {
    return this.declarationTypesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new declaration type' })
  @ApiResponse({
    status: 201,
    description: 'Declaration type successfully created',
  })
  @ApiBody({ type: CreateDeclarationTypeDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createDeclarationTypeDto: CreateDeclarationTypeDto,
  ): Promise<DeclarationTypeWithCounts | DeclarationType> {
    try {
      console.log('Received DTO:', createDeclarationTypeDto);

      // Extract months from the DTO
      const { months, ...declarationTypeData } = createDeclarationTypeDto;

      // Create the declaration type
      const declarationType =
        await this.declarationTypesService.create(declarationTypeData);

      console.log('Created declaration type:', declarationType);

      // Add months if provided
      if (months && months.length > 0) {
        console.log('Adding months:', months);

        for (const month of months) {
          try {
            await this.declarationTypesService.addDeclarationMonth(
              declarationType.id,
              month,
            );
          } catch (error) {
            console.error(`Error adding month ${month}:`, error);
            // Continue with other months even if one fails
          }
        }

        // Fetch the updated declaration type with months
        return this.declarationTypesService.findOne(declarationType.id);
      }

      return declarationType;
    } catch (error) {
      console.error('Error creating declaration type:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update declaration type' })
  @ApiResponse({
    status: 200,
    description: 'Declaration type successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Declaration type not found' })
  @ApiParam({ name: 'id', description: 'Declaration Type ID' })
  @ApiBody({ type: UpdateDeclarationTypeDto })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeclarationTypeDto: UpdateDeclarationTypeDto,
  ): Promise<DeclarationType> {
    return this.declarationTypesService.update(id, updateDeclarationTypeDto);
  }

  @ApiOperation({ summary: 'Delete declaration type' })
  @ApiResponse({
    status: 200,
    description: 'Declaration type successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Declaration type not found' })
  @ApiParam({ name: 'id', description: 'Declaration Type ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeclarationType> {
    return this.declarationTypesService.remove(id);
  }

  @ApiOperation({ summary: 'Add months to declaration type' })
  @ApiResponse({
    status: 200,
    description: 'Months successfully added to declaration type',
  })
  @ApiResponse({ status: 404, description: 'Declaration type not found' })
  @ApiParam({ name: 'id', description: 'Declaration Type ID' })
  @ApiBody({ type: AddMonthsDto })
  @HttpCode(HttpStatus.OK)
  @Post(':id/months')
  async addMonths(
    @Param('id') id: string,
    @Body() addMonthsDto: AddMonthsDto,
  ): Promise<DeclarationTypeWithCounts> {
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
        await this.declarationTypesService.addDeclarationMonth(id, month);
      } catch (error) {
        console.error(`Error adding month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Return the updated declaration type
    return this.declarationTypesService.findOne(id);
  }

  @ApiOperation({ summary: 'Remove months from declaration type' })
  @ApiResponse({
    status: 200,
    description: 'Months successfully removed from declaration type',
  })
  @ApiResponse({ status: 404, description: 'Declaration type not found' })
  @ApiParam({ name: 'id', description: 'Declaration Type ID' })
  @ApiBody({ type: AddMonthsDto })
  @HttpCode(HttpStatus.OK)
  @Delete(':id/months')
  async removeMonths(
    @Param('id') id: string,
    @Body() removeMonthsDto: AddMonthsDto,
  ): Promise<DeclarationTypeWithCounts> {
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
        await this.declarationTypesService.removeDeclarationMonth(id, month);
      } catch (error) {
        console.error(`Error removing month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Return the updated declaration type
    return this.declarationTypesService.findOne(id);
  }
}
