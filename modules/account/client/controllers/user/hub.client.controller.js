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
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function (email) {
                return new Promise(function (resolve, reject) {
                    // update
                    updateHubs(function(err, message) {
                        // if error
                        if(err) {
                            reject(message);
                        }
                        else {
                            resolve();
                        }
                    });
                })
            },
            allowOutsideClick: false
        }).then(function (location) {
            swal({
                type: 'success',
                title: 'Home location set!',
                timer: 3000
            })
            .then(function (location) {
                // set location and save
                $scope.hub.data.homeLocation = {
                    'city': 'Columbus',
                    'state': 'OH',
                    'airport': 'CMH'
                };

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // set location and save
                $scope.hub.data.homeLocation = {
                    'city': 'Columbus',
                    'state': 'OH',
                    'airport': 'CMH'
                };

                // force apply
                $scope.$apply()
            });
        })
    };

    // add an additional hub
    $scope.addHub = function () {
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
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function (email) {
                return new Promise(function (resolve, reject) {
                    // update
                    updateHubs(function(err, message) {
                        // if error
                        if(err) {
                            reject(message);
                        }
                        else {
                            resolve();
                        }
                    });
                })
            },
            allowOutsideClick: false
        }).then(function (location) {
            swal({
                type: 'success',
                title: 'Hub added!',
                timer: 3000
            })
            .then(function (location) {
                // add new
                $scope.hub.data.hubs.push({
                    'city': 'Columbus',
                    'state': 'OH',
                    'airport': 'CMH'
                });

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // add new
                $scope.hub.data.hubs.push({
                    'city': 'Columbus',
                    'state': 'OH',
                    'airport': 'CMH'
                });

                // force apply
                $scope.$apply()
            });
        })
    };

    // edit hub
    $scope.editHub = function (hubIndex) {
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
                        resolve();
                    } 
                    else {
                        reject('Please enter city or airport code!');
                    }
                })
            },
            preConfirm: function (email) {
                return new Promise(function (resolve, reject) {
                    // update
                    updateHubs(function(err, message) {
                        // if error
                        if(err) {
                            reject(message);
                        }
                        else {
                            resolve();
                        }
                    });
                })
            },
            allowOutsideClick: false
        }).then(function (location) {
            swal({
                type: 'success',
                title: 'Hub updated!',
                timer: 3000
            })
            .then(function (location) {
                // update
                $scope.hub.data.hubs[hubIndex] = {
                    'city': 'Toledo',
                    'state': 'OH',
                    'airport': 'CMH'
                };

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // update
                $scope.hub.data.hubs[hubIndex] = {
                    'city': 'Toledo',
                    'state': 'OH',
                    'airport': 'CMH'
                };

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

                // FIXME: used for testing
                $scope.hub.data = {
                    'maxHubs': 5,
                    'homeLocation': null,
                    'hubs': []
                };

                /*
                // set location and save
                $scope.hub.data.homeLocation = {
                    'city': 'Columbus',
                    'state': 'OH',
                    'airport': 'CMH'
                };
                */

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
    function updateHubs(callback) {
        // the data to send
        var hubsData = {
            'homeLocation': $scope.hub.data.homeLocation,
            'hubs': $scope.hub.data.hubs
        };

        // update password
        AccountFactory.updateHubs(hubsData).then(function (responseUH) {
            // if returned a valid response
            if(responseUH && !responseUH.error) {
                // if callback
                if(callback) {
                    callback();
                }
            }
            else {
                // if callback
                if(callback) {
                    callback(responseUH.error, responseUH.message);
                }
            }
        })
        .catch(function (responseUH) {
            // if callback
            if(callback) {
                callback(responseUH.error, responseUH.message);
            }
        });
    }
}]);