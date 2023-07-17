import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FileService {
  constructor(@InjectModel('File') private fileModel: Model<File>) {}

  async uploadFile(
    file: Express.Multer.File,
    fileUserId: string,
  ): Promise<{ fileUserId: string; fileInfor: string; fileBuffer: string }> {
    const fileInfor = `${file.fieldname},${file.originalname},${file.encoding},${file.mimetype},${file.size}`;
    const fileBuffer = file.buffer.toString();
    await this.fileModel.create({
      fileUserId,
      fileInfor,
      fileBuffer,
    });
    return { fileUserId, fileInfor, fileBuffer };
  }
}
