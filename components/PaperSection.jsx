import React from 'react';
import {PaperSectionPropTypes} from './propTypes';

export default class PaperSection extends React.Component {
  render() {
    return (
      <div className="paper-section">
        <h4>{this.props.title}</h4>
        {this.props.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
    );
  }
  static propTypes = PaperSectionPropTypes
}
