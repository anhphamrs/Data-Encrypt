import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class File {
  @Prop({ unique: [true, 'Duplicate userid entered'] })
  fileUserId: string;

  @Prop()
  fileInfor: string;

  @Prop()
  fileBuffer: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
