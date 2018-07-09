import * as React from 'react'
import {Route, RouteComponentProps, withRouter} from 'react-router'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {asArray} from 'tarry'

import {PDF} from 'pdfi'

import {ReduxState, ConnectProps, readArrayBufferSync} from '../models'
import * as remote from '../remote'
import ObjectView from '../components/ObjectView'
import NumberFormat from '../components/NumberFormat'
import Objects from './Objects'
import Page from './PageLayout'
import Citations from './Citations'
import CrossReferences from './CrossReferences'
import Document from './Document'
import Trailer from './Trailer'

type NavigatorProps = {pdf?: PDF} & ConnectProps & RouteComponentProps<{name: string}>

class Navigator extends React.Component<NavigatorProps> {
  reloadState(filename) {
    remote.readFile(filename)
    .then(arrayBuffer => {
      const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'})
      this.props.dispatch({type: 'SET_PDF', pdf, filename})
    })
    // TODO: handle errors
  }
  componentWillMount() {
    // I wish there were a better way for hooking into path changes and loading
    // a PDF into the store/context, but this is the best I can think up.
    this.reloadState(this.props.match.params.name)
  }
  render() {
    const {match, pdf} = this.props
    const {params} = match
    return (
      <div className="pdf-container">
        <nav className="thumbnails">
          <h3>File name: <code>{params.name}</code></h3>
          <h5>File size: <NumberFormat value={pdf.size} /> bytes</h5>

          <h4><NavLink to={`${match.url}/document`}>Document</NavLink></h4>
          <h4><NavLink to={`${match.url}/citations`}>Citations</NavLink></h4>
          <h4><NavLink to={`${match.url}/cross-references`}>Cross References</NavLink></h4>
          <h4><NavLink to={`${match.url}/trailer`}>Trailer</NavLink></h4>
          <ObjectView object={pdf.trailer} />

          <h4>Pages</h4>
          {asArray(pdf.pages).map((page, i) =>
            <div key={i} className="hpad page">
              <h4><NavLink to={`${match.url}/pages/${i + 1}`}>Page {i + 1}</NavLink></h4>
              <ObjectView object={page} />
            </div>
          )}
        </nav>
        {pdf.size ?
          <article>
            <Route path={`${match.path}/document`} component={Document} />
            <Route path={`${match.path}/cross-references`} component={CrossReferences} />
            <Route path={`${match.path}/citations`} component={Citations} />
            <Route path={`${match.path}/trailer`} component={Trailer} />
            <Route path={`${match.path}/pages/:page`} component={Page} />
            <Route path={`${match.path}/objects/:object_number`} component={Objects} />
          </article> :
          <article>
            <h4 className="hpad">Loading...</h4>
          </article>}
      </div>
    )
  }
}

const mapStateToProps = ({pdf}: ReduxState) => ({pdf})
const ConnectedNavigator = withRouter(connect(mapStateToProps)(Navigator))

export default ConnectedNavigator
