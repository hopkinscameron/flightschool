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
    var maxDropdown = 30;

    // determines if hub changes are in progress
    $scope.updatesInProgress = false;

    // remove as main hub
    $scope.removeMainHub = function (hub) {
        // set updates in progress
        $scope.updatesInProgress = true;

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
    
                        // set updates have finished
                        $scope.updatesInProgress = false;

                        // force apply
                        $scope.$apply();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // remove main hub
                        $scope.mainHub = undefined;
    
                        // set updates have finished
                        $scope.updatesInProgress = false;

                        // force apply
                        $scope.$apply();
                    });
                }
                else {
                    // show error
                    showErrorMessage(responseUH.message);
                }
            })
            .catch(function (responseUH) {
                // show error
                showErrorMessage(responseUH.message);
            });
        },
        // handling the promise rejection
        function (dismiss) {
            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        });
    };

    // add an additional hub
    $scope.addHub = async function () {
        // set updates in progress
        $scope.updatesInProgress = true;

        // holds the airport found
        var airport = null;

        // the possible airports (as objects)
        var airports = [];

        // the possible airports (as a dropdown name selection)
        var selectOptions = [];

        // get airports from user
        airports = await getAirportsFromUser();

        // if airports
        if(airports) {
            // add each airpot
            _.forEach(airports, function(value) {
                selectOptions.push(value.name)
            });
            
            // if there is only one airport
            if(airports.length == 1) {
                // get only airport
                airport = airports[0];
            }
            else {
                airport = await getSelectedAirport(selectOptions, airports);
            }

            // if airport
            if(airport) {
                // determines if hub should be set as main
                var setAsMainHub = false;

                // if there is not already a main hub
                if(!$scope.mainHub) {
                    // get set as main hub answer
                    setAsMainHub = await getMainHubAnswer();
                }

                // add hub
                AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao, 'main': setAsMainHub } }).then(function (responseUH) {
                    // if returned a valid response
                    if(responseUH && !responseUH.error) {
                        // set value
                        airport = responseUH;

                        // if to set as main hub
                        if(setAsMainHub) {
                            // set new main hub
                            $scope.mainHub = responseUH;
                        }

                        // show hub added
                        showHubAdded(airport);
                    }
                    else {
                        // show error
                        showErrorMessage(responseUH.message);
                    }
                })
                .catch(function (responseUH) {
                    // show error
                    showErrorMessage(responseUH.message);
                });
            }
            else {
                // set updates have finished
                $scope.updatesInProgress = false;

                // force apply
                $scope.$apply();
            }
        }
        else {
            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        }
    };

    // edit hub
    $scope.editHub = async function (hubIndex) {
        // set updates in progress
        $scope.updatesInProgress = true;

        // holds the airport found
        var airport = null;

        // the possible airports (as objects)
        var airports = [];

        // the possible airports (as a dropdown name selection)
        var selectOptions = [];

        // determine if the deleted hub was the main hub
        var wasMain = $scope.hub.data.hubs[hubIndex].main;

        // get airports from user
        airports = await getAirportsFromUser();

        // if airports
        if(airports) {
            // add each airpot
            _.forEach(airports, function(value) {
                selectOptions.push(value.name)
            });
            
            // if there is only one airport
            if(airports.length == 1) {
                // get only airport
                airport = airports[0];
            }
            else {
                airport = await getSelectedAirport(selectOptions, airports);
            }

            // if airport
            if(airport) {
                // determines if hub should be set as main
                var setAsMainHub = false;

                // if there is not already a main hub
                if(!$scope.mainHub) {
                    // get set as main hub answer
                    setAsMainHub = await getMainHubAnswer();
                }

                // add hub
                AccountFactory.upsertHub({ 'newHub': { 'iata': airport.iata, 'icao': airport.icao, 'main': setAsMainHub }, 'oldHub': { 'iata': $scope.hub.data.hubs[hubIndex].iata, 'icao': $scope.hub.data.hubs[hubIndex].icao } }).then(function (responseUH) {
                    // if returned a valid response
                    if(responseUH && !responseUH.error) {
                        // set value
                        airport = responseUH;

                        // if to set as main hub
                        if(setAsMainHub) {
                            // set new main hub
                            $scope.mainHub = responseUH;
                        }

                        // show hub changed
                        showHubChanged(hubIndex, airport);
                    }
                    else {
                        // show error
                        showErrorMessage(responseUH.message);
                    }
                })
                .catch(function (responseUH) {
                    // show error
                    showErrorMessage(responseUH.message);
                });
            }
            else {
                // set updates have finished
                $scope.updatesInProgress = false;

                // force apply
                $scope.$apply();
            }
        }
        else {
            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        }
    };

    // delete hub
    $scope.deleteHub = function (hubIndex) {
        // set updates in progress
        $scope.updatesInProgress = true;

        // ask user if they want to delete their hub
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
            allowEscapeKey: false,
            allowOutsideClick: false,
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
            }
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

                // set updates have finished
                $scope.updatesInProgress = false;

                // force apply
                $scope.$apply();
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

                // set updates have finished
                $scope.updatesInProgress = false;

                // force apply
                $scope.$apply();
            });
        },
        // handling the promise rejection
        function (dismiss) {
            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        });
    };

    // navigate to membership page
    $scope.navigateToMembershipPage = function (path) {
        // navigate to tab
        $scope.$emit('navigateToTab', { 'path': path });
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

    // get airports from user
    function getAirportsFromUser() {
        return new Promise(resolve => {
            // holds the airports found
            var possibles = [];

            // ask user to enter the city or airport code
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
                inputValidator: (value) => {
                    return new Promise(function (resolve, reject) {
                        // get possible airports
                        possibles = getPossibleAirports(value);

                        // if array
                        if(possibles.length > 0 && possibles.length <= maxDropdown) {
                            resolve();                    
                        }
                        else if(possibles.length > maxDropdown) {
                            reject('Too many items. Please enter more to refine the search.');
                        }
                        else {
                            reject('No airports found.');
                        }
                    });
                }
            })
            .then(function () {
                resolve(possibles);
            },
            // handling the promise rejection
            function (dismiss) {
                resolve(null);
            });            
        });
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

    // get selected airport from dropdown
    function getSelectedAirport(selectOptions, airports) {
        return new Promise(resolve => {
            var airport = null;

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
                }
            }).then(function () {
                resolve(airport);
            },
            // handling the promise rejection
            function (dismiss) {
                resolve(airport);
            });
        });   
    };

    // get main hub answer
    function getMainHubAnswer() {
        return new Promise(resolve => {
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
            }).then(function () {
                resolve(true);
            },
            // handling the promise rejection
            function (dismiss) {
                resolve(false);
            });
        });
    };

    // show hub added
    function showHubAdded(airport) {
        // show success message
        swal({
            type: 'success',
            title: 'Hub added!',
            timer: 3000
        })
        .then(function () {
            // push new
            $scope.hub.data.hubs.push(airport);

            // force apply
            $scope.$apply();
        },
        // handling the promise rejection
        function (dismiss) {
            // push new
            $scope.hub.data.hubs.push(airport);

            // force apply
            $scope.$apply();
        });
    };

    // show hub changed
    function showHubChanged(hubIndex, airport) {
        // show success message
        swal({
            type: 'success',
            title: 'Hub updated!',
            timer: 3000
        })
        .then(function () {
            // update
            $scope.hub.data.hubs[hubIndex] = airport;

            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        },
        // handling the promise rejection
        function (dismiss) {
            // update
            $scope.hub.data.hubs[hubIndex] = airport;

            // set updates have finished
            $scope.updatesInProgress = false;

            // force apply
            $scope.$apply();
        });
    };

    // show error message
    function showErrorMessage(message) {
        // show error
        swal({
            title: 'Error!',
            text: 'Sorry! There was an error: ' + message,
            type: 'error',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false
        }).then(function () {
            // set updates have finished
            $scope.updatesInProgress = false;
        },
        // handling the promise rejection
        function (dismiss) {
            // set updates have finished
            $scope.updatesInProgress = false;
        });
    };
}]);