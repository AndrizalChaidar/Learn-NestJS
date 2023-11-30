import { MinioMusicService } from 'src/minio/minio.service';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { TestBed } from '@automock/jest';
import { lastValueFrom } from 'rxjs';

describe('SongsController', () => {
  let controller: SongsController;
  let songsService: jest.Mocked<SongsService>;
  let minioService: jest.Mocked<MinioMusicService>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(SongsController).compile();
    controller = unit;
    songsService = unitRef.get(SongsService);
    minioService = unitRef.get(MinioMusicService);
  });

  describe('findOne', () => {
    it(`should should return "hello"`, async () => {
      const result = await controller.findOne({ id: 'hello' });
      console.log(result);
    });
  });
  describe('findAll', () => {
    it(`should should return "hello"`, async () => {
      songsService.findAll.mockResolvedValueOnce('hello' as never);
      const result = await controller.findAll();
      console.log(result);
      expect(result).toEqual('hello');
    });
  });
});
