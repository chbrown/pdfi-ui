export function bind<T extends Function>(_target: object,
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

export async function readArrayBuffer<T extends Blob>(blob: T): Promise<T & {arrayBuffer: ArrayBuffer}> {
  const fileReader = new FileReader()
  return new Promise<T & {arrayBuffer: ArrayBuffer}>((resolve, reject) => {
    fileReader.onerror = reject
    fileReader.onload = () => {
      resolve(Object.assign(blob, {arrayBuffer: fileReader.result}))
    }
    fileReader.readAsArrayBuffer(blob)
  })
}
