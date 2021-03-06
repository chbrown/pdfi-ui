import {PDF} from 'pdfi'

import {LogLevel, LogEntry, ViewConfig, LogAction, SetPDFAction, UpdateViewConfigAction} from './models'

export function log(log: LogEntry[] = [], action: LogAction) {
  switch (action.type) {
  case 'LOG':
    if ('error' in action) {
      const {message} = action.error
      const newEntry = {message, ...action.error, level: LogLevel.error, created: new Date()}
      return log.concat(newEntry)
    }
    else {
      const newEntry = {level: LogLevel.info, ...action, created: new Date()}
      return log.concat(newEntry)
    }
  default:
    return log
  }
}

export function pdf(pdf: PDF = null, action: SetPDFAction) {
  switch (action.type) {
  case 'SET_PDF':
    return action.pdf
  default:
    return pdf
  }
}

const initialViewConfig: ViewConfig = {
  scale: 1,
  outlines: false,
  labels: false,
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
