import React from 'react';
import {connect} from 'react-redux';
import {linkPaper, citeRegExp} from 'academia/styles/acl';

import {AuthorPropTypes, ReferencePropTypes} from './propTypes';
import Author from './Author';

class ReferenceRow extends React.Component {
  render() {
    return (
      <tr>
        <td><i>{this.props.index}</i></td>
        <td></td>
        <td className="list">
          {this.props.authors.map((author, index) => <Author key={index} {...author} />)}
        </td>
        <td>{this.props.year}</td>
        <td>{this.props.title}</td>
      </tr>
    );
  }
  static propTypes = ReferencePropTypes
}

class CitationRow extends React.Component {
  render() {
    var referenceCell = this.props.reference ? (
      <td>
        <span className="list">
          {this.props.reference.authors.map((author, index) => <Author key={index} {...author} />)}
        </span>{'. '}
        {this.props.reference.year}{'. '}
        <b>{this.props.reference.title}</b>.
      </td>
    ) : <td><i>no reference</i></td>;
    return (
      <tr>
        <td><i>{this.props.index}</i></td>
        <td className="list">
          {this.props.authors.map((author, index) => <Author key={index} {...author} />)}
        </td>
        <td>{this.props.year}</td>
        {referenceCell}
      </tr>
    );
  }
  static propTypes = {
    authors: React.PropTypes.arrayOf(React.PropTypes.shape(AuthorPropTypes)).isRequired,
    year: React.PropTypes.string.isRequired,
    reference: React.PropTypes.shape(ReferencePropTypes), // might be missing if it could not be matched
  }
}

@connect(state => ({pdf: state.pdf}))
export default class PDFCitations extends React.Component {
  render() {
    var pdf = this.props.pdf;
    var paper = pdf.renderPaper();
    // use linking logic from academia
    linkPaper(paper);
    var references = paper.references;
    var citations = paper.cites;

    var regExp = citeRegExp;

    // replace references
    function highlightCitations(string) {
      // reset the regex
      regExp.lastIndex = 0;
      // set up the iteration variables
      var previousLastIndex = regExp.lastIndex;
      var elements = [];
      var match;
      while ((match = regExp.exec(string)) !== null) {
        var prefix = string.slice(previousLastIndex, match.index);
        elements.push(prefix, <span className="citation">{match[0]}</span>);
        previousLastIndex = regExp.lastIndex;
      }
      var postfix = string.slice(previousLastIndex);
      elements.push(postfix);
      return elements;
    }

    var body_sections = paper.sections.filter(section => !/References?/.test(section.title)).map(section => {
      return (
        <div className="paper-section">
          <h4>{highlightCitations(section.title)}</h4>
          {section.paragraphs.map(paragraph => highlightCitations(paragraph))}
        </div>
      );
    });

    return (
      <div>
        <section className="hpad">
          <h2>Body</h2>
          {body_sections}
        </section>
        <h3 className="hpad">Bibliography References</h3>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>Index</th>
              <th>Authors</th>
              <th>Year</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {references.map((reference, index) => <ReferenceRow key={index} index={index} {...reference} />)}
          </tbody>
        </table>
        <h3 className="hpad">Inline Citations</h3>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>Index</th>
              <th>Authors</th>
              <th>Year</th>
              <th>Matched Reference</th>
            </tr>
          </thead>
          <tbody>
            {citations.map((citation, index) => <CitationRow key={index} index={index} {...citation} />)}
          </tbody>
        </table>
      </div>
    );
  }
}
