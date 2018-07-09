export function bind<T extends Function>(target: Object,
                                         propertyKey: string | symbol,
                                         descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
  return {
    configurable: true,
    get(this: T): T {
      const value = descriptor.value.bind(this)
      Object.defineProperty(this, propertyKey, {
        value,
        configurable: true,
        writable: true,
      })
      return value
    },
  }
}

/**
Check that a fetch() Response has a successful status code and turn it into a
rejected Promise if not.
*/
export function assertSuccess<R extends Response>(response: R): Promise<R> {
  if (response.status < 200 || response.status > 299) {
    // let error = new Error(`HTTP ${response.status}`)
    // error['response'] = response
    return Promise.reject<R>(response)
  }
  return Promise.resolve(response)
}

/**
We can't write the .body property of a Response because it's a read-only getter,
so we use .content instead.
*/
export function parseContent<R extends Response>(response: R): Promise<R & {content: any}> {
  const contentType = response.headers.get('content-type')
  const contentPromise = (contentType == 'application/json') ? response.json() : response.text()
  return contentPromise.then(content => Object.assign(response, {content}))
}
