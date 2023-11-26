import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }
  @MessagePattern('findAll')
  @Get()
  findAll() {
    return this.songsService.findAll();
  }
  @MessagePattern('findOne')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }
  @MessagePattern('update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }
  @MessagePattern('delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.songsService.delete(id);
  }
}
