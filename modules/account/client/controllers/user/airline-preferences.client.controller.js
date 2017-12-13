'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('AirlinePreferencesController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the preferences form data
    $scope.preferencesForm = {
        'inputs': {
            'preferences': [],
            'nonPreferences': []
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'preferences': [],
            'nonPreferences': []
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // update preferences
    $scope.updateAirlinePreferences = function () {
        // check for any errors in the values
        checkErrorValues();

        // determines if error exists
        var errorExists = false;
        
        // go through preferences and check for error
        _.forEach($scope.preferencesForm.errors.preferences, function(value) {
            // if error
            if(value.isError) {
                errorExists = true;
                return;
            }
        });

        // if an error doesn't already exist
        if(!errorExists) {
            // go through preferences and check for error
            _.forEach($scope.preferencesForm.errors.nonPreferences, function(value) {
                // if error
                if(value.isError) {
                    errorExists = true;
                    return;
                }
            });
        }

        // check if an error exists
        if(!errorExists) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;
        
            // the data to send
            var preferencesData = {
                'preferences': [],
                'nonPreferences': []
            };

            // go through preferences/non preferences and add
            _.forEach($scope.preferencesForm.inputs.preferences, function(value) {
                // if value exists, add
                value.airline && value.airline.id ? preferencesData.preferences.push(value.airline.id) : null;
            });
            _.forEach($scope.preferencesForm.inputs.nonPreferences, function(value) {
                // if value exists, add
                value.airline && value.airline.id ? preferencesData.nonPreferences.push(value.airline.id) : null;
            });
    
            // update preferences
            AccountFactory.updateAirlinePreferences(preferencesData).then(function (responseUAP) {
                // if returned a valid response
                if(responseUAP && !responseUAP.error) {
                    // show success
                    swal({
                        title: 'Success!',
                        text: 'You have successfully updated your preferences.',
                        type: 'success',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show the form is no longer in transit
                        $scope.formInTransit = false;
    
                        // force apply
                        $scope.$apply()
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show the form is no longer in transit
                        $scope.formInTransit = false;
    
                        // force apply
                        $scope.$apply()               
                    });
                }
                else {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseUAP.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show the form is no longer in transit
                        $scope.formInTransit = false;
    
                        // force apply
                        $scope.$apply();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show the form is no longer in transit
                        $scope.formInTransit = false;
    
                        // force apply
                        $scope.$apply();                
                    });
                }
            })
            .catch(function (responseUAP) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseUAP.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show the form is no longer in transit
                    $scope.formInTransit = false;
    
                    // force apply
                    $scope.$apply();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show the form is no longer in transit
                    $scope.formInTransit = false;
    
                    // force apply
                    $scope.$apply();                
                });
            });
        }
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.preferences = {};

        // get preferences page data
        AccountFactory.getAirlinePreferencesPageInformation().then(function (responseN) {
            // if returned a valid response
            if (responseN && !responseN.error) {
                // set the data
                $scope.preferences.data = responseN;
                $scope.preferences.title = 'Airline Preferences';
                $scope.preferences.pageHeader = $scope.preferences.title;
                $scope.preferences.pageSubHeader = 'Let\'s manage these preferences!';

                // holds the page title
                $scope.pageTitle = $scope.preferences.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // set up form
                setUpForm($scope.preferences.data.maxPreferences, $scope.preferences.data.maxNonPreferences);

                // set form values
                for(var x = 0; x < $scope.preferences.data.airlinePreferences.length; x++) {
                    var airline = $scope.preferences.data.airlinePreferences[x];

                    // if there are enough options
                    if(x < $scope.preferencesForm.inputs.preferences.length) {
                        // if set value
                        $scope.preferencesForm.inputs.preferences[x].value = airline.name;
                        $scope.preferencesForm.inputs.preferences[x].airport = airline;
                    }
                }

                // set form values
                for(var x = 0; x < $scope.preferences.data.airlineNonPreferences.length; x++) {
                    var airline = $scope.preferences.data.airlineNonPreferences[x];

                    // if there are enough options
                    if(x < $scope.preferencesForm.inputs.nonPreferences.length) {
                        // if set value
                        $scope.preferencesForm.inputs.nonPreferences[x].value = airline.name;
                        $scope.preferencesForm.inputs.nonPreferences[x].airport = airline;
                    }
                }

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseN.title;
                $scope.error.error = true;
                $scope.error.title = responseN.title;
                $scope.error.status = responseN.status;
                $scope.error.message = responseN.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseN) {
            // set error
            $scope.pageTitle = responseN.title;
            $scope.error.error = true;
            $scope.error.title = responseN.title;
            $scope.error.status = responseN.status;
            $scope.error.message = responseN.message;

            // setup page
            setUpPage();
        });
    };

    // sets up the page
    function setUpPage() {
        // the data to send to the parent
        var data = {
            'error': _.cloneDeep($scope.error),
            'pageTitle': _.cloneDeep($scope.pageTitle),
            'pageHeader': _.cloneDeep($scope.preferences.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.preferences.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // sets up the form
    function setUpForm(allowedPreferences, allowedNonPreferences) {
        // add each preference
        for(var x = 0; x < allowedPreferences; x++) {
            // create, set and add the error
            var pe = {
                'isError': false,
                'message': 'You cannot have duplicate airlines',
                'optionalMessages': ['You cannot have duplicate airlines in your preferences', 'You cannot have the same preference as a non preference', 'Not a valid airline']
            };
            $scope.preferencesForm.errors.preferences.push(pe);

            // create, set and add the preference
            var p = { 'index': x, 'value': '', 'airline': null, 'error': $scope.preferencesForm.errors.preferences[x] };
            $scope.preferencesForm.inputs.preferences.push(p);
        }

        // add each non preference
        for(var x = 0; x < allowedNonPreferences; x++) {
            // create, set and add the error
            var npe = {
                'isError': false,
                'message': 'You cannot have duplicate airlines',
                'optionalMessages': ['You cannot have duplicate airlines in your non preferences', 'You cannot have the same non preference as a preference', 'Not a valid airline']
            };
            $scope.preferencesForm.errors.nonPreferences.push(npe);

            // create, set and add the preference
            var np = { 'index': x, 'value': '', 'airline': null, 'error': $scope.preferencesForm.errors.nonPreferences[x] };
            $scope.preferencesForm.inputs.nonPreferences.push(np);
        }
    };

    // checks for any errors in the values
    function checkErrorValues() {
        // check if any values are duplicates or non accepting text
        for(var x = 0; x < $scope.preferencesForm.inputs.preferences.length; x++) {
            // get the value
            var value = $scope.preferencesForm.inputs.preferences[x];

            // initialize the airline
            value.airline = null;

            // if not empty
            if(value.value && value.value != '') {
                // find the index
                var duplicateLocalIndex = _.findLastIndex($scope.preferencesForm.inputs.preferences, function(o) { return o.value == value.value && o.index != value.index; });
                var duplicateAdjacentIndex = _.findLastIndex($scope.preferencesForm.inputs.nonPreferences, function(o) { return o.value == value.value; });
                var airlineIndex = _.findIndex($rootScope.$root.airlines, { 'name': value.value });

                // if not a valid airline
                if(airlineIndex == -1) {
                    $scope.preferencesForm.errors.preferences[x].isError = true;
                    $scope.preferencesForm.errors.preferences[x].message = $scope.preferencesForm.errors.preferences[x].optionalMessages[2];
                }
                // if found an index in the non preference list
                else if(duplicateAdjacentIndex != -1) {
                    // set an error for both entries
                    $scope.preferencesForm.errors.preferences[x].isError = true;
                    $scope.preferencesForm.errors.nonPreferences[duplicateAdjacentIndex].isError = true;
                    $scope.preferencesForm.errors.preferences[x].message = $scope.preferencesForm.errors.preferences[x].optionalMessages[1];
                    $scope.preferencesForm.errors.nonPreferences[duplicateAdjacentIndex].message = $scope.preferencesForm.errors.nonPreferences[duplicateAdjacentIndex].optionalMessages[1];
                }
                // if found an index and index is not this current iteration index
                else if(duplicateLocalIndex != -1 && duplicateLocalIndex != x) {
                    // set an error for both entries
                    $scope.preferencesForm.errors.preferences[x].isError = true;
                    $scope.preferencesForm.errors.preferences[duplicateLocalIndex].isError = true;
                    $scope.preferencesForm.errors.preferences[x].message = $scope.preferencesForm.errors.preferences[x].optionalMessages[0];
                    $scope.preferencesForm.errors.preferences[duplicateLocalIndex].message = $scope.preferencesForm.errors.preferences[duplicateLocalIndex].optionalMessages[0];
                }
                else {
                    $scope.preferencesForm.errors.preferences[x].isError = false;
                    $scope.preferencesForm.errors.preferences[x].message = $scope.preferencesForm.errors.preferences[x].optionalMessages[0];
                    
                    // set the airline
                    value.airline = _.cloneDeep($rootScope.$root.airlines[airlineIndex]);
                }
            }
            else {
                $scope.preferencesForm.errors.preferences[x].isError = false;
                $scope.preferencesForm.errors.preferences[x].message = $scope.preferencesForm.errors.preferences[x].optionalMessages[0];
            }
        }
        for(var x = 0; x < $scope.preferencesForm.inputs.nonPreferences.length; x++) {
            // get the value
            var value = $scope.preferencesForm.inputs.nonPreferences[x];

            // initialize the airline
            value.airline = null;

            // if not empty
            if(value.value && value.value != '') {
                // find the index
                var duplicateLocalIndex = _.findLastIndex($scope.preferencesForm.inputs.nonPreferences, function(o) { return o.value == value.value && o.index != value.index; });
                var duplicateAdjacentIndex = _.findLastIndex($scope.preferencesForm.inputs.nonPreferences, function(o) { return o.value == value.value; });
                var airlineIndex = _.findIndex($rootScope.$root.airlines, { 'name': value.value });

                // if not a valid airline
                if(airlineIndex == -1) {
                    $scope.preferencesForm.errors.nonPreferences[x].isError = true;
                    $scope.preferencesForm.errors.nonPreferences[x].message = $scope.preferencesForm.errors.nonPreferences[x].optionalMessages[2];
                }
                // if found an index in the preference list
                else if(duplicateAdjacentIndex != -1) {
                    // set an error for both entries
                    $scope.preferencesForm.errors.nonPreferences[x].isError = true;
                    $scope.preferencesForm.errors.preferences[duplicateAdjacentIndex].isError = true;
                    $scope.preferencesForm.errors.nonPreferences[x].message = $scope.preferencesForm.errors.nonPreferences[x].optionalMessages[1];
                    $scope.preferencesForm.errors.preferences[duplicateAdjacentIndex].message = $scope.preferencesForm.errors.preferences[duplicateAdjacentIndex].optionalMessages[1];
                }
                // if found an index and index is not this current iteration index
                else if(duplicateLocalIndex != -1 && duplicateLocalIndex != x) {
                    // set an error for both entries
                    $scope.preferencesForm.errors.nonPreferences[x].isError = true;
                    $scope.preferencesForm.errors.nonPreferences[duplicateLocalIndex].isError = true;
                    $scope.preferencesForm.errors.nonPreferences[x].message = $scope.preferencesForm.errors.nonPreferences[x].optionalMessages[0];
                    $scope.preferencesForm.errors.nonPreferences[duplicateLocalIndex].message = $scope.preferencesForm.errors.nonPreferences[duplicateLocalIndex].optionalMessages[0];
                }
                else {
                    $scope.preferencesForm.errors.nonPreferences[x].isError = false;
                    $scope.preferencesForm.errors.nonPreferences[x].message = $scope.preferencesForm.errors.nonPreferences[x].optionalMessages[0];

                    // set the airline
                    value.airline = _.cloneDeep($rootScope.$root.airlines[airlineIndex]);
                }
            }
            else {
                $scope.preferencesForm.errors.nonPreferences[x].isError = false;
                $scope.preferencesForm.errors.nonPreferences[x].message = $scope.preferencesForm.errors.nonPreferences[x].optionalMessages[0];
            }
        }
    };
}]);