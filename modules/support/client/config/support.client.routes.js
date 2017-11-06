'use strict';

// set up the module
var supportRoutesModule = angular.module('support.routes');

// configure the module
supportRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/support/faq', {
            templateUrl: '/modules/support/client/views/faq.client.view.html'
        })
        .when('/support/contact', {
            templateUrl: '/modules/support/client/views/contact.client.view.html'
        })
}]);