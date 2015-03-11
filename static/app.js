/*jslint browser: true */ /*globals angular, _, React, components */
var app = angular.module('app', [
  'ngResource',
  'ngStorage',
  'ui.router',
  'misc-js/angular-plugins',
]);

var log = console.log.bind(console);
Error.stackTraceLimit = 50;

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise(function($injector, $location) {
    console.log('otherwise coming from: %s', $location.url());
    return '/pdfs';
  });

  $stateProvider
  .state('pdfs', {
    url: '/pdfs',
    templateUrl: '/static/ng/pdfs.html',

  })
  .state('pdfs.show', {
    url: '/:name',
    templateUrl: '/static/ng/pdf.html',
  })
  .state('pdfs.show.object', {
    url: '/:number',
    templateUrl: '/static/ng/object.html',
    // controller: 'objectCtrl',
  });

  $locationProvider.html5Mode(true);
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

function uploadFile(url, file, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onerror = function(error) {
    callback(error);
  };
  xhr.onload = function(event) {
    if (xhr.status >= 300) {
      var error = new Error(xhr.responseText);
      return callback(error);
    }

    var body = xhr.responseText;
    var content_type = xhr.getResponseHeader('content-type');
    if (content_type.match(/application\/json/)) {
      // body = body.replace(/^\)\]\}',/, '');
      body = JSON.parse(body);
    }
    callback(null, body);
  };

  var form = new FormData();
  form.append('file', file, file.name);
  xhr.send(form);
}

app.service('File', function($resource, $q) {
  var File = $resource('/files/:name', {
    name: '@name',
  }, {
    objects: {
      method: 'GET',
    },
  });
  File.upload = function(dom_file) {
    var file = new File();
    file.$resolved = false;
    file.$promise = $q(function(resolve, reject) {
      uploadFile('/files', dom_file, function(err, data) {
        angular.extend(file, data);
        file.$resolved = true;
        return err ? reject(err) : resolve(data);
      });
    });
    return file;
  };
  // File.prototype.objects;
  return File;
});

app.service('Page', function($resource) {
  return $resource('/files/:name/pages/:index', {
    name: '@name',
    index: '@index',
  });
});

app.service('FileObject', function($resource) {
  return $resource('/files/:name/objects/:number', {
    name: '@name',
    number: '@number',
  });
});

app.directive('pdfobject', function() {
  return {
    restrict: 'E',
    scope: {
      object: '=',
    },
    link: function(scope, el, attrs) {
      var container = el[0];
      var emit = scope.$emit.bind(scope);

      scope.$watch('object', function(object) {
        object = clean(object);
        React.render(React.createElement(components.PDFObject, {emit: emit, object: object}), container);
      }, true);
    }
  };
});

app.controller('uploadCtrl', function($scope, $state, $localStorage, $flash, File) {
  $scope.files = File.query(function(value, responseHeaders) {
    // this is dumb. apparently when rendering the select, angular doesn't check
    // for matches against an existing ng-model value?
    // it seems that angular.js 1.4 will fix this; see http://jsfiddle.net/z3wpa0ff/
    $scope.selected_name = $state.params.name;
  }, function(httpResponse) {
    $flash('Error loading files: ' + httpResponse.toString());
  });

  $scope.select = function(selected_name) {
    $state.go('pdfs.show', {name: selected_name});
  };

  $scope.uploadFile = function(dom_file, ev) {
    var file = File.upload(dom_file);
    var promise = file.$promise.then(function() {
      $scope.$storage.selected_name = file.name;
        return 'Uploaded file';
    }, function(err) {
      return 'File error: ' + err.toString();
    });
    $flash(promise);
  };
});

app.controller('structureCtrl', function($scope, $state, $localStorage, $http, File, Page) {
  $scope.$storage = $localStorage.$default({breadcrumbs: []});

  $scope.$on('loadObject', function(event, reference) {
    // $scope.addBreadcrumb(reference);
    $state.go('pdfs.show.object', {number: reference.object_number});
  });

  // $scope.$storage.breadcrumbs.length = 0;
  // $scope.addBreadcrumb = function(reference) {
  //   var breadcrumbs = $scope.$storage.breadcrumbs;
  //   var exists = _.find(breadcrumbs, reference);
  //   if (!exists) {
  //     breadcrumbs.push(reference);
  //     $scope.$storage.breadcrumbs = breadcrumbs.slice(-10);
  //   }
  // };

  $scope.file = File.get({name: $state.params.name});
  $scope.pages = Page.query({name: $state.params.name});
});

app.controller('objectCtrl', function($scope, $state, FileObject) {
  $scope.object_number = $state.params.number;
  $scope.object = FileObject.get({name: $state.params.name, number: $state.params.number});
});
