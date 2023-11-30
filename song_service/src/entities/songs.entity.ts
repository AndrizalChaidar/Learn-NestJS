import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'songs' })
export default class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'song_name' })
  songName: string;
}
