import React from 'react';
import {TextSpanPropTypes} from '../propTypes';
import {makeBoundsStyle} from '../graphics';

export default class TextSpan extends React.Component {
  render() {
    var textSpan = this.props;
    // if fontSize is less than 6, set it to 6 (kind of a hack)
    var normalized_fontSize = Math.max(textSpan.fontSize, 6);
    var style = makeBoundsStyle(textSpan);
    style.fontSize = normalized_fontSize.toFixed(3) + 'px';
    style.fontWeight = textSpan.fontBold ? 'bold' : 'normal';
    style.fontStyle = textSpan.fontItalic ? 'italic' : 'normal';
    var title = `${textSpan.details} fontSize=${textSpan.fontSize.toFixed(3)}`;
    return <div className="textSpan" style={style} title={title}>{textSpan.string}</div>;
  }
  static propTypes = TextSpanPropTypes
}
