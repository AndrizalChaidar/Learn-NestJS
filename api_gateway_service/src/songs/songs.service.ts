import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SongsService {
  constructor(@Inject('SONG_SERVICE') private songClient: ClientProxy) {}
  create(createSongDto: CreateSongDto) {
    return this.songClient.send('create', createSongDto);
  }

  findAll() {
    return this.songClient.send('findAll', {});
  }

  async findOne(id: string) {
    const song = await lastValueFrom(this.songClient.send('findOne', { id }));
    if (!song) {
      throw new NotFoundException(`File with id ${id} is not found`);
    }
    return song;
  }

  async update(id: string, payload: UpdateSongDto) {
    const result = await lastValueFrom(
      this.songClient.send('update', {
        id,
        payload,
      }),
    );
    return result;
  }

  delete(id: string) {
    return this.songClient.send('delete', { id });
  }
}
