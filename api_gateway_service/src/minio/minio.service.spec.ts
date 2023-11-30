import { Test, TestingModule } from '@nestjs/testing';
import { MinioMusicService } from './minio.service';

describe('UploadsService', () => {
  let service: MinioMusicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinioMusicService],
    }).compile();

    service = module.get<MinioMusicService>(MinioMusicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
