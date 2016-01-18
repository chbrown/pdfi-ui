import React from 'react';
import {connect} from 'react-redux';

import {px, makeBoundsStyle, makeBoundsString} from '../graphics';
import {RectanglePropTypes, ContainerPropTypes} from '../propTypes';
import TextSpan from './TextSpan';

const TextSpansContainer = ({minX, minY, maxX, maxY, elements, index}) => (
  // each container describes a box, relative to the layout, but the
  // textSpans inside that container are also positioned relative to the
  // layout, not the box.
  <div>
    <div className="box-shaded" style={makeBoundsStyle({minX, minY, maxX, maxY})}>
      <span className="label">{index.toString()}</span>
    </div>
    {elements.map((textSpan, i) => <TextSpan key={i} {...textSpan} />)}
  </div>
);
TextSpansContainer.propTypes = ContainerPropTypes;

@connect(state => ({scale: state.viewConfig.scale}))
export default class Layout extends React.Component {
  render() {
    const {outerBounds, containers, scale} = this.props;
    var root_style = {
      // the browser just can't handle scaling of the container based on the scaled contents,
      // so we have to do some of the math here.
      width: px((outerBounds.maxX - outerBounds.minX) * scale),
      height: px((outerBounds.maxY - outerBounds.minY) * scale),
      position: 'relative',
      // overflow: 'hidden',
    };
    var scale_style = {
      transform: `scale(${scale})`,
      transformOrigin: '0% 0%',
    };
    return (
      <div className="layout" style={root_style}>
        <div style={scale_style}>
          <div className="box" style={makeBoundsStyle(outerBounds)}>
            <span className="label">{makeBoundsString(outerBounds)}</span>
          </div>
          {containers.map((container, i) =>
            <TextSpansContainer key={i} index={i} {...container} />
          )}
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
