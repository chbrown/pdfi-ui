import * as React from 'react';
import {PaperPropTypes, PaperSectionPropTypes} from '../propTypes';

const PaperSection = ({title, paragraphs}) => (
  <div className="paper-section">
    <h4>{title}</h4>
    {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
  </div>
);
PaperSection.propTypes = PaperSectionPropTypes;

const Paper = ({sections}) => (
  <div className="paper">
    {sections.map((section, index) =>
      <div key={index} className="hpad section">
        <h3><i>Section {index}</i></h3>
        <PaperSection {...section} />
      </div>
    )}
  </div>
);
Paper.propTypes = PaperPropTypes;

export default Paper;
