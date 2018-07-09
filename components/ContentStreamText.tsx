import * as React from 'react';
import * as PropTypes from 'prop-types';

interface TextOperation {
  action: 'showString' | 'advanceTextMatrix';
  argument: string;
  fontName?: string;
  characterByteLength?: number;
  buffer?: Buffer;
}

interface ContentStreamTextProps {
  spans: TextOperation[];
}

const ContentStreamText: React.StatelessComponent<ContentStreamTextProps> = ({spans}) => (
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
        {spans.map((span, i) => (
          <tr key={i}>
            <td>{span.action}</td>
            <td>{span.argument}</td>
            <td>{span.buffer}</td>
            <td>{span.characterByteLength}</td>
            <td>{span.fontName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);
ContentStreamText.propTypes = {
  spans: PropTypes.array.isRequired,
};

export default ContentStreamText;
