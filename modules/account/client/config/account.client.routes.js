'use strict';

// set up the module
var accountRoutesModule = angular.module('account.routes');

// configure the module
accountRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/account/edit', {
            templateUrl: '/modules/account/client/views/user/edit-profile.client.view.html',
            authenticated: true,
            role: 'user'
        })
        .when('/account/password', {
            templateUrl: '/modules/account/client/views/user/change-password.client.view.html',
            authenticated: true,
            role: 'user'
        })
        .when('/account/hubs', {
            templateUrl: '/modules/account/client/views/user/hubs.client.view.html',
            authenticated: true,
            role: 'user'
        })
        .when('/account/notifications', {
            templateUrl: '/modules/account/client/views/user/notification.client.view.html',
            authenticated: true,
            role: 'user'
        })
}]);