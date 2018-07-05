import * as React from 'react';
import * as PropTypes from 'prop-types';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {flatMap} from 'tarry';

import {PDF} from 'pdfi';
import {Page} from 'pdfi/models';
import {TextSpan, renderLayoutFromPage} from 'pdfi/graphics';
import {Rectangle, makeRectangle, Container} from 'pdfi/graphics/geometry';

import {ReduxProps} from '../models';
import {px, makeBoundsStyle} from '../graphics';
import {RectanglePropTypes, ContainerPropTypes, TextSpanPropTypes} from '../propTypes';

import {TextSpanTable} from '../components/TextSpan';
import ViewConfigScale from '../components/ViewConfigScale';
import ViewConfigCheckbox from '../components/ViewConfigCheckbox';

// `type LayoutElement = Container<LayoutElement> | TextSpan` isn't allowed, unfortunately
type LayoutElement = Container<any> | TextSpan;
function isContainer(element: LayoutElement): element is Container<LayoutElement> {
  return 'elements' in element;
}
function isTextSpan(element: LayoutElement): element is TextSpan {
  return !isContainer(element);
}

@connect(state => ({page: state.page}))
export class PageTable extends React.Component<{page?: Page}, {}> {
  render() {
    const {page} = this.props;
    // `containers` represents the paragraphs on the page
    const containers = renderLayoutFromPage(page, false);
    const textSpans = flatMap(containers, paragraph =>
      flatMap(paragraph.elements, line =>
        line.elements.map(wordGroup => {
          const {minX, minY, maxX, maxY} = wordGroup;
          // just run with the font properties of the first fragment
          const {fontName, fontSize, fontBold, fontItalic} = wordGroup.elements[0];
          // concat the text and buffer values
          const buffer = Buffer.concat(wordGroup.elements.map(({buffer}) => buffer));
          const text = wordGroup.elements.map(({text}) => text).join('');
          return {minX, minY, maxX, maxY, fontName, fontSize, fontBold, fontItalic, buffer, text}; // : TextSpan
        })
      )
    );

    return (
      <TextSpanTable textSpans={textSpans} />
    );
  }
}

class ContainerTree extends React.Component<Container<LayoutElement> & React.Props<any>, {}> {
  render() {
    const {minX, minY, maxX, maxY, elements} = this.props;
    return (
      <fieldset className="container">
        <legend>
          ({minX.toFixed(3)},{minY.toFixed(3)}), ({(maxX - minX).toFixed(3)}x{(maxY - minY).toFixed(3)})
        </legend>
        {elements.map((element, i) =>
          isTextSpan(element) ?
            <div key={i}><code>[{element.fontName}]: {element.text}</code></div> :
            <ContainerTree key={i} {...element} />
        )}
      </fieldset>
    );
  }
  static propTypes = ContainerPropTypes;
}

@connect(state => ({page: state.page}))
export class PageTree extends React.Component<{page?: Page}, {}> {
  render() {
    const {page} = this.props;
    // `containers` represents the paragraphs on the page
    const containers = renderLayoutFromPage(page, false);

    return (
      <section>
        {containers.map((container, i) =>
          <ContainerTree key={i} {...container} />
        )}
      </section>
    );
  }
}

class BoxLabel extends React.Component<Rectangle, {}> {
  render() {
    const {minX, minY, maxX, maxY} = this.props;
    return (
      <div className="box" style={makeBoundsStyle({minX, minY, maxX, maxY})}>
        <span className="label">({minX.toFixed(3)},{minY.toFixed(3)}), ({(maxX - minX).toFixed(3)}x{(maxY - minY).toFixed(3)})</span>
      </div>
    );
  }
}

