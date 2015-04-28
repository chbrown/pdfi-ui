/// <reference path="type_declarations/index.d.ts" />
import _ = require('lodash');

// can't import non-modules with `import * as xyz from './xyz'` syntax
import h = require('virtual-dom/h');
import create = require('virtual-dom/create-element');
import diff = require('virtual-dom/diff');
import patch = require('virtual-dom/patch');

import {Request} from './request';
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

app.factory('httpFlashInterceptor', function($q, $flash) {
  return {
   responseError: function(rejection) {
      log('httpInterceptor#responseError', rejection);
      var http_request = rejection.config.method + ' ' + rejection.config.url;
      var message = http_request + ' error: ' + rejection.data;
      $flash(message, 15000);
      return $q.reject(rejection);
    }
  };
});

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('httpFlashInterceptor');
});

app.filter('keys', function() {
  return function(value) {
    if (value === undefined || value === null) return [];
    return Object.keys(value);
  };
});

function px(number) {
  return number.toFixed(2) + 'px';
}
app.filter('px', function() { return px; });

function rectStyle(rect) {
  if (rect === null) return rect;
  return {
    left: px(rect.minX),
    top: px(rect.minY),
    width: px(rect.maxX - rect.minX),
    height: px(rect.maxY - rect.minY),
  };
}
app.filter('rectStyle', function() { return rectStyle; });

function formatRectangle(rectangle) {
  if (rectangle === null) return rectangle;
  var point_string = '(' + rectangle.minX.toFixed(3) + ',' + rectangle.minY.toFixed(3) + ')';
  var size_string = '(' + (rectangle.maxX - rectangle.minX).toFixed(3) + 'x' + (rectangle.maxY - rectangle.minY).toFixed(3) + ')';
  return point_string + ' ' + size_string;
}
app.filter('rectString', function() { return formatRectangle; });

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise(function($injector, $location) {
    log('otherwise: coming from "%s"', $location.url());
    return '/pdfs';
  });

  $stateProvider
  .state('pdfs', {
    url: '/pdfs',
    templateUrl: '/templates/navigator.html',
  })
  .state('pdfs.show', {
    url: '/{name:[^/]+\.pdf}',
    templateUrl: '/templates/pdf.html',
    controller: 'pdfCtrl',
  })
  .state('pdfs.show.document', {
    url: '/document',
    templateUrl: '/templates/document.html',
    controller: 'documentCtrl',
  })
  .state('pdfs.show.object', {
    url: '/objects/{number:int}',
    templateUrl: '/templates/object.html',
    controller: 'objectCtrl',
  })
  .state('pdfs.show.object_extra', {
    url: '/objects/{number:int}/extra',
    templateUrl: '/templates/object_extra.html',
    controller: 'objectExtraCtrl',
  })
  .state('pdfs.show.page', {
    url: '/pages/{page_number:int}',
    templateUrl: '/templates/page.html',
    controller: 'pageCtrl',
  })
  .state('pdfs.show.page_contents', {
    url: '/pages/{page_number:int}/contents',
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
    object = object.toJSON();
  }
  else {
    object = angular.copy(object);
  }

  return object;
}

app.directive('component', () => {
  return {
    restrict: 'E',
    scope: {
      name: '@',
      model: '=',
    },
    link: function(scope, el) {
      var ComponentViewCtrl: typeof components.ViewController = components[scope['name']];
      var view_manager = new components.ViewManager(el[0], model => {
        var vtree = new ComponentViewCtrl(model).render();
        return vtree;
      });
      scope.$watch('model', function() {
        console.log('component model changed');
        view_manager.update(clean(scope['model']));
      }, true);
    }
  };
});

app.controller('uploadCtrl', ($scope, $state, $flash) => {
  $scope.uploadFile = function(dom_file, ev) {
    File.upload(dom_file, function(error, file) {
      $state.go('pdfs.show', {name: file.name});
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
      if (error) {
        throw error;
      }
      $scope.files = files;
      $scope.selected_file = {name: $state.params.name};
    });
  });

  $scope.select = function(selected_name) {
    $state.go('pdfs.show.page', {name: selected_name, page_number: 1});
  };
});

app.controller('pdfCtrl', ($scope, $state) => {
  $scope.file = new File($state.params.name);

  $scope.file.getPages((error, pages) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.pages = pages;
    });
  });

  // $scope.file.$get();
});

app.controller('documentCtrl', ($scope) => {
  $scope.file.getDocument((error, document) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.document = document;
    });
  });
});

app.controller('objectCtrl', ($scope, $state) => {
  $scope.object_number = $state.params.number;

  $scope.file.getObject($state.params.number, (error, object) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.object = object;
    });
  });
});

app.controller('objectExtraCtrl', ($scope, $state) => {
  $scope.object_number = $state.params.number;

  $scope.file.getObjectExtra($state.params.number, (error, object) => {
    $scope.$apply(() => {
      if (error) throw error;
      _.extend($scope, object);
    });
  });
});

app.controller('pageCtrl', ($scope, $state, $localStorage) => {
  $scope.$storage = $localStorage.$default({outline: false, scale: 1.0});
  $scope.page_number = $state.params.page_number;

  $scope.file.getPage($state.params.page_number, (error, page) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.page = page;
    });
  });
});

app.controller('pageContentsCtrl', ($scope, $state) => {
  $scope.page_number = $state.params.page_number;

  $scope.file.getPageContents($state.params.page_number, (error, page) => {
    $scope.$apply(() => {
      if (error) throw error;
      $scope.page = page;
    });
  });
});
