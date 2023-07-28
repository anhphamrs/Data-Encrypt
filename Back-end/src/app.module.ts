import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { TextController } from './text/text.controller';
import { TextModule } from './text/text.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    FileModule,
    TextModule,
  ],
  controllers: [AppController, TextController],
  providers: [AppService],
})
export class AppModule {}
