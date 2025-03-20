import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateClientDto, UpdateClientDto } from './dto';
import { Client } from './entities';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({
    status: 200,
    description: 'Return all clients',
    type: [Client],
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filter clients by tenant ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query('tenantId') tenantId?: string): Promise<Client[]> {
    return this.clientsService.findAll(tenantId);
  }

  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return client by ID',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new client' })
  @ApiResponse({
    status: 201,
    description: 'Client successfully created',
    type: Client,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({
    status: 200,
    description: 'Client successfully updated',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({
    status: 200,
    description: 'Client successfully deleted',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Client> {
    return this.clientsService.remove(id);
  }

  @ApiOperation({ summary: 'Assign client to user' })
  @ApiResponse({
    status: 200,
    description: 'Client successfully assigned to user',
  })
  @ApiResponse({ status: 404, description: 'Client or user not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/assign/:userId')
  async assignToUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.clientsService.assignToUser(id, userId);
  }

  @ApiOperation({ summary: 'Remove client from user' })
  @ApiResponse({
    status: 200,
    description: 'Client successfully removed from user',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id/assign/:userId')
  async removeFromUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.clientsService.removeFromUser(id, userId);
  }

  @ApiOperation({ summary: 'Get users assigned to client' })
  @ApiResponse({
    status: 200,
    description: 'Return users assigned to client',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id/users')
  async getAssignedUsers(@Param('id') id: string): Promise<any[]> {
    return this.clientsService.getAssignedUsers(id);
  }
}
