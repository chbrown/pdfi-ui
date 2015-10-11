import React from 'react';
import {SectionPropTypes, PaperPropTypes} from './propTypes';

import NumberFormat from './NumberFormat';

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
        <table>
          <caption>fontSize_quartiles (the first and last are the minimum and maximum)</caption>
          <tbody>
            <tr>
              <th>0%</th>
              <th>25%</th>
              <th>50%</th>
              <th>75%</th>
              <th>100%</th>
            </tr>
            <tr>
              {this.props.fontSize_quartiles.map((quartile, i) => <td key={i}><NumberFormat value={quartile} digits={2} /></td>)}
            </tr>
          </tbody>
        </table>
        {sections}
      </section>
    );
  }
  static propTypes = {
    paper: React.PropTypes.shape(PaperPropTypes).isRequired,
    fontSize_quartiles: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  }
}
