import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}
  @UseInterceptors(FileInterceptor('file'))
  @Post('/:id/upload')
  uploadFile(
    @Param('id') fileUserId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ fileUserId: string; fileInfor: string; fileBuffer: string }> {
    return this.fileService.uploadFile(file, fileUserId);
  }
}
