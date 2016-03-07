import React from 'react';
import {TextSpanPropTypes} from '../propTypes';
import {makeBoundsStyle} from '../graphics';

const TextSpan = ({minX, minY, maxX, maxY, string, fontSize, fontBold, fontItalic, details}) => {
  // if fontSize is less than 6, set it to 6 (kind of a hack)
  var normalized_fontSize = Math.max(fontSize, 6);
  var style = makeBoundsStyle({minX, minY, maxX, maxY});
  style.fontSize = normalized_fontSize.toFixed(3) + 'px';
  style.fontWeight = fontBold ? 'bold' : 'normal';
  style.fontStyle = fontItalic ? 'italic' : 'normal';
  var title = `${details} fontSize=${fontSize.toFixed(3)}`;
  return <div className="textSpan" style={style} title={title}>{string}</div>;
};
TextSpan.propTypes = TextSpanPropTypes;

export default TextSpan;
