import * as React from 'react';
import * as PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {linkPaper, citeRegExp} from 'academia/styles/acl';

import {PDF} from 'pdfi';

import {ReduxState} from '../models';
import {AuthorPropTypes, ReferencePropTypes} from '../propTypes';
import Author from '../components/Author';

const ReferenceRow = ({authors, year, title, index}) => {
  return (
    <tr>
      <td><i>{index}</i></td>
      <td></td>
      <td className="list">
        {authors.map((author, index) => <Author key={index} {...author} />)}
      </td>
      <td>{year}</td>
      <td>{title}</td>
      {/* <td><code style="font-size: 80%">{source}</code></td> */}
    </tr>
  );
};
ReferenceRow['propTypes'] = ReferencePropTypes;

const CitationRow = ({reference = null, authors, year, index}) => (
  <tr>
    <td><i>{index}</i></td>
    {/* <td><code style="font-size: 80%">{source}</code></td> */}
    <td className="list">
      {authors.map((author, index) => <Author key={index} {...author} />)}
    </td>
    <td>{year}</td>
    {reference ?
      <td>
        <span className="list">
          {reference.authors.map((author, index) => <Author key={index} {...author} />)}
        </span>{'. '}
        {reference.year}{'. '}
        <b>{reference.title}</b>.
      </td> :
      <td><i>no reference</i></td>
    }
  </tr>
);
CitationRow['propTypes'] = {
  authors: PropTypes.arrayOf(PropTypes.shape(AuthorPropTypes)).isRequired,
  year: PropTypes.string.isRequired,
  reference: PropTypes.shape(ReferencePropTypes), // might be missing if it could not be matched
};

class PDFCitations extends React.Component<{pdf?: PDF}> {
  render() {
    const {pdf} = this.props;
    const originalPaper = pdf.renderPaper();
    // use linking logic from academia
    const paper = linkPaper(originalPaper);

    const regExp = citeRegExp;
    // replace references
    function highlightCitations(string) {
      // reset the regex
      regExp.lastIndex = 0;
      // set up the iteration variables
      const elements = [];
      let previousLastIndex = regExp.lastIndex;
      let match;
      while ((match = regExp.exec(string)) !== null) {
        const prefix = string.slice(previousLastIndex, match.index);
        elements.push(prefix, <span className="citation">{match[0]}</span>);
        previousLastIndex = regExp.lastIndex;
      }
      const postfix = string.slice(previousLastIndex);
      elements.push(postfix);
      return elements;
    }

    return (
      <div>
        <section className="hpad">
          <h2>Body</h2>
          {paper.sections.filter(section => !/References?/.test(section.title)).map((section, i) =>
            <div key={i} className="paper-section">
              <h4>{highlightCitations(section.title)}</h4>
              {section.paragraphs.map(paragraph => highlightCitations(paragraph))}
            </div>
          )}
        </section>
        <h3 className="hpad">Bibliography References</h3>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>Index</th>
              <th>Authors</th>
              <th>Year</th>
              <th>Title</th>
              {/* <th>Source</th> */}
            </tr>
          </thead>
          <tbody>
            {paper.references.map((reference, i) =>
              <ReferenceRow key={i} index={i} {...reference} />
            )}
          </tbody>
        </table>
        <h3 className="hpad">Inline Citations</h3>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>Index</th>
              {/* <th>Source</th> */}
              <th>Authors</th>
              <th>Year</th>
              <th>Matched Reference</th>
            </tr>
          </thead>
          <tbody>
            {paper.cites.map((citation, i) =>
              <CitationRow key={i} index={i} {...citation} />
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = ({pdf}: ReduxState) => ({pdf});
const ConnectedPDFCitations = connect(mapStateToProps)(PDFCitations);

export default ConnectedPDFCitations;
