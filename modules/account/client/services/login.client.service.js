'use strict'

// set up the module
var accountServiceModule = angular.module('account.services');

// create the factory
accountServiceModule.factory('LoginFactory', ['$http', '$location', '$rootScope', function ($http, $location, $rootScope) {
    // set up the factory
    var factory = {};
    var appPath = ApplicationConfiguration.applicationBase + 'api';

    // checks if user is logged in
    factory.isUserLoggedIn = function () {
        // set the endpoint
        var endpoint = appPath + '/login';

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

    // login
    factory.login = function (credentials) {
        // set the endpoint
        var endpoint = appPath + '/login';

        // stringify the login data
        var loginStrigified = JSON.stringify({
            'email': credentials.email,
            'password': credentials.password
        });

        // send request
        return $http.post(endpoint, loginStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // signUp
    factory.signUp = function (credentials) {
        // set the endpoint
        var endpoint = appPath + '/signup';

        // stringify the sign up data
        var signUpStrigified = JSON.stringify({
            'firstName': credentials.firstName,
            'lastName': credentials.lastName,
            'email': credentials.email,
            'password': credentials.password
        });

        // send request
        return $http.post(endpoint, signUpStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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