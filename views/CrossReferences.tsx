import * as React from 'react'
import {connect} from 'react-redux'

import {PDF} from 'pdfi'

import {ReduxState} from '../models'
import CrossReferencesTable from '../components/CrossReferences'

class PDFCrossReferencesTable extends React.Component<{pdf?: PDF}> {
  render() {
    const {pdf} = this.props
    return (
      <section className="hpad">
        <h2>Cross References</h2>
        <CrossReferencesTable cross_references={pdf.cross_references} />
      </section>
    )
  }
}

const mapStateToProps = ({pdf}: ReduxState) => ({pdf})
const ConnectedPDFCrossReferencesTable = connect(mapStateToProps)(PDFCrossReferencesTable)

export default ConnectedPDFCrossReferencesTable
