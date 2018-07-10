import {Source} from 'lexing'
import {Action} from 'redux'
import {DispatchProp} from 'react-redux'

import {PDF, readSourceSync} from 'pdfi'
import {Page} from 'pdfi/models'

export interface ViewConfig {
  scale: number
  outlines: boolean
  labels: boolean
}

export enum LogLevel {
  debug = 10,
  info = 20,
  warning = 30,
  error = 40,
  critical = 50,
}

export interface LogEntry {
  message: string
  level: LogLevel
  created: Date
}

export interface ReduxState {
  log: LogEntry[]
  pdf: PDF
  page: Page
  viewConfig: ViewConfig
}

export type LogAction = Action<'LOG'> & ({ message: string, level?: LogLevel } | { error: Error })
export type SetPDFAction = Action<'SET_PDF'> & { pdf: PDF }
export type SetPageAction = Action<'SET_PAGE'> & { page: Page }
export type UpdateViewConfigAction = Action<'UPDATE_VIEW_CONFIG'> & { key: string, value: number | boolean }

export type ActionUnion = LogAction  |
                          SetPDFAction |
                          SetPageAction |
                          UpdateViewConfigAction

// the wildcard Action allows connected-react-router actions
export type ConnectProps = DispatchProp<ActionUnion | Action>

/**
From lexing/browser.ts
*/
class ArrayBufferSource implements Source {
  constructor(private arrayBuffer: ArrayBuffer) { }

  get size(): number {
    return this.arrayBuffer.byteLength
  }

  read(buffer: Buffer, offset: number, length: number, position: number): number {
    // if position is negative set it to 0
    const actual_position = Math.max(0, position)
    if (length === 0) {
      return 0
    }
    // ensure that the requested length does not extend past the end of the underlying ArrayBuffer
    const maximum_length = this.size - actual_position
    const actual_length = Math.min(length, maximum_length)
    // console.log(`ArrayBufferSource#read new Uint8Array(ArrayBuffer with size=${this.size}, ${actual_position}, ${length})`)
    const byteArray = new Uint8Array(this.arrayBuffer, actual_position, actual_length)
    // copy the bytes over one by one
    for (let i = 0; i < actual_length; i++) {
      buffer[offset + i] = byteArray[i]
    }
    return actual_length
  }

  /**
  Same as FileSystemSource#readBuffer
  */
  readBuffer(length: number, position: number): Buffer {
    // console.log(`ArrayBufferSource#readBuffer length=${length} position=${position}`)
    let buffer = Buffer.alloc(length)
    const bytesRead = this.read(buffer, 0, length, position)
    if (bytesRead < length) {
      buffer = buffer.slice(0, bytesRead)
    }
    return buffer
  }
}

export function readArrayBufferSync(arrayBuffer: ArrayBuffer,
                                    options = {type: 'string'}): any {
  const source: Source = new ArrayBufferSource(arrayBuffer)
  return readSourceSync(source, options)
}
