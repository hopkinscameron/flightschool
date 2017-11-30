'use strict';

// set up the module
var accountServiceModule = angular.module('account.services');

// create the factory
accountServiceModule.factory('TierFactory', ['$http', '$location', '$rootScope', function ($http, $location, $rootScope) {
    // set up the factory
    var factory = {};
    var appPath = ApplicationConfiguration.applicationBase + 'api';
    
    // gets the tiers
    factory.getTiers = function () {
        // set the endpoint
        var endpoint = appPath + '/tiers';

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
    
    return factory;
}]);