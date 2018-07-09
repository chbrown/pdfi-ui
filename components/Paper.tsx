import * as React from 'react'
import {PaperPropTypes, PaperSectionPropTypes} from '../propTypes'

interface PaperSectionProps {
  title: string
  paragraphs: string[]
}

const PaperSection: React.StatelessComponent<PaperSectionProps> = ({title, paragraphs}) => (
  <div className="paper-section">
    <h4>{title}</h4>
    {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
  </div>
)
PaperSection.propTypes = PaperSectionPropTypes

interface PaperProps {
  sections: PaperSectionProps[]
}

const Paper: React.StatelessComponent<PaperProps> = ({sections}) => (
  <div className="paper">
    {sections.map((section, index) =>
      <div key={index} className="hpad section">
        <h3><i>Section {index}</i></h3>
        <PaperSection {...section} />
      </div>
    )}
  </div>
)
Paper.propTypes = PaperPropTypes

export default Paper
