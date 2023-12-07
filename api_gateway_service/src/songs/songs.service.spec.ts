import { lastValueFrom, of } from 'rxjs';
import { SongsService } from './songs.service';
import { TestBed } from '@automock/jest';
import { NotFoundException } from '@nestjs/common';

describe('SongsService', () => {
  let service: SongsService;
  const client = {
    send: jest.fn(),
  };
  const expectedResponse = 'Hello';

  beforeAll(() => {
    const { unit } = TestBed.create(SongsService)
      .mock('SONG_SERVICE')
      .using(client)
      .compile();
    service = unit;
    client.send.mockReturnValue(of(expectedResponse));
  });

  afterEach(() => {
    client.send.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(client).toBeDefined();
  });

  describe('create', () => {
    it('should return expected value', async () => {
      const mockDto = { songName: 'hello' };
      const result = await lastValueFrom(service.create(mockDto));
      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('create', mockDto);
      expect(result).toEqual(expectedResponse);
    });
  });
  describe('findAll', () => {
    it('should return expected value', async () => {
      const result = await lastValueFrom(service.findAll());
      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('findAll', {});
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('should return expected value', async () => {
      const id = '1';
      const result = await service.findOne(id);
      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('findOne', { id });
      expect(result).toEqual(expectedResponse);
    });
    it('should throw not found error', async () => {
      client.send.mockReturnValueOnce(of(undefined));
      const id = '1';
      let result: unknown;
      try {
        result = await service.findOne(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('findOne', { id });
      expect(result).toBe(undefined);
    });
  });

  describe('update', () => {
    it('should return expected value', async () => {
      const mockDto = { songName: 'hello' };
      const id = '1';
      const result = await service.update(id, mockDto);
      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('update', {
        id,
        payload: mockDto,
      });
      expect(result).toEqual(expectedResponse);
    });
  });
  describe('delete', () => {
    it('should return expected value', async () => {
      const id = '1';
      const result = await lastValueFrom(service.delete(id));
      expect(client.send).toHaveBeenCalledTimes(1);
      expect(client.send).toHaveBeenCalledWith('delete', {
        id,
      });
      expect(result).toEqual(expectedResponse);
    });
  });
});
