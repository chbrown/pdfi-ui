import React from 'react';
import {connect} from 'react-redux';

import {px, makeBoundsStyle, makeBoundsString} from './common';
import {RectanglePropTypes, ContainerPropTypes} from './propTypes';
import TextSpan from './TextSpan';

class TextSpansContainer extends React.Component {
  render() {
    var textSpans = this.props.elements.map((textSpan, i) => <TextSpan key={i} {...textSpan} />);
    // each container describes a box, relative to the layout, but the
    // textSpans inside that container are also positioned relative to the
    // layout, not the box.
    return (
      <div>
        <div className="box-shaded" style={makeBoundsStyle(this.props)}>
          <span className="label">{this.props.index.toString()}</span>
        </div>
        {textSpans}
      </div>
    );
  }
  static propTypes = ContainerPropTypes
}

@connect(state => ({scale: state.viewConfig.scale}))
export default class Layout extends React.Component {
  render() {
    var root_style = {
      // the browser just can't handle scaling of the container based on the scaled contents,
      // so we have to do some of the math here.
      width: px((this.props.outerBounds.maxX - this.props.outerBounds.minX) * this.props.scale),
      height: px((this.props.outerBounds.maxY - this.props.outerBounds.minY) * this.props.scale),
      position: 'relative',
      // overflow: 'hidden',
    };
    var scale_style = {
      transform: `scale(${this.props.scale})`,
      transformOrigin: '0% 0%',
    };
    var containers = this.props.containers.map((container, i) => <TextSpansContainer key={i} index={i} {...container} />);
    return (
      <div className="layout" style={root_style}>
        <div style={scale_style}>
          <div className="box" style={makeBoundsStyle(this.props.outerBounds)}>
            <span className="label">{makeBoundsString(this.props.outerBounds)}</span>
          </div>
          {containers}
        </div>
      </div>
    );
  }
  static propTypes = {
    outerBounds: React.PropTypes.shape(RectanglePropTypes).isRequired,
    // we don't use textSpans, though, since they're also in `containers`
    //textSpans: React.PropTypes.arrayOf(React.PropTypes.shape(TextSpanPropTypes)).isRequired,
    containers: React.PropTypes.arrayOf(React.PropTypes.shape(ContainerPropTypes)).isRequired,
  }
}
