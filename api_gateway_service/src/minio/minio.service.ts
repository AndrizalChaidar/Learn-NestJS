import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as busboyFn from 'busboy';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioMusicService {
  private bucketName: string = 'music-app';
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly minioService: MinioService,
  ) {}

  async upload() {
    const busboy = busboyFn({
      headers: this.request.headers,
      limits: { files: 1 },
    });
    this.request.pipe(busboy);
    const result = await new Promise<{
      etag: string;
      versionId: string;
      info: busboyFn.FileInfo;
    }>((resolve, reject) => {
      busboy.on('file', (_, stream, info) => {
        this.minioService.client.putObject(
          this.bucketName,
          info.filename,
          stream,
          undefined,
          { 'Content-Type': info.mimeType },
          (e, result) => {
            if (e) {
              return reject(e);
            }
            resolve({ ...result, info });
          },
        );
      });
    });

    return result;
  }

  async play(objectName: string) {
    let headers: Record<string, any> = {};
    const range = this.request.headers.range;
    let start = 0;
    const fileStat = await this.minioService.client.statObject(
      this.bucketName,
      objectName,
    );
    const fileSize = fileStat.size;
    headers['Content-Range'] = `bytes 0-${fileSize - 1}/${fileSize}`;
    let status = 200;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);

      headers = {
        'Content-Range': `bytes ${start}-${fileSize - 1}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize,
        'Content-Type': String(fileStat.metaData['content-type']),
      };
      status = 206;
    }

    const fileStream = await this.minioService.client.getPartialObject(
      this.bucketName,
      objectName,
      start,
    );
    return { fileStream, headers, status };
  }

  async delete(objectName: string) {
    await this.minioService.client.removeObject(this.bucketName, objectName);
  }
}
