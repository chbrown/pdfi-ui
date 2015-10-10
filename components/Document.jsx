import React from 'react';
import {SectionPropTypes, PaperPropTypes} from './propTypes';

class Section extends React.Component {
  render() {
    return (
      <div>
        <h4>{this.props.title}</h4>
        {this.props.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
    );
  }
  static propTypes = SectionPropTypes
}

export default class Document extends React.Component {
  render() {
    var sections = this.props.paper.sections.map((section, index) => {
      // style="border-top: 1px solid gray"
      return (
        <div key={index} className="hpad section">
          <h3><i>Section {index}</i></h3>
          <Section {...section} />
        </div>
      );
    });
    return (
      <section className="hpad">
        <h2>Document</h2>
        <ul>
          <li>fontSize_quartiles (the first and last are the minimum and maximum): {this.props.fontSize_quartiles}</li>
        </ul>
        {sections}
      </section>
    );
  }
  static propTypes = {
    paper: React.PropTypes.shape(PaperPropTypes).isRequired,
    fontSize_quartiles: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  }
}
