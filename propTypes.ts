import {PropTypes, ValidationMap} from 'react';

export const RectanglePropTypes: ValidationMap<any> = {
  minX: PropTypes.number.isRequired,
  minY: PropTypes.number.isRequired,
  maxX: PropTypes.number.isRequired,
  maxY: PropTypes.number.isRequired,
};

export const TextSpanPropTypes: ValidationMap<any> = {
  // rectangle props
  minX: PropTypes.number.isRequired,
  minY: PropTypes.number.isRequired,
  maxX: PropTypes.number.isRequired,
  maxY: PropTypes.number.isRequired,
  // text span props
  // this matches the properties in pdfi.graphics.models.TextSpan (and thus, its JSON representation)
  string: PropTypes.string.isRequired,
  fontSize: PropTypes.number.isRequired,
  fontBold: PropTypes.bool.isRequired,
  fontItalic: PropTypes.bool.isRequired,
  details: PropTypes.any,
};

export const ContainerPropTypes = {
  // rectangle props
  minX: PropTypes.number.isRequired,
  minY: PropTypes.number.isRequired,
  maxX: PropTypes.number.isRequired,
  maxY: PropTypes.number.isRequired,
  elements: PropTypes.arrayOf(PropTypes.shape(TextSpanPropTypes)).isRequired,
};

export const CrossReferencePropTypes = {
  object_number: PropTypes.number.isRequired,
  generation_number: PropTypes.number.isRequired,
  in_use: PropTypes.bool.isRequired,
};

export const AuthorPropTypes: ValidationMap<any> = {
  first: PropTypes.string,
  middle: PropTypes.string,
  last: PropTypes.string.isRequired,
};

export const OperationPropTypes = {
  operator: PropTypes.string.isRequired,
  operands: PropTypes.any.isRequired,
};

export const PaperSectionPropTypes: ValidationMap<any> = {
  title: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export const PaperPropTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape(PaperSectionPropTypes)).isRequired,
};

export const ReferencePropTypes = {
  authors: PropTypes.arrayOf(PropTypes.shape(AuthorPropTypes)).isRequired,
  year: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
