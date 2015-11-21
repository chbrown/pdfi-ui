import {Buffer as LexingBuffer, Source} from 'lexing';
const pdfi = require('pdfi');

// declare var Buffer: {
//   new (size: number): LexingBuffer;
// };

export interface RemoteFile {
  name: string;
}

/**
From lexing/browser.ts
*/
class ArrayBufferSource implements Source {
  constructor(private arrayBuffer: ArrayBuffer) { }

  get size(): number {
    return this.arrayBuffer.byteLength;
  }

  read(buffer: LexingBuffer, offset: number, length: number, position: number): number {
    if (length === 0) {
      return 0;
    }
    // ensure that the requested length does not extend past the end of the underlying ArrayBuffer
    var maximum_length = this.size - position;
    length = Math.min(length, maximum_length);
    // console.log(`ArrayBufferSource#read new Uint8Array(ArrayBuffer with size=${this.size}, ${position}, ${length})`);
    var byteArray = new Uint8Array(this.arrayBuffer, position, length);
    // copy the bytes over one by one
    for (var i = 0; i < length; i++) {
      buffer[offset + i] = byteArray[i];
    }
    return length;
  }

  /**
  Same as FileSystemSource#readBuffer
  */
  readBuffer(length: number, position: number): LexingBuffer {
    // console.log(`ArrayBufferSource#readBuffer length=${length} position=${position}`);
    var buffer = new Buffer(length);
    var bytesRead = this.read(buffer, 0, length, position);
    if (bytesRead < length) {
      buffer = buffer.slice(0, bytesRead);
    }
    return buffer;
  }
}

export function readArrayBufferSync(arrayBuffer: ArrayBuffer,
                                    options = {type: 'string'}): any {
  var source: Source = new ArrayBufferSource(arrayBuffer);
  return pdfi.readSourceSync(source, options);
}

// export function uploadFile(dom_file, callback: (error: Error, file?: File) => void) {
//   var file = new File(dom_file.name);
//   var form = new FormData();
//   form.append('file', dom_file, dom_file.name);
//   new Request('POST', `${server}/files`).sendData(form, (error, data) => {
//     assign(file, data);
//     callback(error, file);
//   });
// }
