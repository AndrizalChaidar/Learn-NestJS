import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSongDto } from './dto/create-song.dto';
import { FindOneSongDto } from './dto/find-one-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongsService } from './songs.service';

@Controller()
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @MessagePattern('create')
  create(@Payload() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }
  @MessagePattern('findAll')
  findAll() {
    return this.songsService.findAll();
  }
  @MessagePattern('findOne')
  findOne(@Payload() { id }: FindOneSongDto) {
    return this.songsService.findOne(id);
  }
  @MessagePattern('update')
  update(
    @Payload()
    payload: UpdateSongDto,
  ) {
    return this.songsService.update(payload);
  }
  @MessagePattern('delete')
  delete(@Payload() { id }: FindOneSongDto) {
    return this.songsService.delete(id);
  }
}
