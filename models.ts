import {Source} from 'lexing';
import {readSourceSync} from 'pdfi';
import {DispatchProp} from 'react-redux';

export interface ViewConfig {
  scale: number;
  outlines: boolean;
  labels: boolean;
}

export interface ReduxState {
  files: {name: string}[];
  filename: string;
  pdf: any;
  object: any;
  page: any;
  viewConfig: ViewConfig;
}

export interface Action extends Partial<ReduxState> {
  type: string;
  // viewConfig is not replaced wholesale
  key?: string;
  value?: any;
}

export type ConnectProps = DispatchProp<Action>;

/**
From lexing/browser.ts
*/
class ArrayBufferSource implements Source {
  constructor(private arrayBuffer: ArrayBuffer) { }

  get size(): number {
    return this.arrayBuffer.byteLength;
  }

  read(buffer: Buffer, offset: number, length: number, position: number): number {
    // if position is negative set it to 0
    position = Math.max(0, position);
    if (length === 0) {
      return 0;
    }
    // ensure that the requested length does not extend past the end of the underlying ArrayBuffer
    const maximum_length = this.size - position;
    length = Math.min(length, maximum_length);
    // console.log(`ArrayBufferSource#read new Uint8Array(ArrayBuffer with size=${this.size}, ${position}, ${length})`);
    const byteArray = new Uint8Array(this.arrayBuffer, position, length);
    // copy the bytes over one by one
    for (let i = 0; i < length; i++) {
      buffer[offset + i] = byteArray[i];
    }
    return length;
  }

  /**
  Same as FileSystemSource#readBuffer
  */
  readBuffer(length: number, position: number): Buffer {
    // console.log(`ArrayBufferSource#readBuffer length=${length} position=${position}`);
    let buffer = new Buffer(length);
    const bytesRead = this.read(buffer, 0, length, position);
    if (bytesRead < length) {
      buffer = buffer.slice(0, bytesRead);
    }
    return buffer;
  }
}

export function readArrayBufferSync(arrayBuffer: ArrayBuffer,
                                    options = {type: 'string'}): any {
  const source: Source = new ArrayBufferSource(arrayBuffer);
  return readSourceSync(source, options);
}

// export function uploadFile(dom_file, callback: (error: Error, file?: File) => void) {
//   const file = new File(dom_file.name);
//   const form = new FormData();
//   form.append('file', dom_file, dom_file.name);
//   new Request('POST', `${server}/files`).sendData(form, (error, data) => {
//     assign(file, data);
//     callback(error, file);
//   });
// }
