import * as React from 'react';
import {TextSpan} from 'pdfi/graphics';

const BufferView = ({buffer, base}) => {
  const bytes = [];
  for (let i = 0, l = buffer.length; i < l; i++) {
    bytes.push(buffer[i]);
  }
  return (
    <div className="buffer">
      {bytes.map((byte, i) =>
        <span key={i}>{byte.toString(base)}</span>
      )}
    </div>
  );
};

export const TextSpanTable = ({textSpans}: {textSpans: TextSpan[]}) => (
  <table className="fill padded striped lined">
    <thead>
      <tr>
        <th>x</th>
        <th>y</th>
        <th>width</th>
        <th>height</th>
        <th>font</th>
        <th>size</th>
        <th>bold</th>
        <th>italic</th>
        <th>buffer</th>
        <th>text</th>
      </tr>
    </thead>
    <tbody>
      {textSpans.map((span, i) =>
        <tr key={i}>
          <td>{span.minX.toFixed(2)}</td>
          <td>{span.minY.toFixed(2)}</td>
          <td>{(span.maxX - span.minX).toFixed(2)}</td>
          <td>{(span.maxY - span.minY).toFixed(2)}</td>
          <td>{span.fontName}</td>
          <td>{span.fontSize.toFixed(2)}</td>
          <td>{span.fontBold}</td>
          <td>{span.fontItalic}</td>
          <td><BufferView buffer={span.buffer} base={16} /></td>
          <td>{span.text}</td>
        </tr>
      )}
    </tbody>
  </table>
);