class TextSpanBox extends React.Component<TextSpan & React.Props<any>, {}> {
  render() {
    const {minX, minY, maxX, maxY, text, fontName, fontSize, fontBold, fontItalic} = this.props;
    // if fontSize is less than 6, set it to 6 (kind of a hack)
    const normalized_fontSize = Math.max(fontSize, 6);
    const style  = makeBoundsStyle({minX, minY, maxX, maxY});
    style.fontSize = normalized_fontSize.toFixed(3) + 'px';
    style.fontWeight = fontBold ? 'bold' : 'normal';
    style.fontStyle = fontItalic ? 'italic' : 'normal';
    const digits = 0;
    const title = `[${minX.toFixed(digits)}, ${minY.toFixed(digits)}, ${maxX.toFixed(digits)}, ${maxY.toFixed(digits)}] fontName=${fontName} fontSize=${fontSize.toFixed(3)}`;
    return <div className="textSpan" style={style} title={title}>{text}</div>;
  }
  static propTypes = TextSpanPropTypes;
}

class ContainerBox extends React.Component<Container<LayoutElement> & React.Props<any>, {}> {
  render() {
    const {minX, minY, maxX, maxY, elements} = this.props;
    return (
      <div className="container">
        <BoxLabel minX={minX} minY={minY} maxX={maxX} maxY={maxY} />
        {elements.map((element, i) =>
          isTextSpan(element) ?
            <TextSpanBox key={i} {...element} /> :
            <ContainerBox key={i} {...element} />
        )}
      </div>
    );
  }
  static propTypes = ContainerPropTypes;
}

@connect(state => ({page: state.page, scale: state.viewConfig.scale}))
export class PageLayout extends React.Component<{page?: Page, scale?: number}, {}> {
  render() {
    const {page, scale} = this.props;
    const outerBounds = makeRectangle(page.MediaBox[0], page.MediaBox[1], page.MediaBox[2], page.MediaBox[3]);
    // `containers` represents the paragraphs on the page
    const containers = renderLayoutFromPage(page, false);

    const rootStyle = {
      // the browser just can't handle scaling of the container based on the scaled contents,
      // so we have to do some of the math here.
      width: px((outerBounds.maxX - outerBounds.minX) * scale),
      height: px((outerBounds.maxY - outerBounds.minY) * scale),
      position: 'relative',
      // overflow: 'hidden',
    };
    const scaleStyle = {
      transform: `scale(${scale})`,
      transformOrigin: '0% 0%',
    };
    return (
      <section>
        <div>
          <ViewConfigCheckbox name="outlines" label="Draw outlines" />
          <ViewConfigCheckbox name="labels" label="Draw labels" />
        </div>
        <ViewConfigScale />
        <div className="layout" style={rootStyle}>
          <div style={scaleStyle}>
            <BoxLabel {...outerBounds} />
            {containers.map((container, i) =>
              <ContainerBox key={i} {...container} />
            )}
          </div>
        </div>
      </section>
    );
  }
}

/**
PDFPageLayout just reads the pdf out of the store, renders it to a Layout,
and sends that layout over the Layout component.
*/
@connect(state => ({pdf: state.pdf}))
export default class PDFPage extends React.Component<{pdf: PDF, params?: any} & React.Props<any> & ReduxProps, {}> {
  reloadState(props) {
    const {params, pdf} = props;
    const page_index = parseInt(params.page, 10) - 1;
    const page = pdf.pages[page_index];
    this.props.dispatch({type: 'SET_PAGE', page});
  }
  componentWillMount() {
    this.reloadState(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.page != this.props.params.page) {
      this.reloadState(nextProps);
    }
  }
  render() {
    const {children, params} = this.props;
    return (
      <section className="hpad">
        <h2>Page {params.page}</h2>
        <div className="hlinks">
          <Link to={`/${params.name}/pages/${params.page}/layout`}>layout</Link>
          <Link to={`/${params.name}/pages/${params.page}/tree`}>tree</Link>
          <Link to={`/${params.name}/pages/${params.page}/table`}>table</Link>
        </div>
        {children}
      </section>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    pdf: PropTypes.any.isRequired,
  };
}
