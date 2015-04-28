// type RequestCallback = (error: Error, response?: any) => void;
interface RequestCallback {
  (error: Error, response?: any): void;
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
  constructor(method: string, url: string, responseType = '') {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method, url);
    this.xhr.responseType = responseType;
    this.xhr.onerror = (event: ErrorEvent) => {
      this.callback(new Error(`XHR ErrorEvent: ${event.message}`));
    };
    this.xhr.onreadystatechange = (event: Event) => {
      var readyState = this.xhr.readyState;
      if (readyState == 2) { // HEADERS_RECEIVED
        var content_type = this.xhr.getResponseHeader('content-type');
        if (content_type == 'application/json') {
          this.xhr.responseType = 'json';
        }
      }
      else if (readyState == 4) { // DONE (same as xhr.onload)
        if (this.xhr.status >= 400) {
          var error = new Error(this.xhr.response);
          return this.callback(error);
        }
        this.callback(null, this.xhr.response);
      }
    };
  }
  send(callback: RequestCallback): void {
    this.callback = callback;
    this.xhr.send();
  }
  sendData(data: any, callback: RequestCallback): void {
    this.callback = callback;
    this.xhr.send(data);
  }
}
