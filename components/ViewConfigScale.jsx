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
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: 'scale', value: parseFloat(ev.target.value)});
  }
  render() {
    var ticks = range(this.props.min, this.props.max + this.props.step, this.props.step);
    return (
      <div>
        <div>Scale (<output>{(this.props.scale * 100).toFixed(0)}</output>%)</div>
        <input type="range" list="ticks" value={this.props.scale} onChange={this.onChange.bind(this)}
          min={this.props.min} max={this.props.max} step={this.props.step} />
        <datalist id="ticks">
          {ticks.map((tick, i) => <option key={i}>{tick.toFixed(1)}</option>)}
        </datalist>
      </div>
    );
  }
  static propTypes = {
    min: React.PropTypes.number.isRequired,
    max: React.PropTypes.number.isRequired,
    step: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
  }
  static defaultProps = {
    min: 0.1,
    max: 4.0,
    step: 0.1,
  }
}
