'use strict';

// set up the module
var tripsRoutesModule = angular.module('trips.routes');

// configure the module
tripsRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/upcoming-trips', {
            templateUrl: '/modules/trips/client/views/user/trips.client.view.html',
            authenticated: true,
            role: 'user'
        })
}]);