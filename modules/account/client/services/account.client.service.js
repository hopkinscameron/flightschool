'use strict';

// set up the module
var accountServiceModule = angular.module('account.services');

// create the factory
accountServiceModule.factory('AccountFactory', ['$http', '$location', '$rootScope', function ($http, $location, $rootScope) {
    // set up the factory
    var factory = {};
    var appPath = ApplicationConfiguration.applicationBase + 'api';
    
    // gets account navigation
    factory.getAccountNavigation = function () {
        // set the endpoint
        var endpoint = appPath + '/account';

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

    // gets edit profile page information
    factory.getEditProfilePageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/edit-profile';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // updates profile
    factory.updateProfile = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/edit-profile';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'firstName': data.firstName,
            'lastName': data.lastName,
            'sex': data.sex.toLowerCase(),
            'phone': data.phone,
            'email': data.email
        });

        // send request
        return $http.put(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // gets change password page information
    factory.getChangePasswordPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/change-password';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // updates password
    factory.updatePassword = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/change-password';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'oldPassword': data.oldPassword,
            'newPassword': data.newPassword,
            'confirmedPassword': data.confirmedPassword
        });

        // send request
        return $http.put(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // gets hub page information
    factory.getHubPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/hub';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // updates hubs
    factory.updateHubs = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/hub';

        // stringify the data
        var dataStrigified = JSON.stringify({
            
        });

        // send request
        return $http.put(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // gets membership page information
    factory.getMembershipPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/membership';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // updates membership
    factory.updateMembership = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/membership';

        // stringify the data
        var dataStrigified = JSON.stringify({
            
        });

        // send request
        return $http.put(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // gets notifications page information
    factory.getNotificationsPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/notifications';

        // send request
        return $http.get(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // updates notification settings
    factory.updateNotifications = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/notifications';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'news': data.news,
            'reminderEmail': data.reminderEmail,
            'research': data.research,
            'reminderSMS': data.reminderSMS
        });

        // send request
        return $http.put(endpoint, dataStrigified, { 'ignoreLoadingBar': true }).then(function (response) {
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