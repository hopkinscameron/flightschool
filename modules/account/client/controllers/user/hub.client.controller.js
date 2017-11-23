﻿'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('HubController', ['$scope', '$rootScope', '$location', '$filter', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, $filter, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the max number of items in a query dropdown
    var maxDropdown = 10;

    // remove as main hub
    $scope.removeMainHub = function (hub) {
        // get the selected airport
        swal({
            type: 'question',
            title: 'Remove as main hub?',
            text: 'This will not delete your hub, just remove as main',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            showCancelButton: true,
            reverseButtons: true,
            buttonsStyling: false,
            focusConfirm: false,
            focusCancel: true
        }).then(function () {
            // add hub
            AccountFactory.upsertHub({ 'newHub': { 'iata': hub.iata, 'icao': hub.icao }, 'oldHub': { 'iata': hub.iata, 'icao': hub.icao } }).then(function (responseUH) {
                // if returned a valid response
                if(responseUH && !responseUH.error) {
                    swal({
                        type: 'success',
                        title: 'Removed as main',
                        timer: 3000
                    })
                    .then(function () {
                        // remove main hub
                        $scope.mainHub = undefined;
    
                        // force apply
                        $scope.$apply()
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // remove main hub
                        $scope.mainHub = undefined;
    
                        // force apply
                        $scope.$apply()
                    });
                }
                else {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseUH.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {},
                    // handling the promise rejection
                    function (dismiss) {});
                }
            })
            .catch(function (responseUH) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseUH.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {},
                // handling the promise rejection
                function (dismiss) {});
            });
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // add an additional hub
    $scope.addHub = function () {
        // holds the airport found
        var airport = null;

        // the possible airports (as objects)
        var airports = [];

        // the possible airports (as a dropdown name selection)
        var selectOptions = [];

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            reverseButtons: true,
            buttonsStyling: false,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if(value && value.length >= 2) {
                        // get possible airports
                        airports = getPossibleAirports(value);

                        // if array
                        if(airports.length > 0 && airports.length <= maxDropdown) {
                            // add each airpot
                            _.forEach(airports, function(value) {
                                selectOptions.push(value.name)
                            });

                            resolve();                    
                        }
                        else if(airports.length > maxDropdown) {
                            reject('Too many items. Please enter more to refine the search.');
                        }
                        else {
                            reject('No airports found.');
                        }
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                });
            },
            allowOutsideClick: false
        }).then(function () {
            // get the selected airport
            swal({
                title: 'Pick an airport',
                input: 'select',
                inputOptions: selectOptions,
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                reverseButtons: true,
                buttonsStyling: false,
                showCancelButton: true,
                showLoaderOnConfirm: true,
                inputPlaceholder: 'Select airport',
                inputValidator: function (value) {
                    return new Promise(function (resolve, reject) {
                        // if a value was selected
                        if (value.length > 0) {
                            var index = parseInt(value);
                            airport = airports[index];
                            resolve();
                        }
                        else {
                            reject('Please select an airport!');
                        }
                    });
                },
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        // get the selected airport
                        swal({
                            type: 'question',
                            title: 'Set as main hub?',
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                            reverseButtons: true,
                            buttonsStyling: false,
                            showCancelButton: true,
                            allowEscapeKey: false,
                            allowOutsideClick: false
                        }).then(function () {
                            // add hub
                            AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao, 'main': true } }).then(function (responseUH) {
                                // if returned a valid response
                                if(responseUH && !responseUH.error) {
                                    // set value
                                    airport = responseUH;

                                    // set new main hub
                                    $scope.mainHub = responseUH;

                                    resolve();
                                }
                                else {
                                    reject(responseUH.message);
                                }
                            })
                            .catch(function (responseUH) {
                                reject(responseUH.message);
                            });
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // add hub
                            AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao } }).then(function (responseUH) {
                                // if returned a valid response
                                if(responseUH && !responseUH.error) {
                                    // set value
                                    airport = responseUH;
                                    resolve();
                                }
                                else {
                                    reject(responseUH.message);
                                }
                            })
                            .catch(function (responseUH) {
                                reject(responseUH.message);
                            });
                        });
                    });
                }
            }).then(function () {
                swal({
                    type: 'success',
                    title: 'Hub added!',
                    timer: 3000
                })
                .then(function () {
                    // push new
                    $scope.hub.data.hubs.push(airport);

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
                    // push new
                    $scope.hub.data.hubs.push(airport);

                    // force apply
                    $scope.$apply()
                });
            },
            // handling the promise rejection
            function (dismiss) {});
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // edit hub
    $scope.editHub = function (hubIndex) {
        // holds the airport found
        var airport = null;

        // the possible airports (as objects)
        var airports = [];

        // the possible airports (as a dropdown name selection)
        var selectOptions = [];

        // determine if the deleted hub was the main hub
        var wasMain = $scope.hub.data.hubs[hubIndex].main;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            reverseButtons: true,
            buttonsStyling: false,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if(value && value.length >= 2) {
                        // get possible airports
                        airports = getPossibleAirports(value);

                        // if array
                        if(airports.length > 0 && airports.length <= maxDropdown) {
                            // add each airpot
                            _.forEach(airports, function(value) {
                                selectOptions.push(value.name)
                            });

                            resolve();                    
                        }
                        else if(airports.length > maxDropdown) {
                            reject('Too many items. Please enter more to refine the search.');
                        }
                        else {
                            reject('No airports found.');
                        }
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                });
            },
            allowOutsideClick: false
        }).then(function () {
            // get the selected airport
            swal({
                title: 'Pick an airport',
                input: 'select',
                inputOptions: selectOptions,
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                reverseButtons: true,
                buttonsStyling: false,
                showCancelButton: true,
                showLoaderOnConfirm: true,
                inputPlaceholder: 'Select airport',
                inputValidator: function (value) {
                        return new Promise(function (resolve, reject) {
                        // if a value was selected
                        if (value.length > 0) {
                            var index = parseInt(value);
                            airport = airports[index];
                            resolve();
                        }
                        else {
                            reject('Please select an airport!');
                        }
                    });
                },
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        // get the selected airport
                        swal({
                            type: 'question',
                            title: 'Set as main hub?',
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                            reverseButtons: true,
                            buttonsStyling: false,
                            showCancelButton: true,
                            allowEscapeKey: false,
                            allowOutsideClick: false
                        }).then(function () {
                            // add hub
                            AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao, 'main': true }, 'oldHub': { 'iata': $scope.hub.data.hubs[hubIndex].iata, 'icao': $scope.hub.data.hubs[hubIndex].icao } }).then(function (responseUH) {
                                // if returned a valid response
                                if(responseUH && !responseUH.error) {
                                    // set value
                                    airport = responseUH;

                                    // set new main hub
                                    $scope.mainHub = responseUH;

                                    resolve();
                                }
                                else {
                                    reject(responseUH.message);
                                }
                            })
                            .catch(function (responseUH) {
                                reject(responseUH.message);
                            });
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // add hub
                            AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao }, 'oldHub': { 'iata': $scope.hub.data.hubs[hubIndex].iata, 'icao': $scope.hub.data.hubs[hubIndex].icao } }).then(function (responseUH) {
                                // if returned a valid response
                                if(responseUH && !responseUH.error) {
                                    // set value
                                    airport = responseUH;

                                    // if this was the main hub
                                    if(wasMain) {
                                        // remove
                                        $scope.mainHub = undefined;
                                    }
                                    
                                    resolve();
                                }
                                else {
                                    reject(responseUH.message);
                                }
                            })
                            .catch(function (responseUH) {
                                reject(responseUH.message);
                            });
                        });
                    });
                }
            }).then(function () {
                swal({
                    type: 'success',
                    title: 'Hub updated!',
                    timer: 3000
                })
                .then(function () {
                    // update
                    $scope.hub.data.hubs[hubIndex] = airport;

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
                    // update
                    $scope.hub.data.hubs[hubIndex] = airport;

                    // force apply
                    $scope.$apply()
                });
            },
            // handling the promise rejection
            function (dismiss) {});
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // delete hub
    $scope.deleteHub = function (hubIndex) {
        swal({
            type: 'warning',
            title: 'Delete Hub',
            html: `Are you sure you want to delete <span class="font-weight-bold">${$scope.hub.data.hubs[hubIndex].name}</span>? You will not be able to revert this.`,
            showCancelButton: true,
            focusConfirm: false,
            focusCancel: true,
            confirmButtonText: 'Delete',
            confirmButtonClass: 'btn btn-danger btn-cursor-pointer',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            reverseButtons: true,
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // add hub
                    AccountFactory.deleteHub({ 'hub': { 'iata': $scope.hub.data.hubs[hubIndex].iata, 'icao': $scope.hub.data.hubs[hubIndex].icao } }).then(function (responseDH) {
                        // if returned a valid response
                        if(responseDH && !responseDH.error) {
                            resolve();
                        }
                        else {
                            reject(responseDH.message);
                        }
                    })
                    .catch(function (responseDH) {
                        reject(responseDH.message);
                    });
                });
            },
            allowOutsideClick: false
        }).then(function () {
            swal({
                type: 'success',
                title: 'Hub deleted!',
                timer: 3000
            })
            .then(function () {
                // determine if the deleted hub was the main hub
                var wasMain = $scope.hub.data.hubs[hubIndex].main;

                // delete
                $scope.hub.data.hubs.splice(hubIndex, 1);

                // if this was the main hub
                if(wasMain) {
                    // remove
                    $scope.mainHub = undefined;
                }

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // determine if the deleted hub was the main hub
                var wasMain = $scope.hub.data.hubs[hubIndex].main;
                
                // delete
                $scope.hub.data.hubs.splice(hubIndex, 1);

                // if this was the main hub
                if(wasMain) {
                    // remove
                    $scope.mainHub = undefined;
                }

                // force apply
                $scope.$apply()
            });
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.hub = {};

        // get hub page data
        AccountFactory.getHubPageInformation().then(function (responseH) {
            // if returned a valid response
            if (responseH && !responseH.error) {
                // set the data
                $scope.hub.data = responseH;
                $scope.hub.title = 'Hub';
                $scope.hub.pageHeader = $scope.hub.title;
                $scope.hub.pageSubHeader = 'Are your hubs looking okay?';

                // holds the page title
                $scope.pageTitle = $scope.hub.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // loop through all hubs and find the main hub
                _.forEach($scope.hub.data.hubs, function(value) {
                    // if main
                    if(value.main) {
                        $scope.mainHub = value;
                    }
                });

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseH.title;
                $scope.error.error = true;
                $scope.error.title = responseH.title;
                $scope.error.status = responseH.status;
                $scope.error.message = responseH.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseH) {
            // set error
            $scope.pageTitle = responseH.title;
            $scope.error.error = true;
            $scope.error.title = responseH.title;
            $scope.error.status = responseH.status;
            $scope.error.message = responseH.message;

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
            'pageHeader': _.cloneDeep($scope.hub.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.hub.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // find airports
    function getPossibleAirports(text) {
        return _.filter($rootScope.$root.airportCodes, function(o) { 
            var iata = o.iata.toLowerCase().includes(text.toLowerCase());
            var icao = o.iata.toLowerCase().includes(text.toLowerCase());
            var city = o.city.toLowerCase().includes(text.toLowerCase());
            var name = o.name.toLowerCase().includes(text.toLowerCase());
            return iata || icao || city || name; 
        });
    };
}]);