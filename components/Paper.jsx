import React from 'react';
import {PaperPropTypes} from './propTypes';

import PaperSection from './PaperSection';

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
