import * as React from 'react';
import * as PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {ReduxState, ConnectProps} from '../models';
import {bind} from '../util';

function range(min, max, step, epsilon = 1e-9) {
  const xs = [];
  for (let x = min; x < (max - epsilon); x += step) {
    xs.push(x);
  }
  return xs;
}

class ViewConfigScale extends React.Component<{min?: number, max?: number, step?: number, scale?: number} & ConnectProps> {
  @bind
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
        <input type="range" list="ticks" value={scale} onChange={this.onChange}
          min={min} max={max} step={step} />
        <datalist id="ticks">
          {ticks.map((tick, i) => <option key={i}>{tick.toFixed(1)}</option>)}
        </datalist>
      </div>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    scale: PropTypes.number.isRequired,
  };
}

const mapStateToProps = ({viewConfig: {scale}}: ReduxState) => ({scale});
const ConnectedViewConfigScale = connect(mapStateToProps)(ViewConfigScale);

export default ConnectedViewConfigScale;
