import { CreateSongDto } from './create-song.dto';
import { FindOneSongDto } from './find-one-song.dto';

export class UpdateSongDto extends FindOneSongDto {
  payload: CreateSongDto;
}
