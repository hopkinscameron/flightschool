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
            templateUrl: '/modules/account/client/views/user/account.client.view.html',
            authenticated: true,
            role: 'user'
        })
}]);