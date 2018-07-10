interface RemoteShared {
  name: string
  mtime: string
}
export interface RemoteFile extends RemoteShared {
  type: 'file'
  size: number
}
export interface RemoteDirectory extends RemoteShared {
  type: 'directory'
}

/**
The nginx settings,
  autoindex on
  autoindex_format json
returns JSON objects like this.
*/
export type IndexEntry = RemoteFile | RemoteDirectory
function isRemoteFile(entry: IndexEntry): entry is RemoteFile {
  return entry.type == 'file'
}

async function readResponse(response: Response): Promise<any> {
  switch (response.headers.get('content-type')) {
  case 'application/json':
    return response.json()
  case 'application/pdf':
    return response.arrayBuffer()
  case 'text/html':
    return response.text().then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const body = doc.querySelector('body')
      return body.textContent.trim()
    })
  default:
    return response.text()
  }
}

/**
We can't write the .body property of a Response because it's a read-only getter,
so we use .content instead.
*/
async function parseContent<R extends Response>(response: R): Promise<R & {content: any}> {
  return readResponse(response).then(content => Object.assign(response, {content}))
}

/**
Check that a fetch() Response has a successful status code and turn it into a
rejected Promise if not.
*/
async function assertSuccess<R extends Response>(response: R): Promise<R> {
  if (response.status < 200 || response.status > 299) {
    // let error = new Error()
    // error['response'] = response
    return Promise.reject<R>(response)
  }
  return Promise.resolve(response)
}

export class ResponseError extends Error {
  constructor(public response: Response & {content: any}) {
    super(`HTTP ${response.status}: ${response.content}`)
  }
}

/**
Upload a FileList to a remote store.
*/
export async function uploadFiles(files: ArrayLike<File>,
                                  url = '/upload'): Promise<RemoteFile[]> {
  const body = new FormData()
  Array.from(files).forEach(file => {
    body.append('file', file)
  })
  // send to /upload endpoint
  return fetch(url, {method: 'PUT', body})
  .then(parseContent)
  .then(assertSuccess)
  .then(response => {
    return response.content.files as RemoteFile[]
  }, response => {
    throw new ResponseError(response)
  })
}

export async function listFiles(url = '/files'): Promise<RemoteFile[]> {
  return fetch(url)
  .then(parseContent)
  .then(assertSuccess)
  .then(({content}) => {
    const entries = content as IndexEntry[]
    return entries.filter(isRemoteFile)
  }, response => {
    throw new ResponseError(response)
  })
}

export async function readFile(name: string,
                               url = '/files'): Promise<ArrayBuffer> {
  return fetch(`${url}/${name}`)
  .then(parseContent)
  .then(assertSuccess)
  .then(({content}) => {
    return content as ArrayBuffer
  }, response => {
    throw new ResponseError(response)
  })
}
