import {CSSProperties} from 'react';
import {Rectangle} from 'pdfi/graphics/geometry';

export function px(length: number, fractionDigits = 3) {
  return length.toFixed(fractionDigits) + 'px';
}

export function makeBoundsStyle({minX, minY, maxX, maxY}: Rectangle): CSSProperties {
  return {
    position: 'absolute',
    left: px(minX, 3),
    top: px(minY, 3),
    width: px(maxX - minX, 3),
    height: px(maxY - minY, 3),
  };
}
