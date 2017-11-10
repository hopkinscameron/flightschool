'use strict';

// set up the module
var accountRoutesModule = angular.module('account.routes');

// configure the module
accountRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/signup', {
            templateUrl: '/modules/account/client/views/sign-up.client.view.html'
        })
        .when('/forgotpassword', {
            templateUrl: '/modules/account/client/views/forgot-password.client.view.html'
        })
        .when('/logout', {
            templateUrl: '/modules/account/client/views/logout.client.view.html'
        })
        .when('/account/:section', {
            templateUrl: '/modules/account/client/views/user/account.client.view.html'/*,
            authenticated: true,
            role: 'user'*/
        })
        /*
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
            templateUrl: '/modules/account/client/views/user/hub.client.view.html',
            authenticated: true,
            role: 'user'
        })
        .when('/account/notifications', {
            templateUrl: '/modules/account/client/views/user/notifications.client.view.html',
            authenticated: true,
            role: 'user'
        })*/
}]);