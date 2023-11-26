import { Inject, Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SongsService {
  constructor(@Inject('SONG_SERVICE') private songClient: ClientProxy) {}
  create(createSongDto: CreateSongDto) {
    return 'This action adds a new song';
  }

  findAll() {
    return this.songClient.send('findAll', {});
  }

  findOne(id: number) {
    return this.songClient.send('findOne', { id });
  }

  update(id: number, updateSongDto: UpdateSongDto) {
    return this.songClient.send('update', { id, updateSongDto });
  }

  delete(id: number) {
    return this.songClient.send('delete', { id });
  }
}
