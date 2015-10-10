import {range} from 'lodash';
import React from 'react';

import {px} from './common';
import Layout from './Layout';

class LayoutContainer extends React.Component {
  render() {
    var style = {
      width: px((this.props.outerBounds.maxX - this.props.outerBounds.minX) * this.props.scale),
      height: px((this.props.outerBounds.maxY - this.props.outerBounds.minY) * this.props.scale),
    };
    var scaledStyle = {
      transform: `scale(${this.props.scale})`,
      transformOrigin: '0% 0%',
    };
    // TODO: CSS Transform does not affect document flow, so we need to add a spacer
    return (
      <div className={this.props.className} style={style}>
        <div style={scaledStyle}>
          <Layout {...this.props} />
        </div>
      </div>
    );
  }
}

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 1.0,
      draw_outlines: true,
      draw_labels: true,
    };
  }
  render() {
    var ticks = range(0.1, 4.1, 0.1);
    var layout_className = [
      'layout',
      ...(this.state.draw_outlines ? ['draw-outlines'] : []),
      ...(this.state.draw_labels ? ['draw-labels'] : []),
    ].join(' ');
    return (
      <div>
        <section className="hpad">
          <div>
            <div>Scale (<output>{(this.state.scale * 100).toFixed(0)}</output>%)</div>
            <input type="range" min="0.1" max="4.0" step="0.1" list="ticks" value={this.state.scale} style={{width: '400px'}}>
            <datalist id="ticks">
              {ticks.map(tick => <option>{tick}</option>)}
            </datalist>
          </div>
          <div>
            <label>
              <input type="checkbox" value={this.state.draw_outlines}> Draw outlines
            </label>
            <label>
              <input type="checkbox" value={this.state.draw_labels}> Draw labels
            </label>
          </div>
        </section>
        <section className="hpad">
          {this.layouts.map(layout => <Layout scale={this.state.scale} {...layout} />)}
        </section>
      </div>
    );
  }
  static propTypes = {
    layouts: React.PropTypes.array.isRequired,
  }
}
