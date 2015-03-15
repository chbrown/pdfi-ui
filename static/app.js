/*jslint browser: true */ /*globals angular, _, React, components */
var app = angular.module('app', [
  'ngResource',
  'ngStorage',
  'ui.router',
  'misc-js/angular-plugins',
]);

var log = console.log.bind(console);
Error.stackTraceLimit = 50;

app.filter('keys', function() {
  return function(value) {
    if (value === undefined || value === null) return [];
    return Object.keys(value);
  };
});

app.filter('px', function() {
  return function(number) {
    return number.toFixed(2) + 'px';
  };
});

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise(function($injector, $location) {
    log('otherwise: coming from "%s"', $location.url());
    return '/pdfs';
  });

  $stateProvider
  .state('pdfs', {
    url: '/pdfs',
    templateUrl: '/static/ng/navigator.html',
  })
  .state('pdfs.show', {
    url: '/{name:[^/]+\.pdf}',
    templateUrl: '/static/ng/pdf.html',
    controller: 'pdfCtrl',
  })
  .state('pdfs.show.object', {
    url: '/objects/{number:int}',
    templateUrl: '/static/ng/object.html',
    controller: 'objectCtrl',
  })
  .state('pdfs.show.page', {
    url: '/pages/{index:int}',
    templateUrl: '/static/ng/page.html',
    controller: 'pageCtrl',
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

app.service('File', function($resource, $q, $http) {
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
  /**
  We don't want to use a $resource like FileObject, because some objects
  are natively arrays, and some are objects, and Angular doesn't like that,
  not one bit.
  */
  File.prototype.getObject = function(number) {
    return $http.get('/files/' + this.name + '/objects/' + number);
  };
  File.prototype.getPages = function() {
    return $http.get('/files/' + this.name + '/pages');
  };
  File.prototype.getPage = function(index) {
    return $http.get('/files/' + this.name + '/pages/' + index);
  };
  return File;
});

app.directive('pdfobject', function() {
  return {
    restrict: 'E',
    scope: {file: '=', object: '='},
    link: function(scope, el, attrs) {
      scope.$watch('object', function(object) {
        React.render(React.createElement(components.PDFObject, {file: scope.file, object: clean(object)}), el[0]);
      }, true);
    }
  };
});

app.directive('pdfpage', function() {
  return {
    restrict: 'E',
    scope: {file: '=', page: '='},
    link: function(scope, el, attrs) {
      React.render(React.createElement(components.PDFPage, scope), el[0]);
    }
  };
});

app.directive('pdfobjectreference', function() {
  return {
    restrict: 'E',
    scope: {file: '=', objectNumber: '=', generationNumber: '='},
    link: function(scope, el, attrs) {
      React.render(React.createElement(components.PDFObjectReference, scope), el[0]);
    }
  };
});

app.controller('uploadCtrl', function($scope, $state, $flash, File) {
  $scope.uploadFile = function(dom_file, ev) {
    var file = File.upload(dom_file);
    var promise = file.$promise.then(function() {
      $state.go('pdfs.show', {name: file.name});
      return 'Uploaded file';
    }, function(err) {
      return 'File error: ' + err.toString();
    });
    $flash(promise);
  };
});

app.controller('selectorCtrl', function($scope, $state, $flash, File) {
  $scope.files = File.query(function(value, responseHeaders) {
    // this is dumb. apparently when rendering the select, angular doesn't check
    // for matches against an existing ng-model value?
    // it seems that angular.js 1.4 will fix this; see http://jsfiddle.net/z3wpa0ff/
    $scope.selected_file = {name: $state.params.name};
  }, function(httpResponse) {
    $flash('Error loading files: ' + httpResponse.toString());
  });

  $scope.select = function(selected_name) {
    $state.go('pdfs.show', {name: selected_name});
  };
});

app.controller('pdfCtrl', function($scope, $state, File) {
  $scope.file = new File({name: $state.params.name});
  $scope.file.getPages().then(function(res) {
    $scope.pages = res.data;
  });

  $scope.file.$get();
});

app.controller('objectCtrl', function($scope, $state) {
  $scope.object_number = $state.params.number;

  $scope.file.getObject($state.params.number).then(function(res) {
    $scope.object = res.data;
  }, function(err) {
    log('error fetching object', err);
  });
});

app.controller('pageCtrl', function($scope, $state) {
  $scope.page_number = $state.params.index;
  $scope.file.getPage($state.params.index).then(function(res) {
    $scope.page = res.data;
  }, function(err) {
    log('error fetching page', err);
  });
});
