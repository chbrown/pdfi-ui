interface Action {
  type: string;
  pdf?: any;
  filename?: string;
  key?: string;
  value?: any;
}

export function pdf(pdf = {}, action: Action) {
  switch (action.type) {
  case 'SET_PDF':
    return action.pdf;
  default:
    return pdf;
  }
}

export function filename(filename = '', action: Action) {
  switch (action.type) {
  case 'SET_PDF':
    return action.filename;
  default:
    return filename;
  }
}

const initialViewConfig = {
  scale: 1.0,
  outlines: true,
  labels: true,
};

var storedViewConfig = {};
try {
  storedViewConfig = JSON.parse(localStorage['viewConfig']);
}
catch (exc) { }

export function viewConfig(viewConfig = Object.assign(initialViewConfig, storedViewConfig), action: Action) {
  switch (action.type) {
  case 'UPDATE_VIEW_CONFIG':
    var newViewConfig = Object.assign({}, viewConfig, {[action.key]: action.value});
    localStorage['viewConfig'] = JSON.stringify(newViewConfig);
    return newViewConfig;
  default:
    return viewConfig;
  }
}
