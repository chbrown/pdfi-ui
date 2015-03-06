/*jslint browser: true */ /*globals angular, _, React, components */
var app = angular.module('app', [
  'ngResource',
  'ngStorage',
  'misc-js/angular-plugins',
]);

var log = console.log.bind(console);
Error.stackTraceLimit = 50;

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

// app.service('FileObject', function($resource) {
//   return $resource('/files/:name/objects/:number', {
//     name: '@name',
//     number: '@number',
//   });
// });



app.directive('pdfobject', function() {
  return {
    restrict: 'E',
    scope: {
      object: '=',
    },
    link: function(scope, el, attrs) {
      var container = el[0];

      var emit = scope.$emit.bind(scope);
      var props = {emit: emit};
      var react_component = React.render(React.createElement(components.PDFObject, props), container);

      scope.$watch('object', function(object) {
        react_component.setProps({object: angular.copy(object)});
      });
    }
  };
});

app.controller('uploadCtrl', function($scope, $http, $localStorage, $flash, File) {
  $scope.files = File.query(function(value, responseHeaders) {
    // this is dumb. apparently when rendering the select, angular doesn't check
    // for matches against an existing ng-model value?
    // it seems that angular.js 1.4 will fix this; see http://jsfiddle.net/z3wpa0ff/
    $scope.$storage = $localStorage;
  }, function(httpResponse) {
    $flash('Error loading files: ' + httpResponse.toString());
  });

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

app.controller('structureCtrl', function($scope, $localStorage, $http, File, Page) {
  $scope.$storage = $localStorage.$default({breadcrumbs: []});

  $scope.$on('loadObject', function(event, reference) {
    // $scope.loadObject(reference);
    // scope.object = FileObject.get({name: scope.name, number: scope.objectNumber});
    $scope.addBreadcrumb(reference);
    $scope.selected_reference = reference;
    var object_url = '/files/' + $scope.file.name + '/objects/' + reference.object_number;
    $http.get(object_url).then(function(res) {
      $scope.selected_object = res.data;
    }, function(err) {
      log('error fetching object', err);
    });
  });

  $scope.addBreadcrumb = function(reference) {
    var breadcrumbs = $scope.$storage.breadcrumbs;
    var exists = _.find(breadcrumbs, reference);
    if (!exists) {
      breadcrumbs.push(reference);
      $scope.$storage.breadcrumbs = breadcrumbs.slice(-10);
    }
  };

  $scope.$watch('$storage.selected_name', function(newVal, oldVal) {
    $scope.file = File.get({name: newVal});
    $scope.pages = Page.query({name: newVal});
    if (newVal != oldVal) {
      $scope.$storage.breadcrumbs.length = 0;
    }
    // function() {
      // $scope.loadObject($scope.file.trailer.Root);
    // });
  });
});
