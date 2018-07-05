import * as React from 'react';
import {connect} from 'react-redux';

import {ReduxProps} from '../models';

function range(min, max, step, epsilon = 1e-9) {
  const xs = [];
  for (let x = min; x < (max - epsilon); x += step) {
    xs.push(x);
  }
  return xs;
}

@connect(state => ({scale: state.viewConfig.scale}))
export default class Scale extends React.Component<{min?: number, max?: number, step?: number, scale?: number} & ReduxProps, {}> {
  onChange(ev) {
    const value = parseFloat(ev.target.value);
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: 'scale', value});
  }
  render() {
    const {min = 0.1, max = 4.0, step = 0.1, scale} = this.props;
    const ticks = range(min, max + step, step);
    return (
      <div>
        <div>Scale (<output>{(scale * 100).toFixed(0)}</output>%)</div>
        <input type="range" list="ticks" value={scale} onChange={this.onChange.bind(this)}
          min={min} max={max} step={step} />
        <datalist id="ticks">
          {ticks.map((tick, i) => <option key={i}>{tick.toFixed(1)}</option>)}
        </datalist>
      </div>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    scale: React.PropTypes.number.isRequired,
  };
}
