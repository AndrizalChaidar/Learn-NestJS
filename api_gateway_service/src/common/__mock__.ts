import { Request } from 'express';
import { Readable, Writable } from 'stream';

export class MockResponse extends Writable {
  writeHead: (status: number, headers: any) => void;
  constructor(params: any) {
    super();
    this.writeHead = params.writeHead;
    this.write = params.write;
  }
}

export class MockRequest extends Readable {
  headers: Request['headers'] = { range: null };

  constructor() {
    super();
  }
  static from(...args: Parameters<(typeof Readable)['from']>) {
    const internal = super.from(...args);
    internal['headers'] = { range: null };
    return internal;
  }
}
