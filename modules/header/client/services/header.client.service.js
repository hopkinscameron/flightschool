'use strict'

// set up the module
var headerServiceModule = angular.module('header.services');

// create the factory
headerServiceModule.factory('HeaderFactory', ['$http', '$location', '$rootScope', function ($http, $location, $rootScope) {
    // set up the factory
    var factory = {};
    var appPath = ApplicationConfiguration.applicationBase + 'api';

    // gets header information 
    factory.getHeaderInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/header';

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

    // gets timezone information
    factory.getTimeZoneInformation = function (data) {
        // set the endpoint
        var endpoint = `https://maps.googleapis.com/maps/api/timezone/json?location=${data.lat},${data.long}&timestamp=${data.timestamp}&key=${$rootScope.$root.timeZoneKey}`;
        
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

    return factory;
}]);