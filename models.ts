/// <reference path="type_declarations/index.d.ts" />
import * as _ from 'lodash';
import {Request} from './request';

import academia = require('academia');

let server = localStorage['server'] || '';

export class File {
  constructor(public name: string) { }

  static upload(dom_file, callback: (error: Error, file?: File) => void) {
    var file = new File(dom_file.name);
    var form = new FormData();
    form.append('file', dom_file, dom_file.name);
    new Request('POST', `${server}/files`).sendData(form, (error, data) => {
      _.extend(file, data);
      callback(error, file);
    });
  }

  static query(callback: (error: Error, files?: File[]) => void) {
    new Request('GET', `${server}/files`).send(callback);
  }

  get url() {
    return `${server}/files/${this.name}`;
  }

  get(callback: (error: Error, file?: any) => void) {
    new Request('GET', this.url).send(callback);
  }
  getDocument(callback: (error: Error, result?: {paper: academia.types.Paper /* among others */}) => void) {
    new Request('GET', this.url + `/document`).send(callback);
  }
  getObject(objectNumber: number, callback: (error: Error, object?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}`).send(callback);
  }
  getObjectExtra(objectNumber: number, callback: (error: Error, object?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}/extra`).send(callback);
  }
  getContentStream(objectNumber: number, callback: (error: Error, result?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}/content-stream`).send(callback);
  }
  getTextCanvas(objectNumber: number, callback: (error: Error, result?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}/text-canvas`).send(callback);
  }
  getFont(objectNumber: number, callback: (error: Error, result?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}/font`).send(callback);
  }
  getGraphics(objectNumber: number, callback: (error: Error, result?: any) => void) {
    new Request('GET', this.url + `/objects/${objectNumber}/graphics`).send(callback);
  }
  getPages(callback: (error: Error, pages?: any[]) => void) {
    new Request('GET', this.url + `/pages`).send(callback);
  }
  getPage(pageNumber: number, callback: (error: Error, page?: any) => void) {
    new Request('GET', this.url + `/pages/${pageNumber}`).send(callback);
  }
  getPageContents(pageNumber: number, callback: (error: Error, contents?: any) => void) {
    new Request('GET', this.url + `/pages/${pageNumber}/contents`).send(callback);
  }

  open(callback: (error: Error, result?: any) => void) {
    new Request('POST', this.url + `/open`).send(callback);
  }
}
