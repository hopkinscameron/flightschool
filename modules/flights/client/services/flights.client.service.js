'use strict';

// set up the module
var flightsServiceModule = angular.module('flights.services');

// create the factory
flightsServiceModule.factory('FlightsFactory', ['$http', '$location', '$rootScope', function ($http, $location, $rootScope) {
    // set up the factory
    var factory = {};
    var appPath = ApplicationConfiguration.applicationBase + 'api';
    
    // gets flights page information 
    factory.getFlightsPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/flights';

        // create request
        var req = {
            method: 'GET',
            url: endpoint,
            data: undefined
        };

        // send request
        return $http(req).then(function (response) {
            return response.data.d;
        })
        .catch(function (response) {
            // if the response was sent back with the custom data response
            if(response.data) {
                return { 'error': true, 'title': response.data.title, 'status': response.status, 'message': response.data.message };
            }

            // return default response
            return { 'error': true, 'title': $rootScope.$root.generalStatusError, 'status': response.status, 'message': response.xhrStatus };
        });
    };

    // gets flights
    factory.getFlights = function (data) {
        // set the endpoint
        var endpoint = appPath + '/flights';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'depart': data.depart,
            'arrive': data.arrive,
            'departDate': data.departDate,
            'returnDate': data.returnDate,
            'adults': data.adults
        });

        // send request
        return $http.post(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
            return response.data.d;
        })
        .catch(function (response) {
            // if the response was sent back with the custom data response
            if(response.data) {
                return { 'error': true, 'title': response.data.title, 'status': response.status, 'message': response.data.message };
            }

            // return default response
            return { 'error': true, 'title': $rootScope.$root.generalStatusError, 'status': response.status, 'message': response.xhrStatus };
        });
    };

    return factory;
}]);