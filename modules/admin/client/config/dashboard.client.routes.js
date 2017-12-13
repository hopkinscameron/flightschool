'use strict';

// set up the module
var adminRoutesModule = angular.module('admin.routes');

// configure the module
adminRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/admin/dashboard', {
            templateUrl: '/modules/dashboard/client/views/admin/dashboard.client.view.html',
            authenticated: true,
            role: 'admin'
        })
}]);