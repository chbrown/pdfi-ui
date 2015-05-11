/// <reference path="type_declarations/index.d.ts" />
import _ = require('lodash');

import academia = require('academia');

import {VNode} from 'virtual-dom';
import {Request, NetworkError} from './request';
import {File} from './models';
import * as components from './components';

let app = angular.module('app', [
  'ngResource',
  'ngStorage',
  'ui.router',
  'misc-js/angular-plugins',
]);

let log = console.log.bind(console);
// Error.stackTraceLimit = 50;

app.factory('httpFlashInterceptor', ($q, $flash) => {
  return {
   responseError: rejection => {
      var http_request = rejection.config.method + ' ' + rejection.config.url;
      var message = http_request + ' error: ' + rejection.data;
      $flash(message, 15000);
      return $q.reject(rejection);
    }
  };
});

app.config($httpProvider => {
  $httpProvider.interceptors.push('httpFlashInterceptor');
});

app.config($provide => {
  $provide.decorator('$exceptionHandler', ($delegate, $injector) => {
    return (exception, cause) => {
      if (exception instanceof NetworkError) {
        var $flash = $injector.get('$flash');
        $flash(exception.message);
        return;
      }
      $delegate(exception, cause);
    };
  });
});

app.filter('range', () => {
  return args => {
    return _.range.apply(_, args);
  };
});

app.filter('keys', () => {
  return value => {
    if (value === undefined || value === null) return [];
    return Object.keys(value);
  };
});

function px(number) {
  return number.toFixed(2) + 'px';
}
app.filter('px', () => px);

function rectStyle(rect) {
  if (rect === undefined || rect === null) return rect;
  if (rect.minX === null || rect.minY === null || rect.maxX === null || rect.maxY === null) return null;
  return {
    left: px(rect.minX),
    top: px(rect.minY),
    width: px(rect.maxX - rect.minX),
    height: px(rect.maxY - rect.minY),
  };
}
app.filter('rectStyle', () => rectStyle);

function rectString(rect) {
  if (rect === undefined || rect === null) return rect;
  if (rect.minX === null || rect.minY === null || rect.maxX === null || rect.maxY === null) return null;
  var dX = rect.maxX - rect.minX;
  var dY = rect.maxY - rect.minY;
  return `(${rect.minX.toFixed(3)},${rect.minY.toFixed(3)}) (${dX.toFixed(3)}x${dY.toFixed(3)})`;
}
app.filter('rectString', () => rectString);

function rectTuple(rect) {
  if (rect === undefined || rect === null) return rect;
  var tuple = [rect.minX, rect.minY, rect.maxX, rect.maxY];
  // convert to string?
  return tuple;
}
app.filter('rectTuple', () => rectTuple);

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
  $urlRouterProvider.otherwise(($injector, $location) => {
    log('otherwise: coming from "%s"', $location.url());
    return '/files';
  });

  $stateProvider
  .state('pdf', {
    url: '/files/{name:[^/]+\.pdf}',
    templateUrl: '/templates/pdf_navigator.html',
    controller: 'pdfCtrl',
  })
  .state('pdf.document', {
    url: '/document',
    templateUrl: '/templates/document.html',
    controller: 'documentCtrl',
  })
  .state('pdf.citations', {
    url: '/citations',
    templateUrl: '/templates/citations.html',
    controller: 'citationsCtrl',
  })
  // by object
  .state('pdf.object', {
    url: '/objects/{objectNumber:int}',
    template: '<ui-view></ui-view>',
    controller: 'objectCtrl',
    abstract: true,
  })
  .state('pdf.object.plain', {
    url: '/',
    templateUrl: '/templates/object.html',
  })
  .state('pdf.object.content_stream', {
    url: '/content-stream',
    templateUrl: '/templates/objects/content_stream.html',
    controller: 'contentStreamCtrl',
  })
  .state('pdf.object.font', {
    url: '/font',
    templateUrl: '/templates/objects/font.html',
    controller: 'fontCtrl',
  })
  .state('pdf.object.graphics', {
    url: '/graphics',
    templateUrl: '/templates/graphics.html',
    controller: 'graphicsCtrl',
  })
  // by page
  .state('pdf.page', {
    url: '/pages/{pageNumber:int}',
    templateUrl: '/templates/graphics.html',
    controller: 'pageCtrl',
  })
  .state('pdf.page_contents', {
    url: '/pages/{pageNumber:int}/contents',
    templateUrl: '/templates/contents.html',
    controller: 'pageContentsCtrl',
  });

  // rewriteLinks is nice because it lets us load new nested ui-views without
  // reloading the whole page, but it also listens for all click events at the
  // page level and intercepts and handles them before they can be canceled
  // elsewhere.
  $locationProvider.html5Mode({enabled: true, rewriteLinks: true});
});

function clean(object) {
  if (object === null || object === undefined) {
    return object;
  }
  if (typeof object.toJSON === 'function') {
    return object.toJSON();
  }
  return angular.copy(object);
}

function mapTree(object: any, func: (object: any) => any): any {
  object = func(object);
  if (Array.isArray(object)) {
    return object.map(child => mapTree(child, func));
  }
  else if (object !== undefined && object !== null && typeof object === 'object') {
    var mapped_object = {};
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        mapped_object[key] = mapTree(object[key], func);
      }
    }
    return mapped_object;
  }
  else {
    return object;
  }
}

app.directive('authors', () => {
  return {
    restrict: 'A',
    scope: {
      authors: '=',
    },
    templateUrl: '/templates/authors.html',
  }
});

