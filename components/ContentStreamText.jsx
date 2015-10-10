import React from 'react';

export default class ContentStreamText extends React.Component {
  render() {
    return (
      <section className="hpad">
        <h3>Text Operations</h3>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>Action</th>
              <th>Argument</th>
              <th>Bytes</th>
              <th>Character Byte Length</th>
              <th>Font Name</th>
            </tr>
          </thead>
          <tbody>
            {this.props.spans.map(span => (
              <tr>
                <td>{span.action}</td>
                <td>{span.argument}</td>
                <td>{span.bytes}</td>
                <td>{span.characterByteLength}</td>
                <td>{span.fontName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }
  static propTypes = {
    spans: React.PropTypes.array.isRequired,
  }
}
