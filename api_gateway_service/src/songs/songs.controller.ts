import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { MinioMusicService } from 'src/minio/minio.service';
import { FindOneSongDto } from './dto/find-one-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly minioMusicService: MinioMusicService,
  ) {}

  @Post('uploads')
  async create() {
    const uploadResult = await this.minioMusicService.upload();

    const result = await lastValueFrom(
      this.songsService.create({ songName: uploadResult.info.filename }),
    );
    return result;
  }

  @Get()
  findAll() {
    return this.songsService.findAll();
  }

  @Get(':id')
  findOne(@Param() { id }: FindOneSongDto) {
    return this.songsService.findOne(id);
  }

  @Patch(':id')
  update(@Param() { id }: FindOneSongDto, @Body() payload: UpdateSongDto) {
    return this.songsService.update(id, payload);
  }

  @Delete(':id')
  async delete(@Param() { id }: FindOneSongDto) {
    const result = await lastValueFrom(this.songsService.delete(id));
    await this.minioMusicService.delete(result.songName);
    return result;
  }

  @Get('play/:id')
  async play(@Param() { id }: FindOneSongDto, @Res() response: Response) {
    const song = await this.songsService.findOne(id);
    const { fileStream, headers, status } = await this.minioMusicService.play(
      song.songName,
    );
    response.writeHead(status, headers);
    fileStream.pipe(response);
  }
}
