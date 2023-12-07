const mockBusboy = jest.fn();

import { TestBed } from '@automock/jest';
import { Readable, Writable } from 'stream';
import { MinioMusicService } from './minio.service';
import { MinioService } from 'nestjs-minio-client';
import { MockRequest } from 'src/common/__mock__';
import { REQUEST } from '@nestjs/core';
jest.mock('busboy', () => {
  return mockBusboy;
});

describe('UploadsService', () => {
  let service: MinioMusicService;
  const expectedStream = 'Hello';
  const minioClientService = {
    client: {
      putObject: jest.fn(),
      removeObject: jest.fn(),
      statObject: jest.fn(),
      getPartialObject: jest.fn(),
    },
  };
  let request = new MockRequest();
  beforeEach(() => {
    const { unit } = TestBed.create(MinioMusicService)
      .mock(REQUEST)
      .using(request)
      .mock(MinioService)
      .using(minioClientService)
      .compile();
    service = unit;
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });
  describe('upload', () => {
    beforeAll(() => {
      request = MockRequest.from([expectedStream]) as MockRequest;
      request.on('readable', () => {
        while (request.read() !== null) {}
      });
    });
    afterEach(() => {
      request = MockRequest.from([expectedStream]) as MockRequest;
      request.on('readable', () => {
        while (request.read() !== null) {}
      });
    });
    it('should return expected value', async () => {
      const mockFileInfo = {
        filename: 'song',
        mimeType: 'mp3',
      };
      const mockPubObjectResult = { etag: '1', versionId: null };
      mockBusboy.mockReturnValueOnce(
        new Writable({
          write(chunk, _, callback) {
            this.emit('file', null, chunk, mockFileInfo);
            callback();
          },
        }),
      );
      minioClientService.client.putObject.mockImplementationOnce(
        (_, _1, _2, _3, _4, callback) => {
          callback(null, mockPubObjectResult);
        },
      );
      const result = await service.upload();
      expect(mockBusboy).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.putObject).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.putObject).toHaveBeenCalledWith(
        service['bucketName'],
        mockFileInfo.filename,
        Buffer.from(expectedStream),
        undefined,
        { 'Content-Type': mockFileInfo.mimeType },
        expect.any(Function),
      );
      expect(result).toEqual({ ...mockPubObjectResult, info: mockFileInfo });
    });
    it('should throw an Error when putObject', async () => {
      const mockFileInfo = {
        filename: 'song',
        mimeType: 'mp3',
      };
      mockBusboy.mockReturnValueOnce(
        new Writable({
          write(chunk, _, callback) {
            this.emit('file', null, chunk, mockFileInfo);
            callback();
          },
        }),
      );
      const error = new Error('error');
      minioClientService.client.putObject.mockImplementationOnce(
        (_, _1, _2, _3, _4, callback) => {
          callback(error);
        },
      );
      try {
        await service.upload();
      } catch (e) {
        expect(e).toEqual(error);
      }
      expect(mockBusboy).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.putObject).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.putObject).toHaveBeenCalledWith(
        service['bucketName'],
        mockFileInfo.filename,
        Buffer.from(expectedStream),
        undefined,
        { 'Content-Type': mockFileInfo.mimeType },
        expect.any(Function),
      );
    });
  });
  describe('play', () => {
    it('should return expected value with status 200', async () => {
      const start = 0;
      const mockFileStat = {
        size: 3,
        metaData: { 'content-type': 'audio/mp3' },
      };
      const expectedResult = {
        fileStream: Readable.from(['Hello']),
        headers: {
          'Content-Range': `bytes ${start}-${mockFileStat.size - 1}/${
            mockFileStat.size
          }`,
        },
        status: 200,
      };
      minioClientService.client.statObject.mockResolvedValue(mockFileStat);
      minioClientService.client.getPartialObject.mockResolvedValue(
        expectedResult.fileStream,
      );
      const objectName = 'hello';
      const result = await service.play(objectName);
      expect(minioClientService.client.statObject).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.statObject).toHaveBeenCalledWith(
        service['bucketName'],
        objectName,
      );
      expect(minioClientService.client.getPartialObject).toHaveBeenCalledTimes(
        1,
      );
      expect(minioClientService.client.getPartialObject).toHaveBeenCalledWith(
        service['bucketName'],
        objectName,
        start,
      );
      expect(result).toEqual(expectedResult);
    });
    it('should return expected value with status 206', async () => {
      const start = 1;
      jest.replaceProperty(request, 'headers', { range: `bytes=${start}-0` });
      const mockFileStat = {
        size: 3,
        metaData: { 'content-type': 'audio/mp3' },
      };
      const expectedResult = {
        fileStream: Readable.from(['Hello']),
        headers: {
          'Content-Range': `bytes ${start}-${mockFileStat.size - 1}/${
            mockFileStat.size
          }`,
          'Accept-Ranges': 'bytes',
          'Content-Length': mockFileStat.size,
          'Content-Type': String(mockFileStat.metaData['content-type']),
        },
        status: 206,
      };
      minioClientService.client.statObject.mockResolvedValue(mockFileStat);
      minioClientService.client.getPartialObject.mockResolvedValue(
        expectedResult.fileStream,
      );
      const objectName = 'hello';
      const result = await service.play(objectName);
      expect(minioClientService.client.statObject).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.statObject).toHaveBeenCalledWith(
        service['bucketName'],
        objectName,
      );
      expect(minioClientService.client.getPartialObject).toHaveBeenCalledTimes(
        1,
      );
      expect(minioClientService.client.getPartialObject).toHaveBeenCalledWith(
        service['bucketName'],
        objectName,
        start,
      );
      expect(result).toEqual(expectedResult);
    });
  });
  describe('delete', () => {
    it('should return expected value', async () => {
      const mockObjectName = 'Hello';
      minioClientService.client.removeObject.mockReturnValue(Promise.resolve());
      await service.delete(mockObjectName);
      expect(minioClientService.client.removeObject).toHaveBeenCalledTimes(1);
      expect(minioClientService.client.removeObject).toHaveBeenCalledWith(
        service['bucketName'],
        mockObjectName,
      );
    });
  });
});
