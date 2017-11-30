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
            'sex': data.sex,
            'phone': data.phone,
            'email': data.email
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

    // gets payment page information
    factory.getPaymentInformationPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/payment-information';

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

    // updates payment information
    factory.updatePaymentInformation= function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/payment-information';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'number': data.number,
            'expiration': data.expiration,
            'name': data.name,
            'ccv': data.ccv
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

    // adds/updates hub
    factory.upsertHub = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/hub/hubs';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'newHub': {
                'iata': data.newHub ? data.newHub.iata : '',
                'icao': data.newHub ? data.newHub.icao : '',
                'main': data.newHub ? data.newHub.main : undefined
            },
            'oldHub': {
                'iata': data.oldHub ? data.oldHub.iata : '',
                'icao': data.oldHub ? data.oldHub.icao : ''
            }
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

    // deletes hub
    factory.deleteHub = function (data) {
        // set airport values
        var iata = data.hub ? data.hub.iata : '';
        var icao = data.hub ? data.hub.icao : '';

        // set the endpoint
        var endpoint = appPath + `/account/hub/hubs?iata=${iata}&icao=${icao}`;

        // send request
        return $http.delete(endpoint, { 'ignoreLoadingBar': true }).then(function (response) {
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

    // gets airline preference page information
    factory.getAirlinePreferencesPageInformation = function () {
        // set the endpoint
        var endpoint = appPath + '/account/airline-preferences';

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

    // updates airline preference
    factory.updateAirlinePreferences = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/airline-preferences';

        // stringify the data
        var dataStrigified = JSON.stringify({
            'airlinePreferences': data.preferences,
            'airlineNonPreferences': data.nonPreferences
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
            'number': data.number,
            'expiration': data.expiration,
            'ccv': data.ccv,
            'tierId': data.tierId,
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

    // cancel membership
    factory.cancelMembership = function (data) {
        // set the endpoint
        var endpoint = appPath + '/account/membership';

        // send request
        return $http.delete(endpoint, null, { 'ignoreLoadingBar': true }).then(function (response) {
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
            'notificationNews': data.news,
            'notificationReminderEmail': data.reminderEmail,
            'notificationResearch': data.research,
            'notificationReminderSMS': data.reminderSMS
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