app.directive('component', ($state) => {
  return {
    restrict: 'E',
    scope: {
      name: '@',
      model: '=',
      file: '=',
    },
    link: (scope, el) => {
      var name = scope['name'];
      var renderFunction: (model: any, channel: components.EventChannel) => VNode = components[`render${name}`];
      var root = new components.Root(el[0], renderFunction);
      scope.$watch('model', () => {
        root.update(clean(scope['model']));
      }, true);
      root.on('objectReferenceClick', (ev: MouseEvent, objectNumber: number) => {
        // command+alt-click to load the object in-place
        var model = clean(scope['model']);
        if (ev.metaKey && ev.altKey) {
          // get the desired reference
          scope['file'].getObject(objectNumber, (error, loadedObject) => {
            scope.$apply(() => {
              if (error) throw error;
              scope['model'] = mapTree(model, object => {
                return (object && object['object_number'] === objectNumber) ? loadedObject : object;
              });
            });
          });
        }
        else if (ev.metaKey) {
          // load in new window
          var url = $state.href('pdf.object.plain', {objectNumber: objectNumber});
          window.open(url, '_blank');
        }
        else {
          // load in this window
          $state.go('pdf.object.plain', {objectNumber: objectNumber});
        }
      });
    }
  };
});

app.controller('uploadCtrl', ($scope, $state, $flash) => {
  $scope.uploadFile = (dom_file, ev) => {
    File.upload(dom_file, (error, file) => {
      $state.go('pdf', {name: file.name});
    });
  };
});

app.controller('serverCtrl', ($scope) => {
  $scope.server = localStorage['server'] || 'localhost:8080';
  $scope.$watch('server', (server) => localStorage['server'] = server);
});

app.controller('selectorCtrl', ($scope, $state, $flash) => {
  File.query((error, files) => {
    $scope.$apply(() => {
      // this is dumb. apparently when rendering the select, angular doesn't check
      // for matches against an existing ng-model value?
      // it seems that angular.js 1.4 will fix this; see http://jsfiddle.net/z3wpa0ff/
      if (error) throw error;
      $scope.files = files;
      $scope.selected_file = {name: $state.params.name};
    });
  });

  $scope.select = selected_name => {
    $state.go('pdf.page', {name: selected_name, pageNumber: 1});
  };
});

app.controller('pdfCtrl', ($scope, $state, $flash) => {
  var file = $scope.file = new File($state.params.name);
  // $scope.pageNumber = $state.params.pageNumber;

  file.getPages((error, pages) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.pages = pages;
    });
  });
  file.get((error, result) => {
    $scope.$apply(() => {
      if (error) throw error;
      _.extend(file, result);
    });
  });

  $scope.openOnHost = () => {
    file.open((error, result) => {
      $scope.$apply(() => {
        if (error) throw error;
        $flash(result.message);
      });
    });
  };
});

app.controller('documentCtrl', ($scope) => {
  $scope.file.getDocument((error, paper: academia.types.Paper) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.paper = paper;
    });
  });
});

app.controller('citationsCtrl', ($scope) => {
  $scope.file.getDocument((error, paper: academia.types.Paper) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.paper = paper;
    });
  });

  $scope.$watch('paper', (paper: academia.types.Paper) => {
    if (paper === undefined) return;
    var body = paper.sections.filter(section => !section.title.match(/References/))
      .map(section => section.paragraphs.join('\n'))
      .join('\n');
    $scope.body = body.replace(academia.styles.acl.citeRegExp, (group0) => {
      return `<span class="citation">${group0}</span>`;
    });

    var referenceStrings = paper.sections.filter(section => !!section.title.match(/References/))
      .map(section => section.paragraphs)[0] || [];

    // use refactored logic from academia
    var references = academia.styles.acl.parseReferences(referenceStrings);
    var cites = academia.styles.acl.parseCites(body);
    academia.styles.acl.linkCites(cites, references);
    // link to view
    $scope.references = references;
    $scope.citations = cites;
  });
});

app.controller('objectCtrl', ($scope, $state) => {
  $scope.object_number = $state.params.objectNumber;

  $scope.file.getObject($state.params.objectNumber, (error, object) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.object = object;
    });
  });
});

app.controller('contentStreamCtrl', ($scope, $state) => {
  $scope.file.getContentStream($state.params.objectNumber, (error, result) => {
    $scope.$apply(() => {
      if (error) throw error;
      _.extend($scope, result);
    });
  });
});

app.controller('fontCtrl', ($scope, $state) => {
  $scope.file.getFont($state.params.objectNumber, (error, result) => {
    $scope.$apply(() => {
      if (error) throw error;
      _.extend($scope, result);
    });
  });
});

app.controller('graphicsCtrl', ($scope, $state, $localStorage) => {
  $scope.$storage = $localStorage;

  $scope.file.getGraphics($state.params.objectNumber, (error, result) => {
    $scope.$apply(() => {
      if (error) throw error;
      _.extend($scope, result);
    });
  });
});

app.controller('pageCtrl', ($scope, $state, $localStorage) => {
  $scope.$storage = $localStorage.$default({
    outline: false,
    scale: 1.0,
    minimumElementsPerLayoutComponent: 0,
  });
  $scope.pageNumber = $state.params.pageNumber;
  // keep the $watch below happy
  $scope.canvas = {layout: []};

  $scope.$watch('$storage.minimumElementsPerLayoutComponent', (minimum) => {
    $scope.excludedElements = $scope.canvas.layout
    .filter(container => container.elements.length < minimum)
    .map(container => container.elements.length)
    .reduce((a, b) => a + b, 0);
  });

  $scope.file.getPage($state.params.pageNumber, (error, page) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.canvas = page;
    });
  });
});

app.controller('pageContentsCtrl', ($scope, $state) => {
  $scope.pageNumber = $state.params.pageNumber;

  $scope.file.getPageContents($state.params.pageNumber, (error, page) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.page = page;
    });
  });
});
