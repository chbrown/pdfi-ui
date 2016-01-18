import React from 'react';
import {connect} from 'react-redux';

function range(min, max, step, epsilon = 1e-9) {
  var xs = [];
  for (var x = min; x < (max - epsilon); x += step) {
    xs.push(x);
  }
  return xs;
}

@connect(state => ({scale: state.viewConfig.scale}))
export default class Scale extends React.Component {
  onChange(ev) {
    var value = parseFloat(ev.target.value);
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: 'scale', value});
  }
  render() {
    const {min = 0.1, max = 4.0, step = 0.1, scale} = this.props;
    var ticks = range(min, max + step, step);
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
  static propTypes = {
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    scale: React.PropTypes.number.isRequired,
  }
}
