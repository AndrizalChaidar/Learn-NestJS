import { IsString } from 'class-validator';

export class CreateSongDto {
  @IsString()
  songName: string;
}
