interface RequestCallback {
  (error: Error, response?: any): void;
}

export class NetworkError implements Error {
  name = 'NetworkError';
  public message: string;
  constructor(method: string, url: string) {
    this.message = `${this.name} with request: ${method} ${url}`;
  }
}

/**
Use like:

new Request('POST', '/api/reservations').sendData({venue_id: 100}, (err, response) => {
  if (err) throw err;
  console.log('got response', res);
});
*/
export class Request {
  xhr: XMLHttpRequest;
  private callback: RequestCallback;
  /**
  XMLHttpRequest doesn't expose method and url after setting them, so we need
  to keep track of them in the Request instance for error reporting purposes.
  */
  constructor(private method: string, private url: string, responseType = '') {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method, url);
    this.xhr.responseType = responseType;
    this.xhr.onreadystatechange = (event: Event) => {
      var readyState = this.xhr.readyState;
      if (readyState == 2) { // HEADERS_RECEIVED
        var content_type = this.xhr.getResponseHeader('content-type');
        if (content_type == 'application/json') {
          this.xhr.responseType = 'json';
        }
      }
    };
    this.xhr.onerror = (event: Event) => {
      this.callback(new NetworkError(this.method, this.url));
    };
    // onload is better than onreadystatechange() { if (readyState == 4) ... }
    //   since onload will not be called if there is an error.
    this.xhr.onload = (event: Event) => {
      if (this.xhr.status >= 400) {
        var error = new Error(this.xhr.response);
        return this.callback(error);
      }
      this.callback(null, this.xhr.response);
    };
  }
  send(callback: RequestCallback): void {
    this.callback = callback;
    try {
      // this might raise an error without even trying the server if we break
      // some kind of cross-origin request rule.
      this.xhr.send();
    }
    catch (exc) {
      callback(exc);
    }
  }
  sendData(data: any, callback: RequestCallback): void {
    this.callback = callback;
    try {
      this.xhr.send(data);
    }
    catch (exc) {
      callback(exc);
    }
  }
}
