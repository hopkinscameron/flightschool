'use strict';

// set up the module
var accountRoutesModule = angular.module('account.routes');

// configure the module
accountRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/account/edit', {
            templateUrl: '/modules/account/client/views/edit-profile.client.view.html'
        })
        .when('/account/password', {
            templateUrl: '/modules/account/client/views/change-password.client.view.html'
        })
        .when('/account/hubs', {
            templateUrl: '/modules/account/client/views/hubs.client.view.html'
        })
        .when('/account/notifications', {
            templateUrl: '/modules/account/client/views/notification.client.view.html'
        })
}]);