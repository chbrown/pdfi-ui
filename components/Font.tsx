import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Model} from 'pdfi/models'
import {Font as pdfiFont} from 'pdfi/font'
import {decodeGlyphname, expandDifferences} from 'pdfi/encoding/index'
import * as glyphmaps from 'pdfi/encoding/glyphmaps'

import ObjectView from './ObjectView'

interface FontProps {
  font: pdfiFont
}

const Font: React.StatelessComponent<FontProps> = ({font}) => {
  const FirstChar = font.get('FirstChar')
  const LastChar = font.get('LastChar')
  const Name = font.FontDescriptor.get('FontName')
  const {Type, Subtype} = font.toJSON()
  const {BaseEncoding, BaseFont, bold, italic} = font
  const details = {Name, Type, Subtype, BaseEncoding, BaseFont, bold, italic}
  const Widths = new Model(font._pdf, font.get('Widths')).object

  const defaultGlyphmap = glyphmaps[BaseEncoding] || glyphmaps.StandardEncoding
  const defaultStringmap = defaultGlyphmap.map(decodeGlyphname)
  // TODO: handle ToUnicode

  const differences_mapping = expandDifferences(font.Differences || [])

  const characters = []
  for (let i = FirstChar; i <= LastChar; i++) {
    characters.push({
      index: i,
      width: Widths[i - FirstChar],
      defaultEncoding: defaultStringmap[i],
      difference: differences_mapping[i],
      encoding: font.encoding.mapping[i],
    })
  }

  return (
    <div>
      <h3>Basic information</h3>
      <ObjectView object={details} />
      <h3>Characters {FirstChar} to {LastChar}</h3>
      <table className="fill padded striped lined">
        <thead>
          <tr>
            <th>Index</th>
            <th>Width</th>
            <th>Default Encoding</th>
            <th>Difference (glyph name)</th>
            <th>Difference (string)</th>
            <th>Encoding</th>
          </tr>
        </thead>
        <tbody>
          {characters.map(({index, width, defaultEncoding, difference, encoding}) =>
            <tr key={index}>
              <td>{index}</td>
              <td>{width}</td>
              <td>{defaultEncoding}</td>
              <td>{difference}</td>
              <td>{difference && decodeGlyphname(difference)}</td>
              <td>{encoding}</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  )
}
Font.propTypes = {
  font: PropTypes.object.isRequired,
}

export default Font
