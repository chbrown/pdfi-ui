import React from 'react';

import {makeBoundsStyle, makeBoundsString} from './common';
import {RectanglePropTypes, TextSpanPropTypes, ContainerPropTypes} from './propTypes';
import TextSpan from './TextSpan';

export default class Layout extends React.Component {
  render() {
    var containers = this.props.containers.map((container, index) => {
      var textSpans = container.elements.map((textSpan, j) => {
        return <TextSpan key={j} {...textSpan} />;
      });
      // each container describes a box, relative to the layout, but the
      // textSpans inside that container are also positioned relative to the
      // layout, not the box.
      return (
        <div key={index}>
          <div className="box" style={makeBoundsStyle(container)}>
            <span className="label">{index.toString()}</span>
          </div>
          {textSpans}
        </div>
      );
    });
    return (
      <div className="layout-container">
        <div className="layout" style={makeBoundsStyle(this.props.outerBounds)}>
          <span className="label">{makeBoundsString(this.props.outerBounds)}</span>
          {containers}
        </div>
      </div>
    );
  }
  static propTypes = {
    outerBounds: React.PropTypes.shape(RectanglePropTypes).isRequired,
    textSpans: React.PropTypes.arrayOf(React.PropTypes.shape(TextSpanPropTypes)).isRequired,
    containers: React.PropTypes.arrayOf(React.PropTypes.shape(ContainerPropTypes)).isRequired,
  }
}
