import { IsString } from 'class-validator';

export class TextDto {
  @IsString()
  readonly Text: string;
}
