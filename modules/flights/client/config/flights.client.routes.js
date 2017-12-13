'use strict';

// set up the module
var flightsRoutesModule = angular.module('flights.routes');

// configure the module
flightsRoutesModule.config(['$routeProvider', function($routeProvider) {
    // set up the routes
    $routeProvider
        .when('/flights', {
            templateUrl: '/modules/flights/client/views/user/flights.client.view.html'
        })
}]);