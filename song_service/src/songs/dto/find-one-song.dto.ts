import { IsUUID } from 'class-validator';

export class FindOneSongDto {
  @IsUUID()
  id: string;
}
