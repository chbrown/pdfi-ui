/// <reference path="type_declarations/index.d.ts" />
import h = require('virtual-dom/h');
import create = require('virtual-dom/create-element');
import diff = require('virtual-dom/diff');
import patch = require('virtual-dom/patch');

import {Request} from './request';

export class ViewManager<T> {
  // DOM and virtual-dom state
  private _element: Element;
  private _vtree: VirtualNode;
  // redraw state
  private _redrawInProgress = false;
  private _redrawPending = false;
  // redraw value
  private _value: T = null;
  constructor(private parentElement: Element,
              private renderFunc: (value: T) => VirtualNode) { }

  update(value: T) {
    if (this._redrawInProgress) {
      throw new Error('Update attempted while redrawing')
    }

    console.log('ViewManager#update(%o) (_redrawPending=%s)', value, this._redrawPending)

    this._value = value;

    // we can call multiple updates, which will all set the current value, but
    // only the first one will trigger a redraw
    if (this._redrawPending === false) {
      this._redrawPending = true
      // time is a DOMHighResTimeStamp, i.e., a number (but we don't need it)
      requestAnimationFrame(time => this._redraw());
    }
  }
  private _redraw() {
    console.log('ViewManager#_redraw(%o)', this._value)

    this._redrawInProgress = true;
    this._redrawPending = false;

    if (this._vtree === undefined) {
      this._vtree = this.renderFunc(this._value);
      this._element = create(this._vtree)
      // attach to the dom on the first draw
      this.parentElement.appendChild(this._element);
    }
    else {
      var new_vtree = this.renderFunc(this._value);
      var patches = diff(this._vtree, new_vtree)
      this._element = patch(this._element, patches)
      this._vtree = new_vtree;
    }

    this._redrawInProgress = false;
  }
}

export class ViewController<T> {
  constructor(public model: T) { }
  render(): VirtualNode {
    return null;
  }
}

interface PDFFile {
  name: string;
}

interface PDFObjectReference {
  file: PDFFile;
  objectNumber: number;
  generationNumber: number;
  object?: any;
}

export class PDFObjectReferenceCtrl extends ViewController<PDFObjectReference> {
  render() {
    let model = this.model;
    if (model.object) {
      // if the object has been resolved, render that
      return new PDFObjectCtrl({file: model.file, object: model.object}).render();
    }
    var href = `pdfs/${model.file.name}/objects/${model.objectNumber}`;
    var text = `${model.objectNumber}:${model.generationNumber}`;
    return h('a.reference', {
      href: href,
      onclick: function(ev) {
        // command+alt-click to load the object in-place
        if (ev.metaKey && ev.altKey) {
          console.log('PDFObjectReferenceCtrl onclick', ev);
          ev.preventDefault();
          // this.load();
        }
      },
    }, text);
  }

  // load() {
  //   var url = `files/${model.file.name}/objects/${model.objectNumber}`;
  //   new Request('GET', url).send((error, object) => {
  //     if (error) return console.error('Error getting %s: %o', url, error);
  //     this.setState({object: object});
  //   });
  // }
}

interface PDFObject {
  file: PDFFile;
  object: any;
}

export class PDFObjectCtrl extends ViewController<PDFObject> {
  render() {
    var object = this.model.object;
    var file = this.model.file;

    if (object === undefined) {
      return h('i.undefined', 'undefined');
    }
    else if (object === null) {
      return h('b.null', 'null');
    }
    else if (object['object_number'] !== undefined && object['generation_number'] !== undefined) {
      var model = {
        file: file,
        objectNumber: object['object_number'],
        generationNumber: object['generation_number'],
      };
      return new PDFObjectReferenceCtrl(model).render();
    }
    else if (Array.isArray(object)) {
      var array_children = object.map(child => new PDFObjectCtrl({file: file, object: child}).render());
      return h('span.array', ['[', array_children, ']']);
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(key => {
        var child = object[key];
        return h('div', [
          h('span.name', [key, ':']),
          new PDFObjectCtrl({file: file, object: child}).render()
        ]);
      });
      return h('div.object', object_children);
    }
    else if (typeof object === 'number') {
      return h('span.number', object.toString());
    }
    else if (typeof object === 'boolean') {
      return h('span.boolean', object.toString());
    }
    // catch-all
    return h('span.string', object.toString());
  }
}

// this matches the properties in shapes.TextSpan (and thus, its JSON representation)
interface TextSpan {
  string: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  fontSize: number;
  details?: any;
}

export class TextSpanCtrl extends ViewController<TextSpan> {
  render() {
    var style = {
      left: this.model.minX.toFixed(3) + 'px',
      top: this.model.minY.toFixed(3) + 'px',
      width: (this.model.maxX - this.model.minX).toFixed(3) + 'px',
      height: (this.model.maxY - this.model.minY).toFixed(3) + 'px',
      fontSize: this.model.fontSize.toFixed(3) + 'px',
    };
    var title = JSON.stringify(this.model.details);
    return h('div.text', {style: style, title: title}, this.model.string);
  }
}

export class PDFCanvasCtrl extends ViewController<TextSpan[]> {
  render() {
    var children = this.model.map(span => new TextSpanCtrl(span).render());
    return h('section', children);
  }
}

interface PDFPage {
  spans: TextSpan[];
}
export class PDFPageCtrl extends ViewController<PDFPage> {
  render() {
    return new PDFCanvasCtrl(this.model.spans).render();
  }
}
