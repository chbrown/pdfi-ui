import * as React from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import {simplify} from 'pdfi'

type ObjectViewProps = {object: any} & RouteComponentProps<{name: string}>

class ObjectView extends React.Component<ObjectViewProps> {
  render(): React.ReactNode {
    const {name} = this.props.match.params
    const object = simplify(this.props.object)
    if (object === undefined) {
      return <i className="undefined">undefined</i>
    }
    else if (object === null) {
      return <b className="null">null</b>
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return (
        <Link className="reference" to={`/${name}/objects/${object.object_number}`}>
          {object.object_number}:{object.generation_number}
        </Link>
      )
    }
    else if (Array.isArray(object)) {
      const array_children = object.map((child, index) => <ConnectedObjectView key={index} object={child} />)
      return <span className="array">[{array_children}]</span>
    }
    else if (typeof object === 'object') {
      // if (object.toJSON) {
      //   object = object.toJSON()
      // }
      // const data = JSON.stringify(simplified_value)
      // skip keys that start with an underscore
      const keys = Object.keys(object).filter(key => key[0] !== '_')
      const object_children = keys.map(key => {
        const child = object[key]
        return (
          <div key={key}>
            <span className="name">{key}:</span>
            <ConnectedObjectView object={child} />
          </div>
        )
      })
      return <div className="object">{object_children}</div>
    }
    else if (typeof object === 'number') {
      return <span className="number">{object.toString()}</span>
    }
    else if (typeof object === 'boolean') {
      return <span className="boolean" title={object.toString()}>{object ? '✓' : '✗'}</span>
    }
    // catch-all
    return <span className="string">{object.toString()}</span>
  }
}

const ConnectedObjectView = withRouter(ObjectView)

export default ConnectedObjectView
