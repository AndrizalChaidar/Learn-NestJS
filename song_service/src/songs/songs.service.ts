import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Repository } from 'typeorm';
import Song from 'src/entities/songs.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song) private songRepository: Repository<Song>,
  ) {}
  create(createSongDto: CreateSongDto) {
    const newSong = this.songRepository.create(createSongDto);
    return this.songRepository.save(newSong);
  }

  findAll() {
    return this.songRepository.find();
  }

  findOne(id: string) {
    return this.songRepository.findOne({ where: { id } });
  }

  update(id: string, updateSongDto: UpdateSongDto) {
    return this.songRepository.update(id, updateSongDto);
  }

  delete(id: string) {
    return this.songRepository.delete(id);
  }
}
