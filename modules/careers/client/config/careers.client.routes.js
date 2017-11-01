'use strict';

// set up the module
var careersRoutesModule = angular.module('careers.routes');

// configure the module
careersRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/careers', {
            templateUrl: '/modules/careers/client/views/careers.client.view.html'
        })
}]);