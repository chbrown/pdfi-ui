import React from 'react';

export const RectanglePropTypes = {
  minX: React.PropTypes.number.isRequired,
  minY: React.PropTypes.number.isRequired,
  maxX: React.PropTypes.number.isRequired,
  maxY: React.PropTypes.number.isRequired,
};

export const TextSpanPropTypes = {
  // rectangle props
  minX: React.PropTypes.number.isRequired,
  minY: React.PropTypes.number.isRequired,
  maxX: React.PropTypes.number.isRequired,
  maxY: React.PropTypes.number.isRequired,
  // text span props
  // this matches the properties in pdfi.graphics.models.TextSpan (and thus, its JSON representation)
  string: React.PropTypes.string.isRequired,
  fontSize: React.PropTypes.number.isRequired,
  fontBold: React.PropTypes.bool.isRequired,
  fontItalic: React.PropTypes.bool.isRequired,
  details: React.PropTypes.any,
};

export const ContainerPropTypes = {
  // rectangle props
  minX: React.PropTypes.number.isRequired,
  minY: React.PropTypes.number.isRequired,
  maxX: React.PropTypes.number.isRequired,
  maxY: React.PropTypes.number.isRequired,
  elements: React.PropTypes.arrayOf(React.PropTypes.shape(TextSpanPropTypes)).isRequired,
};

export const CrossReferencePropTypes = {
  object_number: React.PropTypes.number.isRequired,
  generation_number: React.PropTypes.number.isRequired,
  in_use: React.PropTypes.bool.isRequired,
};

export const AuthorPropTypes = {
  first: React.PropTypes.string,
  middle: React.PropTypes.string,
  last: React.PropTypes.string.isRequired,
};

export const OperationPropTypes = {
  operator: React.PropTypes.string.isRequired,
  operands: React.PropTypes.any.isRequired,
};

export const PaperSectionPropTypes = {
  title: React.PropTypes.string.isRequired,
  paragraphs: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

export const PaperPropTypes = {
  sections: React.PropTypes.arrayOf(React.PropTypes.shape(PaperSectionPropTypes)).isRequired,
};

export const ReferencePropTypes = {
  authors: React.PropTypes.arrayOf(React.PropTypes.shape(AuthorPropTypes)).isRequired,
  year: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
};
