import React from 'react';
import {PaperPropTypes, PaperSectionPropTypes} from '../propTypes';

export class PaperSection extends React.Component {
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

export default class Paper extends React.Component {
  render() {
    var sections = this.props.sections.map((section, index) => {
      return (
        <div key={index} className="hpad section">
          <h3><i>Section {index}</i></h3>
          <PaperSection {...section} />
        </div>
      );
    });
    return <div className="paper">{sections}</div>;
  }
  static propTypes = PaperPropTypes
}
