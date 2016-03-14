import {Rectangle} from 'pdfi/graphics/geometry';

export function px(length: number, fractionDigits = 3) {
  return length.toFixed(fractionDigits) + 'px';
}

export function makeBoundsStyle(rectangle: Rectangle): {[index: string]: string} {
  if (rectangle === undefined) return undefined;
  return {
    position: 'absolute',
    left: px(rectangle.minX, 3),
    top: px(rectangle.minY, 3),
    width: px(rectangle.maxX - rectangle.minX, 3),
    height: px(rectangle.maxY - rectangle.minY, 3),
  };
}

export function makeBoundsString(rectangle: Rectangle): string {
  if (rectangle === undefined) return undefined;
  const dX = rectangle.maxX - rectangle.minX;
  const dY = rectangle.maxY - rectangle.minY;
  return `(${rectangle.minX.toFixed(3)},${rectangle.minY.toFixed(3)}) (${dX.toFixed(3)}x${dY.toFixed(3)})`;
}
