'use strict';

// set up the module
var aboutRoutesModule = angular.module('about.routes');

// configure the module
aboutRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/about', {
            templateUrl: '/modules/about/client/views/about.client.view.html'
        })
        .when('/about/privacy', {
            templateUrl: '/modules/about/client/views/privacy.client.view.html'
        })
        .when('/about/terms-and-conditions', {
            templateUrl: '/modules/about/client/views/terms.client.view.html'
        })
}]);