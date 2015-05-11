/// <reference path="type_declarations/index.d.ts" />
import {EventEmitter} from 'events';

// can't import non-modules with `import * as xyz from './xyz'` syntax
import {VNode} from 'virtual-dom';
import h = require('virtual-dom/h');
import create = require('virtual-dom/create-element');
import diff = require('virtual-dom/diff');
import patch = require('virtual-dom/patch');

import {Request} from './request';

export interface EventChannel {
  (eventType: string, ...eventArguments: any[]): void;
}

export class Root<T> extends EventEmitter {
  // DOM and virtual-dom state
  private element: Element;
  private vtree: VNode;
  // redraw state
  private _redrawInProgress = false;
  private _redrawPending = false;
  // redraw value
  private value: T = null;
  constructor(private parentElement: Element,
              private renderFunction: (model: T, channel: EventChannel) => VNode) { super() }

  update(value: T) {
    if (this._redrawInProgress) {
      throw new Error('Update attempted while redrawing')
    }
    this.value = value;

    // we can call multiple updates, which will all set the current value, but
    // only the first one will trigger a redraw
    if (this._redrawPending === false) {
      this._redrawPending = true
      // time is a DOMHighResTimeStamp, i.e., a number (but we don't need it)
      requestAnimationFrame(time => this.redraw());
    }
  }
  private redraw() {
    this._redrawInProgress = true;
    this._redrawPending = false;

    if (this.vtree === undefined) {
      this.vtree = this.renderFunction(this.value, this.emit.bind(this));
      this.element = create(this.vtree)
      // attach to the dom on the first draw
      this.parentElement.appendChild(this.element);
    }
    else {
      var new_vtree = this.renderFunction(this.value, this.emit.bind(this));
      var patches = diff(this.vtree, new_vtree)
      this.element = patch(this.element, patches)
      this.vtree = new_vtree;
    }

    this._redrawInProgress = false;
  }
}

interface PDFObjectReference {
  objectNumber: number;
  generationNumber: number;
}

// this matches the properties in shapes.TextSpan (and thus, its JSON representation)
interface TextSpan {
  string: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  details?: any;
}

interface PDFPage {
  spans: TextSpan[];
}

// render functions

export function renderPDFObjectReference(model: PDFObjectReference, channel: EventChannel): VNode {
  return h('a.reference', {
    // href: `#objects/${model.objectNumber}`, // pdfs/${model.file.name}/
    onclick: function(ev) {
      ev.preventDefault();
      channel('objectReferenceClick', event, model.objectNumber);
    },
  }, `${model.objectNumber}:${model.generationNumber}`);
}

export function renderPDFObject(object: any, channel: EventChannel): VNode {
  if (object === undefined) {
    return h('i.undefined', 'undefined');
  }
  else if (object === null) {
    return h('b.null', 'null');
  }
  else if (object['object_number'] !== undefined && object['generation_number'] !== undefined) {
    return renderPDFObjectReference({
      objectNumber: object['object_number'],
      generationNumber: object['generation_number'],
    }, channel);
  }
  else if (Array.isArray(object)) {
    var array_children = object.map(child => renderPDFObject(child, channel));
    return h('span.array', ['[', array_children, ']']);
  }
  else if (typeof object === 'object') {
    var object_children = Object.keys(object).map(key => {
      var child = object[key];
      return h('div', [
        h('span.name', [key, ':']),
        renderPDFObject(child, channel)
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

export function renderTextSpan(model: TextSpan, channel: EventChannel): VNode {
  // if fontSize is less than 6, set it to 6
  var normalized_fontSize = Math.max(model.fontSize, 6);
  var style: {[index: string]: string} = {
    left: model.minX.toFixed(3) + 'px',
    top: model.minY.toFixed(3) + 'px',
    width: (model.maxX - model.minX).toFixed(3) + 'px',
    height: (model.maxY - model.minY).toFixed(3) + 'px',
    fontSize: normalized_fontSize.toFixed(3) + 'px',
    fontWeight: model.fontBold ? 'bold' : 'normal',
    fontStyle: model.fontItalic ? 'italic' : 'normal',
  };
  // JSON.stringify(model.details)
  var title = `${model.details} fontSize=${model.fontSize.toFixed(3)}`;
  return h('div.text', {style: style, title: title}, model.string);
}

export function renderPDFCanvas(model: TextSpan[], channel: EventChannel): VNode {
  var children = model.map(span => renderTextSpan(span, channel));
  return h('section', children);
}

export function renderPDFPage(model: PDFPage, channel: EventChannel): VNode {
  return renderPDFCanvas(model.spans, channel);
}
