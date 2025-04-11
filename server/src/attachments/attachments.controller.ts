/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @ApiOperation({ summary: 'Upload file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: {
          type: 'string',
        },
        declarationId: {
          type: 'string',
        },
        livreId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() createAttachmentDto: CreateAttachmentDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Ensure at least one of declarationId or livreId is provided
    if (!createAttachmentDto.declarationId && !createAttachmentDto.livreId) {
      throw new BadRequestException(
        'Either declarationId or livreId must be provided',
      );
    }

    // Create directory if it doesn't exist
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get user ID from JWT token
    const userId = req.user.id;

    return this.attachmentsService.createAttachment(
      file,
      userId,
      createAttachmentDto.description,
      createAttachmentDto.declarationId,
      createAttachmentDto.livreId,
    );
  }

  @ApiOperation({ summary: 'Get attachment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return attachment by ID',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @Get(':id')
  async getAttachment(@Param('id') id: string) {
    return this.attachmentsService.getAttachment(id);
  }

  @ApiOperation({ summary: 'Download attachment file' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentsService.getAttachment(id);
    
    const filePath = this.attachmentsService.getFilePath(attachment.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }
    
    // Set appropriate content type
    res.setHeader('Content-Type', (attachment as any).mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${attachment.fileName}"`,
    );
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @ApiOperation({ summary: 'Get all attachments for a declaration' })
  @ApiResponse({
    status: 200,
    description: 'Return all attachments for a declaration',
  })
  @Get('declaration/:declarationId')
  async getDeclarationAttachments(@Param('declarationId') declarationId: string) {
    return this.attachmentsService.getDeclarationAttachments(declarationId);
  }

  @ApiOperation({ summary: 'Get all attachments for a livre' })
  @ApiResponse({
    status: 200,
    description: 'Return all attachments for a livre',
  })
  @Get('livre/:livreId')
  async getLivreAttachments(@Param('livreId') livreId: string) {
    return this.attachmentsService.getLivreAttachments(livreId);
  }

  @ApiOperation({ summary: 'Delete attachment' })
  @ApiResponse({
    status: 200,
    description: 'Attachment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    return this.attachmentsService.deleteAttachment(id);
  }
}
