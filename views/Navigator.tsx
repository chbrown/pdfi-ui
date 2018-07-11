import * as React from 'react'
import {Redirect, Route, Switch, RouteComponentProps, withRouter} from 'react-router'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'

import {PDF} from 'pdfi'

import {ViewConfig, ReduxState, ConnectProps} from '../models'
import ObjectView from '../components/ObjectView'
import NumberFormat from '../components/NumberFormat'
import Objects from './Objects'
import Page from './PageLayout'
import Citations from './Citations'
import CrossReferences from './CrossReferences'
import Document from './Document'
import Trailer from './Trailer'

type NavigatorProps = {pdf?: PDF, viewConfig: ViewConfig} & ConnectProps & RouteComponentProps<{name: string}>

class Navigator extends React.Component<NavigatorProps> {
  render() {
    const {match, pdf, viewConfig} = this.props
    const {params} = match
    const viewConfigClassNames = [
      ...(viewConfig.outlines ? ['viewConfig-outlines'] : []),
      ...(viewConfig.labels ? ['viewConfig-labels'] : []),
    ].join(' ')

    return (
      <div className="pdf-container">
        <nav className="thumbnails">
          <h3>File name: <code>{params.name}</code></h3>
          <h5>File size: <NumberFormat value={pdf ? pdf.size : 0} /> bytes</h5>

          <h4><NavLink to={`${match.url}/document`}>Document</NavLink></h4>
          <h4><NavLink to={`${match.url}/citations`}>Citations</NavLink></h4>
          <h4><NavLink to={`${match.url}/cross-references`}>Cross References</NavLink></h4>
          <h4><NavLink to={`${match.url}/trailer`}>Trailer</NavLink></h4>
          <ObjectView object={pdf ? pdf.trailer : null} />

          <h4>Pages</h4>
          {(pdf ? pdf.pages : []).map((page, i) =>
            <div key={i} className="hpad page">
              <h4><NavLink to={`${match.url}/pages/${i + 1}`}>Page {i + 1}</NavLink></h4>
              <ObjectView object={page} />
            </div>
          )}
        </nav>
        {pdf ?
          <article className={viewConfigClassNames}>
            <Switch>
              <Route path={`${match.path}/document`} component={Document} />
              <Route path={`${match.path}/cross-references`} component={CrossReferences} />
              <Route path={`${match.path}/citations`} component={Citations} />
              <Route path={`${match.path}/trailer`} component={Trailer} />
              <Route path={`${match.path}/pages/:page`} component={Page} />
              <Route path={`${match.path}/objects/:object_number`} component={Objects} />
              <Redirect to={`${match.url}/pages/1`} />
            </Switch>
          </article> :
          <article>
            <h4 className="hpad">Loading...</h4>
          </article>}
      </div>
    )
  }
}

const ConnectedNavigator = withRouter(connect(({pdf, viewConfig}: ReduxState) => ({pdf, viewConfig}))(Navigator))

export default ConnectedNavigator
