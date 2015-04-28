/// <reference path="type_declarations/index.d.ts" />
import * as _ from 'lodash';
import {Request} from './request';

let server = localStorage['server'] || '';

export class File {
  constructor(public name: string) { }

  static upload(dom_file, callback: (error: Error, file?: File) => void) {
    var file = new File(dom_file.name);
    var form = new FormData();
    form.append('file', dom_file, dom_file.name);
    new Request('POST', '/files').sendData(form, (error, data) => {
      _.extend(file, data);
      callback(error, file);
    });
  }

  static query(callback: (error: Error, files?: File[]) => void) {
    new Request('GET', `${server}/files`).send(callback);
  }

  getDocument(callback: (error: Error, document?: any) => void) {
    new Request('GET', `${server}/files/${this.name}/document`).send(callback);
  }
  getObject(objectNumber: number, callback) {
    new Request('GET', `${server}/files/${this.name}/objects/${objectNumber}`).send(callback);
  }
  getObjectExtra(objectNumber: number, callback: (error: Error, object?: any) => void) {
    new Request('GET', `${server}/files/${this.name}/objects/${objectNumber}/extra`).send(callback);
  }
  getPages(callback: (error: Error, pages?: any[]) => void) {
    new Request('GET', `${server}/files/${this.name}/pages`).send(callback);
  }
  getPage(page_number: number, callback: (error: Error, page?: any) => void) {
    new Request('GET', `${server}/files/${this.name}/pages/${page_number}`).send(callback);
  }
  getPageContents(page_number, callback) {
    new Request('GET', `${server}/files/${this.name}/pages/${page_number}/contents`).send(callback);
  }
}
