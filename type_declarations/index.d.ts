/// <reference path="DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="DefinitelyTyped/angularjs/angular-resource.d.ts" />
/// <reference path="DefinitelyTyped/lodash/lodash.d.ts" />

interface VirtualNode {
  tagName: string;
  properties: any;
  children: any[];
  key?: string;
  namespace?: string;
  count: number;
  hasWidgets: boolean;
  hasThunks: boolean;
  hooks: any[];
  descendantHooks: any[];
}

declare module "virtual-dom/h" {
  function h(tagName: string, ...args: any[]): VirtualNode;
  export = h;
}
declare module "virtual-dom/create-element" {
  function create(vnode: VirtualNode, opts?: any): Element;
  export = create;
}
declare module "virtual-dom/diff" {
  function diff(a: any, b: any): any[];
  export = diff;
}
declare module "virtual-dom/patch" {
  /**
  patch() usually just returns rootNode after doing stuff to it, so we want
  to preserve that type (though it will usually be just Element).
  */
  function patch<T extends Element>(rootNode: T, patches: any[], opts?: any): T;
  export = patch;
}
// var VNode = require('virtual-dom/vnode/vnode');
// var VText = require('virtual-dom/vnode/vtext');
