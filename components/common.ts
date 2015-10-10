// interfaces

export interface Rectangle {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Container<T> extends Rectangle {
  elements: T[];
}

/** this matches the properties in shapes.TextSpan (and thus, its JSON representation) */
export interface TextSpan extends Rectangle {
  string: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  details?: any;
}

export interface Layout {
  outerBounds: Rectangle;
  textSpans: TextSpan[];
  containers: Container<TextSpan>[]
}

// util / helpers

export function px(length: number, fractionDigits = 3) {
  return length.toFixed(fractionDigits) + 'px';
}

export function makeBoundsStyle(rectangle: Rectangle): {[index: string]: string} {
  if (rectangle === undefined) return undefined;
  return {
    left: px(rectangle.minX, 3),
    top: px(rectangle.minY, 3),
    width: px(rectangle.maxX - rectangle.minX, 3),
    height: px(rectangle.maxY - rectangle.minY, 3),
  };
}

export function makeBoundsString(rectangle: Rectangle): string {
  if (rectangle === undefined) return undefined;
  var dX = rectangle.maxX - rectangle.minX;
  var dY = rectangle.maxY - rectangle.minY;
  return `(${rectangle.minX.toFixed(3)},${rectangle.minY.toFixed(3)}) (${dX.toFixed(3)}x${dY.toFixed(3)})`;
}
