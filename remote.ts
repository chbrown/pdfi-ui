import {FileReference} from './models'

/**
We can't write the .body property of a Response because it's a read-only getter,
so we use .content instead.
*/
async function parseContent<R extends Response>(response: R): Promise<R & {content: any}> {
  const contentType = response.headers.get('content-type')
  const contentPromise = (contentType == 'application/json') ? response.json() : response.text()
  return contentPromise.then(content => Object.assign(response, {content}))
}

/**
Check that a fetch() Response has a successful status code and turn it into a
rejected Promise if not.
*/
async function assertSuccess<R extends Response>(response: R): Promise<R> {
  if (response.status < 200 || response.status > 299) {
    // let error = new Error(`HTTP ${response.status}`)
    // error['response'] = response
    return Promise.reject<R>(response)
  }
  return Promise.resolve(response)
}

/**
Upload a FileList to a remote store.
*/
export async function uploadFiles(files: ArrayLike<File>,
                                  url = '/upload'): Promise<FileReference[]> {
  const body = new FormData()
  Array.from(files).forEach(file => {
    body.append('file', file)
  })
  // send to /upload endpoint
  return fetch(url, {method: 'PUT', body})
  .then(parseContent)
  .then(assertSuccess)
  .then(response => {
    return response.content.files as FileReference[]
  })
}

export async function listFiles(url = '/files'): Promise<FileReference[]> {
  return fetch(url)
  .then(async response => response.json())
}

export async function readFile(name: string,
                               url = '/files'): Promise<ArrayBuffer> {
  return fetch(`${url}/${name}`)
  .then(async response => response.arrayBuffer())
}
