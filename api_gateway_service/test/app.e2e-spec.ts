import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { createReadStream, readFileSync } from 'fs';
import { SongsService } from 'src/songs/songs.service';
import { MinioMusicService } from 'src/minio/minio.service';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let songService: SongsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
    app.useGlobalPipes(new ValidationPipe());
    configService = app.get(ConfigService);
    songService = app.get(SongsService);
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('ConvigService', () => {
    it('should return correct env value', () => {
      const envString = readFileSync(process.cwd() + '/.env').toString();
      const configServiceEnv: Record<string, string> = {};
      const expectedEnv = Object.fromEntries(
        envString.split('\n').map((keyValue) => {
          const [key, value] = keyValue.split('=');
          configServiceEnv[key] = configService.get(key);
          return [key, value];
        }),
      );
      expect(configServiceEnv).toEqual(expectedEnv);
    });
  });

  describe('Songs Route', () => {
    it('/upload (POST)', async () => {
      jest.spyOn(songService, 'create').mockReturnValue(of(['Hello']));
      const mockMinioMusicServiceUploadReturn = {
        info: { filename: 'jest-e2e.json', mimeType: 'json', encoding: 'utf8' },
        etag: '1',
        versionId: undefined,
      };
      const mockMinioMusicServiceUpload = jest
        .spyOn(MinioMusicService.prototype, 'upload')
        .mockResolvedValueOnce(mockMinioMusicServiceUploadReturn);

      const mockFile = createReadStream(
        process.cwd() +
          `/test/${mockMinioMusicServiceUploadReturn.info.filename}`,
      );

      await request(app.getHttpServer())
        .post('/songs/uploads')
        .field('file', mockFile)
        .expect(201)
        .expect(['Hello']);
      const instanceRequest = mockMinioMusicServiceUpload.mock.instances[0][
        'request'
      ] as IncomingMessage;
      expect(instanceRequest.headers['content-type'].split(';')[0]).toEqual(
        'multipart/form-data',
      );
    });
    it('/ (GET)', async () => {
      const spied = jest.spyOn(songService, 'findAll');
      spied.mockReturnValue(of(['Hello']));
      await request(app.getHttpServer())
        .get('/songs')
        .expect(200)
        .expect(['Hello']);
      const instance = spied.mock.instances[0] as unknown as SongsService;
      expect(instance['songClient']).toBeInstanceOf(ClientProxy);
      expect(songService.findAll).toHaveBeenCalledTimes(1);
      expect(songService.findAll).toHaveBeenCalledWith();
    });
    describe('/:id (GET)', () => {
      it('should success with expected result', async () => {
        jest.spyOn(songService, 'findOne').mockResolvedValue(['Hello']);
        const mockId = randomUUID();
        await request(app.getHttpServer())
          .get(`/songs/${mockId}`)
          .expect(200)
          .expect(['Hello']);
        expect(songService.findOne).toHaveBeenCalledTimes(1);
        expect(songService.findOne).toHaveBeenCalledWith(mockId);
      });
      it('should failed with status 400', async () => {
        jest.spyOn(songService, 'findOne');
        await request(app.getHttpServer()).get('/songs/1').expect(400);
        expect(songService.findOne).not.toHaveBeenCalled();
      });
    });
    describe('/:id (PATCH)', () => {
      it('should success with expected result', async () => {
        jest.spyOn(songService, 'update').mockResolvedValueOnce(['Hello']);
        const mockId = randomUUID();
        const mockRequestBody = { songName: 'Hello' };
        await request(app.getHttpServer())
          .patch(`/songs/${mockId}`)
          .send(mockRequestBody)
          .expect(200)
          .expect(['Hello']);
        expect(songService.update).toHaveBeenCalledTimes(1);
        expect(songService.update).toHaveBeenCalledWith(
          mockId,
          mockRequestBody,
        );
      });
      it('should failed with status 400', async () => {
        jest.spyOn(songService, 'update');
        const mockId = randomUUID();
        await request(app.getHttpServer())
          .patch(`/songs/${mockId}`)
          .send({})
          .expect(400);
        expect(songService.update).not.toHaveBeenCalled();
      });
      it('should failed with status 400', async () => {
        jest.spyOn(songService, 'update');
        await request(app.getHttpServer()).patch('/songs/1').expect(400);
        expect(songService.update).not.toHaveBeenCalled();
      });
    });
    describe('/:id (DELETE)', () => {
      it('should success with expected result', async () => {
        const mockSongName = 'Hello';
        const mockMinioMusicServiceDelete = jest
          .spyOn(MinioMusicService.prototype, 'delete')
          .mockResolvedValueOnce();
        jest
          .spyOn(songService, 'delete')
          .mockReturnValue(of({ songName: mockSongName }));

        const mockId = randomUUID();
        await request(app.getHttpServer())
          .delete(`/songs/${mockId}`)
          .expect(200)
          .expect({ songName: mockSongName });
        expect(mockMinioMusicServiceDelete).toHaveBeenCalledTimes(1);
        expect(mockMinioMusicServiceDelete).toHaveBeenCalledWith(mockSongName);
        expect(songService.delete).toHaveBeenCalledTimes(1);
        expect(songService.delete).toHaveBeenCalledWith(mockId);
      });
      it('should failed with status 400', async () => {
        jest.spyOn(songService, 'delete');
        await request(app.getHttpServer()).delete('/songs/1').expect(400);
        expect(songService.delete).not.toHaveBeenCalled();
      });
    });
    describe('/play/:id (GET)', () => {
      it('should success with expected result', async () => {
        const mockSongName = 'Hello';
        const mockFileStream = Readable.from(['Hello']);
        const mockHeader = {
          'content-range': 'bytes 0-2/3',
        };
        const mockMinioMusicServicePlay = jest
          .spyOn(MinioMusicService.prototype, 'play')
          .mockResolvedValueOnce({
            fileStream: mockFileStream,
            headers: mockHeader,
            status: 200,
          });
        jest
          .spyOn(songService, 'findOne')
          .mockResolvedValueOnce({ songName: mockSongName });

        const mockId = randomUUID();
        const res = await request(app.getHttpServer())
          .get(`/songs/play/${mockId}`)
          .expect(200)
          .expect('Hello');

        expect(mockMinioMusicServicePlay).toHaveBeenCalledTimes(1);
        expect(mockMinioMusicServicePlay).toHaveBeenCalledWith(mockSongName);
        expect(songService.findOne).toHaveBeenCalledTimes(1);
        expect(songService.findOne).toHaveBeenCalledWith(mockId);
        expect(res.headers).toMatchObject(mockHeader);
      });
      it('should failed with status 400', async () => {
        jest.spyOn(songService, 'findOne');
        await request(app.getHttpServer()).delete('/songs/1').expect(400);
        expect(songService.findOne).not.toHaveBeenCalled();
      });
    });
  });
});
