'use strict';

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

    // edit home location
    $scope.editHomeLocation = function () {
        // holds the home location found
        var airport = null;
        
        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if(value && value.length >= 2) {
                        // get possible airports
                        var airports = getPossibleAirports(value);

                        // if array
                        if(airports.length > 0 && airports.length <= maxDropdown) {
                            // the options
                            var selectOptions = [];
                            
                            // add each airpot
                            _.forEach(airports, function(value) {
                                selectOptions.push(value.name)
                            });

                            // get the selected airport
                            swal({
                                title: 'Pick an airport',
                                input: 'select',
                                inputOptions: selectOptions,
                                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                                cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                buttonsStyling: false,
                                showCancelButton: true,
                                inputPlaceholder: 'Select airport',
                                inputValidator: function (value) {
                                    // if a value was selected
                                    if (value.length > 0) {
                                        var index = parseInt(value);
                                        airport = airports[index];
                                    } 
                                    
                                    resolve();
                                }
                            });                          
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
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // update home location
                    AccountFactory.updateHubHome({ 'homeLocation': { 'iata': airport.iata, 'icao': airport.icao } }).then(function (responseUH) {
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
            },
            allowOutsideClick: false
        }).then(function () {
            swal({
                type: 'success',
                title: 'Home location set!',
                timer: 3000
            })
            .then(function () {
                // set location and save
                $scope.hub.data.homeLocation = airport;

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // set location and save
                $scope.hub.data.homeLocation = airport;

                // force apply
                $scope.$apply()
            });
        });
    };

    // add an additional hub
    $scope.addHub = function () {
        // holds the airport found
        var airport = null;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false,
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if(value && value.length >= 2) {
                        // get possible airports
                        var airports = getPossibleAirports(value);

                        // if array
                        if(airports.length > 0 && airports.length <= maxDropdown) {
                            // the options
                            var selectOptions = [];
                            
                            // add each airpot
                            _.forEach(airports, function(value) {
                                selectOptions.push(value.name)
                            });

                            // get the selected airport
                            swal({
                                title: 'Pick an airport',
                                input: 'select',
                                inputOptions: selectOptions,
                                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                                cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                buttonsStyling: false,
                                showCancelButton: true,
                                inputPlaceholder: 'Select airport',
                                inputValidator: function (value) {
                                    // if a value was selected
                                    if (value.length > 0) {
                                        var index = parseInt(value);
                                        airport = airports[index];
                                    } 
                                    
                                    resolve();
                                }
                            });                         
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
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
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
            },
            allowOutsideClick: false
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
        });
    };

    // edit hub
    $scope.editHub = function (hubIndex) {
        // holds the airport found
        var airport = null;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false,
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if(value && value.length >= 2) {
                        // get possible airports
                        var airports = getPossibleAirports(value);

                        // if array
                        if(airports.length > 0 && airports.length <= maxDropdown) {
                            // the options
                            var selectOptions = [];
                            
                            // add each airpot
                            _.forEach(airports, function(value) {
                                selectOptions.push(value.name)
                            });

                            // get the selected airport
                            swal({
                                title: 'Pick an airport',
                                input: 'select',
                                inputOptions: selectOptions,
                                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
                                cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                buttonsStyling: false,
                                showCancelButton: true,
                                inputPlaceholder: 'Select airport',
                                inputValidator: function (value) {
                                    // if a value was selected
                                    if (value.length > 0) {
                                        var index = parseInt(value);
                                        airport = airports[index];
                                    } 
                                    
                                    resolve();
                                }
                            });                          
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
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // add hub
                    AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao }, 'oldHub': { 'iata': $scope.hub.data.hubs[hubIndex].iata, 'icao': $scope.hub.data.hubs[hubIndex].icao } }).then(function (responseUH) {
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
            },
            allowOutsideClick: false
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
        });
    };

    // delete hub
    $scope.deleteHub = function (hubIndex) {
        swal({
            type: 'warning',
            title: 'Delete Hub',
            text: `Are you sure you want to delete ${$scope.hub.data.hubs[hubIndex].name}? You will not be able to revert this.`,
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonClass: 'btn btn-danger btn-cursor-pointer mr-2',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
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
                // delete
                $scope.hub.data.hubs.splice(hubIndex, 1);

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // delete
                $scope.hub.data.hubs.splice(hubIndex, 1);

                // force apply
                $scope.$apply()
            });
        });
    };

    // updae the search
    $scope.updateSearch = function() {
        $scope.searchText = $("#swal-input1").val();
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.hub = {};

        // get hub page data
        AccountFactory.getHubPageInformation().then(function (responseCP) {
            // if returned a valid response
            if (responseCP && !responseCP.error) {
                // set the data
                $scope.hub.data = responseCP;
                $scope.hub.title = 'Hub';
                $scope.hub.pageHeader = $scope.hub.title;
                $scope.hub.pageSubHeader = 'Are your hubs looking okay?';

                // holds the page title
                $scope.pageTitle = $scope.hub.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseCP.title;
                $scope.error.error = true;
                $scope.error.title = responseCP.title;
                $scope.error.status = responseCP.status;
                $scope.error.message = responseCP.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseCP) {
            // set error
            $scope.pageTitle = responseCP.title;
            $scope.error.error = true;
            $scope.error.title = responseCP.title;
            $scope.error.status = responseCP.status;
            $scope.error.message = responseCP.message;

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