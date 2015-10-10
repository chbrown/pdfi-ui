import React from 'react';
import {makeBoundsStyle, makeBoundsString} from './common';
import {RectanglePropTypes, TextSpanPropTypes, ContainerPropTypes} from './propTypes';

export default class Layout extends React.Component {
  render() {
    var containers = this.props.containers.map((container, index) => {
      var textSpans = container.elements.map((textSpan, j) => {
        return <TextSpan key={j} {...textSpan} />;
      });
      return (
        <div key={index}>
          <div className="box" style={makeBoundsStyle(container)}>
            <div className="label">{index.toString()}</div>
            <section>{textSpans}</section>
          </div>
        </div>
      );
    });
    return (
      <div className="graphics" style={makeBoundsStyle(layout.outerBounds)}>
        <div className="label">{makeBoundsString(layout.outerBounds)}</div>
        <div className="container">
          {containers}
        </div>
      </div>
    );
  }
  static propTypes = {
    outerBounds: React.PropTypes.shape(RectanglePropType).isRequired,
    textSpans: React.PropTypes.arrayOf(React.PropTypes.shape(TextSpanPropTypes)).isRequired,
    containers: React.PropTypes.arrayOf(React.PropTypes.shape(ContainerPropTypes)).isRequired,
  }
}
