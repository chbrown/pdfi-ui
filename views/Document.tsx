import * as React from 'react';
import * as PropTypes from 'prop-types';
import {flatMap, quantile, groupBy} from 'tarry';
import {connect} from 'react-redux';

import {PDF} from 'pdfi';
import {renderLayoutFromPage} from 'pdfi/graphics';
// import {paperFromContainers} from 'pdfi/graphics/document';

import NumberFormat from '../components/NumberFormat';
import Paper from '../components/Paper';

import {TextSpanTable} from '../components/TextSpan';

function counter(iterable) {
  const counts = new Map();
  for (let i = 0, l = iterable.length; i < l; i++) {
    const item = iterable[i];
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return counts;
}

const MapView = ({map}) => (
  <table className="fill padded striped lined">
    <thead>
      <tr>
        <th>key</th>
        <th>value</th>
      </tr>
    </thead>
    <tbody>
      {[...map].map(([key, value]) =>
        <tr key={key}>
          <td>{key}</td>
          <td>{value}</td>
        </tr>
      )}
    </tbody>
  </table>
);

@connect(state => ({pdf: state.pdf}))
export default class PDFDocument extends React.Component<{pdf: PDF}> {
  render() {
    const {pdf} = this.props;
    const pages = pdf.pages;

    // const layouts = pages.map((page, i, pages) => {
    //   console.log(`PDFDocument#render(): rendering page ${i + 1}/${pages.length}`);
    //   return renderLayoutFromPage(page, false);
    // });
    // const containers = flatMap(layouts, layout => layout.containers);
    const paper = {}; // paperFromContainers(containers);

    // const textSpans = flatMap(layouts, layout => layout.elements);
    // const fontSizes = textSpans.map(textSpan => textSpan.fontSize);
    const fontSize_quartiles = []; // quantile(fontSizes, 4);

    // const spans = renderSpans(pages);
    // const fontGroups = groupBy(spans, 'fontName');
    // const fontCounts = fontGroups.map(spans => {
    //   const buffers = spans.map(span => span.buffer);
    //   const buffer = Buffer.concat(buffers);
    //   const counts = counter(buffer);
    //   return {
    //     fontName: spans[0].fontName,
    //     counts: counts,
    //   };
    // });
    // console.log('fontCounts', fontCounts);

    return (
      <section className="hpad">
        <h2>Document</h2>
        <table className="quantile">
          <caption>fontSize_quartiles</caption>
          <tbody>
            <tr>
              <th>0% (minimum)</th>
              <th>25%</th>
              <th>50%</th>
              <th>75%</th>
              <th>100% (maximum)</th>
            </tr>
            <tr>
              {fontSize_quartiles.map((quartile, i) =>
                <td key={i}><NumberFormat value={quartile} digits={2} /></td>
              )}
            </tr>
          </tbody>
        </table>
        {/*
          <h2>Spans</h2>
          <SpansTable spans={spans} />
        */}
        <h2>Codes</h2>
        {/*fontCounts.map(({fontName, counts}) =>
          <div key={fontName}>
            <h3>{fontName}</h3>
            <MapView map={counts} />
          </div>
        )*/}
        {/*
          <h2>Paper</h2>
          <Paper {...paper} />
        */}
      </section>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    pdf: PropTypes.any.isRequired,
  };
}
