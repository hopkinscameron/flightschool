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
        // holds the from/to locations
        var from = '';
        var to = '';

        // if depart
        if(data.depart) {
            from = data.depart.iata ? data.depart.iata : data.depart.icao;
        }

        // if arrive
        if(data.arrive) {
            to = data.arrive.iata ? data.arrive.iata : data.arrive.icao;
        }

        // holds the from/to date
        var fromDate = $rootScope.$root.formatDate($rootScope.$root.dateSkyPicker, data.departDate);
        var toDate = $rootScope.$root.formatDate($rootScope.$root.dateSkyPicker, data.departDate);

        // holds the preferred/non preferred airlines
        var preferredAirlines = '';
        var nonPreferredAirlines = '';

        // go through all preferred/non preferred airlines
        var pos = 0;
        _.forEach(data.preferredAirlines, function(value) {
            pos == 0 ? preferredAirlines += value : preferredAirlines += ',' + value;
            pos++;
        });
        pos = 0;
        _.forEach(data.nonPreferredAirlines, function(value) {
            pos == 0 ? nonPreferredAirlines += value : nonPreferredAirlines += ',' + value;
            pos++;
        });

        // set the endpoint
        var endpoint = `https://api.skypicker.com/flights?flyFrom=${from}&to=${to}&dateFrom=${fromDate}&dateTo=${toDate}&typeFlight=${data.typeFlight}&adults=${data.adults}&directFlights=${data.nonStop}&partner=picky&partner_market=us&curr=USD&selectedAirlines=${preferredAirlines}`; //&limit=10

        // the configuration for the http call
        var config = {
            'ignoreLoadingBar': true,
            'headers' : {
                'Access-Control-Max-Age': undefined
            }
        };

        // send request
        return $http.get(endpoint, config).then(function (response) {
            return response.data;
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

    // gets airlines
    factory.getAirlines = function () {
        // set the endpoint
        var endpoint = 'https://api.skypicker.com/airlines?';

        // the configuration for the http call
        var config = {
            'ignoreLoadingBar': true,
            'headers' : {
                'Access-Control-Max-Age': undefined
            }
        };

        // send request
        return $http.get(endpoint, config).then(function (response) {
            return response.data;
        })
        .catch(function (response) {
            // attempt to get local airline config
            
            // set the endpoint
            var endpoint = '/lib/airlines/airlines.json';

            // send request
            return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
                return response.data;
            })
            .catch(function (response) {
                // if the response was sent back with the custom data response
                if(response.data) {
                    return { 'error': true, 'title': response.data.title, 'status': response.status, 'message': response.data.message };
                }

                // return default response
                return { 'error': true, 'title': $rootScope.$root.generalStatusError, 'status': response.status, 'message': response.xhrStatus };
            });
        });
    };

    // gets airports
    factory.getAirports = function () {
        // set the endpoint
        var endpoint = '/lib/airport-codes/airports.json';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
            return response.data;
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