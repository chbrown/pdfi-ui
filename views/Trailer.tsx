import * as React from 'react'
import {connect} from 'react-redux'
import {asArray} from 'tarry'
import {PDF} from 'pdfi'

import {ReduxState} from '../models'
import ObjectView from '../components/ObjectView'

class Trailer extends React.Component<{pdf: PDF}> {
  render() {
    const {pdf} = this.props
    const {trailer} = pdf
    const trailerObjects = asArray(trailer ? trailer.objects : [])
    return (
      <section className="hpad">
        <h2>Trailer object sequence</h2>
        <ol>
          {trailerObjects.map((trailerObject, i) => (
            <li key={i}>
              <ObjectView object={trailerObject} />
            </li>
          ))}
        </ol>
      </section>
    )
  }
}

const ConnectedTrailer = connect(({pdf}: ReduxState) => ({pdf}))(Trailer)

export default ConnectedTrailer
