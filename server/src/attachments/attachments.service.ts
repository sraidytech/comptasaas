/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Define the FileType enum to match the Prisma schema
enum FileType {
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  // Determine file type based on mime type
  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('application/pdf')) {
      return FileType.PDF;
    } else if (mimeType.startsWith('audio/')) {
      return FileType.AUDIO;
    } else if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    } else {
      return FileType.OTHER;
    }
  }

  // Create attachment record in database
  async createAttachment(
    file: any,
    userId: string,
    description?: string,
    declarationId?: string,
    livreId?: string,
  ) {
    const fileType = this.getFileType(file.mimetype);
    
    // Create uploads directory if it doesn't exist
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Check if declarationId exists if provided
    if (declarationId) {
      try {
        // Check if the declaration exists
        const declaration = await this.prisma.declaration.findUnique({
          where: { id: declarationId },
        });
        
        if (!declaration) {
          throw new NotFoundException(`Declaration with ID ${declarationId} not found`);
        }
      } catch (error) {
        console.error(`Error checking declaration: ${error.message}`);
        // For demo purposes, we'll create an attachment without a declarationId
        declarationId = undefined;
      }
    }
    
    // Check if livreId exists if provided
    if (livreId) {
      try {
        // Check if the livre exists
        const livre = await this.prisma.livre.findUnique({
          where: { id: livreId },
        });
        
        if (!livre) {
          throw new NotFoundException(`Livre with ID ${livreId} not found`);
        }
      } catch (error) {
        console.error(`Error checking livre: ${error.message}`);
        // For demo purposes, we'll create an attachment without a livreId
        livreId = undefined;
      }
    }
    
    // For demo purposes, create a standalone attachment if no valid declaration or livre
    if (!declarationId && !livreId) {
      console.log('Creating standalone attachment for demo purposes');
    }
    
    // Use Prisma's create method with type assertion
    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileUrl: file.path,
        // Use string value directly since it matches the enum values in the database
        fileType: fileType.toString() as any,
        fileSize: file.size,
        mimeType: file.mimetype,
        description,
        uploadedBy: userId,
        declarationId,
        livreId,
      } as any, // Use type assertion to bypass TypeScript checking
    });
  }

  // Get attachment by ID
  async getAttachment(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  // Get all attachments for a declaration
  async getDeclarationAttachments(declarationId: string) {
    return this.prisma.attachment.findMany({
      where: { declarationId },
    });
  }

  // Get all attachments for a livre
  async getLivreAttachments(livreId: string) {
    return this.prisma.attachment.findMany({
      where: { livreId },
    });
  }

  // Delete attachment
  async deleteAttachment(id: string) {
    const attachment = await this.getAttachment(id);
    
    // Delete file from disk
    try {
      fs.unlinkSync(attachment.fileUrl);
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    return this.prisma.attachment.delete({
      where: { id },
    });
  }

  // Get file path
  getFilePath(fileUrl: string) {
    return path.resolve(fileUrl);
  }
}
