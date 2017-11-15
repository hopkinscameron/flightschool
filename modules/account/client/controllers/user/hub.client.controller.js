'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('HubController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // edit home location
    $scope.editHomeLocation = function () {
        // holds the home location found
        var hl = null;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: 'LAX',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if (value) {
                        // TODO: check here if it exists
                        hl = value;
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // update home location
                    AccountFactory.updateHubHome({ 'homeLocation': hl }).then(function (responseUH) {
                        // if returned a valid response
                        if(responseUH && !responseUH.error) {
                            // set value
                            hl = responseUH;
                            resolve();
                        }
                        else {
                            reject(responseUH.message);
                        }
                    })
                    .catch(function (responseUH) {
                        reject(responseUH.message);
                    });
                })
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
                $scope.hub.data.homeLocation = hl;

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // set location and save
                $scope.hub.data.homeLocation = hl;

                // force apply
                $scope.$apply()
            });
        })
    };

    // add an additional hub
    $scope.addHub = function () {
        // holds the hub found
        var hub = null;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: '',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if (value) {
                        // TODO: check here if it exists
                        hub = value;
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // add hub
                    AccountFactory.upsertHub({ 'newHub': hub }).then(function (responseUH) {
                        // if returned a valid response
                        if(responseUH && !responseUH.error) {
                            // set value
                            hub = responseUH;
                            resolve();
                        }
                        else {
                            reject(responseUH.message);
                        }
                    })
                    .catch(function (responseUH) {
                        reject(responseUH.message);
                    });
                })
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
                $scope.hub.data.hubs.push(hub);

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // push new
                $scope.hub.data.hubs.push(hub);

                // force apply
                $scope.$apply()
            });
        })
    };

    // edit hub
    $scope.editHub = function (hubIndex) {
        // holds the hub found
        var hub = null;

        swal({
            title: 'Enter city or airport code',
            input: 'text',
            inputPlaceholder: '',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    // if a value is present
                    if (value) {
                        // TODO: check here if it exists
                        hub = value;
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // add hub
                    AccountFactory.upsertHub({ 'newHub': hub, 'oldHub': $scope.hub.data.hubs[hubIndex].iata }).then(function (responseUH) {
                        // if returned a valid response
                        if(responseUH && !responseUH.error) {
                            // set value
                            hub = responseUH;

                            resolve();
                        }
                        else {
                            reject(responseUH.message);
                        }
                    })
                    .catch(function (responseUH) {
                        reject(responseUH.message);
                    });
                })
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
                $scope.hub.data.hubs[hubIndex] = hub;

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // update
                $scope.hub.data.hubs[hubIndex] = hub;

                // force apply
                $scope.$apply()
            });
        })
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

    // updates the hubs
    function updateHubs(data, callback) {
        // the data to send
        var hubsData = {
            'homeLocation': data.homeLocation,
            'hubs': data.hubs
        };

        // remove all undefined members
        $rootScope.$root.removeUndefinedMembers(hubsData);

        
    }
}]);