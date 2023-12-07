import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { DeleteQueryBuilder, Repository, UpdateQueryBuilder } from 'typeorm';
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

  async findOne(id: string) {
    const result = await this.songRepository.findOne({ where: { id } });
    return result;
  }

  async update({ id, payload }: UpdateSongDto) {
    const queryBuilder = this.songRepository
      .createQueryBuilder()
      .update()
      .set(payload)
      .where('id = :id', { id });
    const { sql, parameters } = this.addReturningWithAlias(queryBuilder, [
      'id',
      `song_name AS "songName"`,
    ]);
    const result = await this.songRepository.query(sql, parameters);
    return result[0][0];
  }

  async delete(id: string) {
    const queryBuilder = this.songRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id });
    const { sql, parameters } = this.addReturningWithAlias(queryBuilder, [
      'id',
      `song_name AS "songName"`,
    ]);
    const result = await this.songRepository.query(sql, parameters);
    return result[0][0];
  }
  addReturningWithAlias(
    queryBuilder: UpdateQueryBuilder<Song> | DeleteQueryBuilder<Song>,
    columns?: string[],
  ) {
    let [sql, parameters] = queryBuilder.getQueryAndParameters();
    if (columns && columns.length > 0) {
      sql += `\nRETURNING ${columns.join(',')}`;
    } else {
      sql += `\nRETURNING *`;
    }
    return { sql, parameters };
  }
}
