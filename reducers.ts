import {PDF} from 'pdfi'
import {PDFObject} from 'pdfi/pdfdom'
import {Page} from 'pdfi/models'

import {ViewConfig, SetPDFAction, SetObjectAction, SetPageAction, UpdateViewConfigAction} from './models'

export function pdf(pdf: PDF = null, action: SetPDFAction) {
  switch (action.type) {
  case 'SET_PDF':
    return action.pdf
  default:
    return pdf
  }
}

export function object(object: PDFObject = null, action: SetObjectAction) {
  switch (action.type) {
  case 'SET_OBJECT':
    return action.object
  default:
    return object
  }
}

export function page(page: Page = null, action: SetPageAction) {
  switch (action.type) {
  case 'SET_PAGE':
    return action.page
  default:
    return page
  }
}

const initialViewConfig: ViewConfig = {
  scale: 1,
  outlines: true,
  labels: true,
}

try {
  const storedViewConfig = JSON.parse(localStorage.viewConfig)
  Object.assign(initialViewConfig, storedViewConfig)
}
catch (exc) {
  console.info('Could not read viewConfig from localStorage... using defaults')
}

export function viewConfig(viewConfig = initialViewConfig, action: UpdateViewConfigAction) {
  switch (action.type) {
  case 'UPDATE_VIEW_CONFIG':
    const newViewConfig = {...viewConfig, [action.key]: action.value}
    localStorage.viewConfig = JSON.stringify(newViewConfig)
    return newViewConfig
  default:
    return viewConfig
  }
}
