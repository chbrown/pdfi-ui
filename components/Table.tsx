import * as React from 'react';

class Table extends React.Component<{objects: any[], columns?: string[]}, {}> {
  render() {
    let {objects, columns} = this.props;
    if (!columns) {
      columns = Object.keys(objects[0]);
    }
    return (
      <table className="fill padded striped lined">
        <thead>
          <tr>
            {columns.map((column, j) =>
              <th key={j}>{column}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {objects.map((object, i) =>
            <tr key={i}>
              {columns.map((column, j) =>
                <td key={j}>{object[column]}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default Table;
