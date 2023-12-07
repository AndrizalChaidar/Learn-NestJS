import { MinioMusicService } from 'src/minio/minio.service';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { TestBed } from '@automock/jest';
import { lastValueFrom, of } from 'rxjs';
import { UpdateSongDto } from './dto/update-song.dto';
import { Readable } from 'stream';
import { Response } from 'express';
import { MockResponse } from 'src/common/__mock__';

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
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it(`should should return expected result`, async () => {
      const expectedResult = 'hello';
      const mockMinioUploadReturn: any = {
        info: { filename: 'song' },
      };
      songsService.create.mockReturnValueOnce(of(expectedResult));
      minioService.upload.mockResolvedValueOnce(mockMinioUploadReturn);
      const result = await controller.create();
      expect(minioService.upload).toHaveBeenCalledTimes(1);
      expect(minioService.upload).toHaveBeenCalledWith();
      expect(songsService.create).toHaveBeenCalledTimes(1);
      expect(songsService.create).toHaveBeenCalledWith({
        songName: mockMinioUploadReturn.info.filename,
      });
      expect(result).toEqual(expectedResult);
    });
  });
  describe('findOne', () => {
    it(`should should return expected result`, async () => {
      const expectedResult = 'hello';
      const id = '1';
      songsService.findOne.mockResolvedValueOnce(expectedResult);
      const result = await controller.findOne({ id });
      expect(songsService.findOne).toHaveBeenCalledTimes(1);
      expect(songsService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
  describe('findAll', () => {
    it(`should should return expected result`, async () => {
      const expectedResult = 'hello';
      songsService.findAll.mockReturnValue(of(expectedResult));
      const result = await lastValueFrom(controller.findAll());
      expect(songsService.findAll).toHaveBeenCalledTimes(1);
      expect(songsService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResult);
    });
  });
  describe('update', () => {
    it(`should should return expected result`, async () => {
      const expectedResult = 'hello';
      const id = '1';
      const mockPayload: UpdateSongDto = { songName: 'song' };
      songsService.update.mockResolvedValueOnce(expectedResult);
      const result = await controller.update({ id }, mockPayload);
      expect(songsService.update).toHaveBeenCalledTimes(1);
      expect(songsService.update).toHaveBeenCalledWith(id, mockPayload);
      expect(result).toEqual(expectedResult);
    });
  });
  describe('delete', () => {
    it(`should should return expected result`, async () => {
      const expectedResult = { songName: 'hello' };
      const id = '1';
      songsService.delete.mockReturnValue(of(expectedResult));
      const result = await controller.delete({ id });
      expect(songsService.delete).toHaveBeenCalledTimes(1);
      expect(songsService.delete).toHaveBeenCalledWith(id);
      expect(minioService.delete).toHaveBeenCalledTimes(1);
      expect(minioService.delete).toHaveBeenCalledWith(expectedResult.songName);
      expect(result).toEqual(expectedResult);
    });
  });
  describe('play', () => {
    it(`should should return expected result`, async () => {
      const id = '1';
      const mockSongName = 'hello';
      const mockWrite = jest.fn();
      const mockWriteHead = jest.fn();
      const mockResponse = new MockResponse({
        write: mockWrite,
        writeHead: mockWriteHead,
      });
      const mockMinioPlayReturn = {
        fileStream: Readable.from(['Hello', 'World']),
        headers: {},
        status: 200,
      };
      minioService.play.mockResolvedValueOnce(mockMinioPlayReturn);
      songsService.findOne.mockResolvedValue({ songName: mockSongName });

      await controller.play({ id }, mockResponse as Response);

      expect(songsService.findOne).toHaveBeenCalledTimes(1);
      expect(songsService.findOne).toHaveBeenCalledWith(id);
      expect(minioService.play).toHaveBeenCalledTimes(1);
      expect(minioService.play).toHaveBeenCalledWith(mockSongName);
      expect(mockWriteHead).toHaveBeenCalledTimes(1);
      expect(mockWriteHead).toHaveBeenCalledWith(
        mockMinioPlayReturn.status,
        mockMinioPlayReturn.headers,
      );
      await new Promise((resolve) => {
        mockResponse.on('finish', resolve);
      });
      expect(mockWrite).toHaveBeenCalledTimes(2);
      expect(mockWrite).toHaveBeenNthCalledWith(1, 'Hello');
      expect(mockWrite).toHaveBeenNthCalledWith(2, 'World');
    });
  });
});
