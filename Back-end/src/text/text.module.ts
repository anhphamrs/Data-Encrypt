import { Module } from '@nestjs/common';
import { TextService } from './text.service';

@Module({
  providers: [TextService]
})
export class TextModule {}
