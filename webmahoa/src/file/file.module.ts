import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileSchema } from './schemas/file.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'File', schema: FileSchema }])], // Thêm DatabaseModule vào imports
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
