'use strict';

// set up the module
var flightsModule = angular.module('flights');

// create the controller
flightsModule.controller('FlightsController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'AccountFactory', 'FlightsFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, AccountFactory, FlightsFactory) {
    // determines if a page has already sent a request for load
    var pageRequested = false;

    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the error
    $scope.error = {
        'error': false,
        'title': '',
        'status': 404,
        'message': ''
    };

    // get todays date
    var today = new Date();
    
    // get tomorrows date
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // the initial text of a dropdown
    $scope.initialText = 'Select One';

    // the hub options
    $scope.hubOptions = {
        'options': [$scope.initialText]
    };

    // holds the sign up form data
    $scope.searchForm = {
        'inputs': {
            'depart': $scope.initialText,
            'arrive': '',
            'departDate': today,
            'returnDate': tomorrow,
            'adults': 1
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'depart': {
                'isError': false,
                'message': 'Please select a departing location',
                'optionalMessages': ['Please select a departing location', 'Cannot depart and arrive at same location', 'Must have a Hub as a departing or arriving location', 'Not a valid airport location']
            },
            'arrive': {
                'isError': false,
                'message': 'Please select a arrival location',
                'optionalMessages': ['Please select an arrival location', 'Cannot depart and arrive at same location', 'Must have a Hub as a departing or arriving location', 'Not a valid airport location']
            },
            'departDate': {
                'isError': false,
                'message': 'Please provide a departing date'
            },
            'returnDate': {
                'isError': false,
                'message': 'Please provide a returning date'
            },
            'adults': {
                'isError': false,
                'message': 'Please provide a at least 1 adult'
            }         
        }
    };
    
    // determines if form is in transit
    $scope.formInTransit = false;

    // determines which direction user is going for their hub
    $scope.hubDirection = 'depart';

    // the direction text
    $scope.directionText  = {
        'current': 'Switch to hub arrival <i class="fa fa-arrow-right" aria-hidden="true"></i>',
        'changeTo': 'arrive',
        'textOptions': ['<i class="fa fa-arrow-left" aria-hidden="true"></i> Switch to hub departure', 'Switch to hub arrival <i class="fa fa-arrow-right" aria-hidden="true"></i>'],
        'changeOptions': ['depart', 'arrive']
    };

    // determines if the page is fully loaded
    $scope.pageFullyLoaded = false;

    // check if header/footer was initialized
    if($rootScope.$root.showHeader === undefined || $rootScope.$root.showFooter === undefined) {
        // refresh header
        $rootScope.$emit('refreshHeader', {});

        // refresh footer
        $rootScope.$emit('refreshFooter', {});
    }
    else {
        // always refresh header to ensure login
        $rootScope.$emit('refreshHeader', {});
    }

    // on header refresh
    $rootScope.$on('headerRefreshed', function (event, data) {
        // if footer still hasn't been initialized
        if($rootScope.$root.showFooter === undefined) {
            // refresh footer
            $rootScope.$emit('refreshFooter', {});
        }
        else {
            // initialize the page
            initializePage();
        }
    });

    // on footer refresh
    $rootScope.$on('footerRefreshed', function (event, data) {
        // if footer still hasn't been initialized
        if($rootScope.$root.showHeader === undefined) {
            // refresh header
            $rootScope.$emit('refreshHeader', {});
        }
        else {
            // initialize the page
            initializePage();
        }
    });

    // switch between depart and arrive for hubs
    $scope.switchTo = function (departOrArrive) {
        // set null
        $scope.hubDirection = null;

        // if switching to arrive
        if(departOrArrive == 'arrive') {
            // swap to depart
            $scope.directionText.current = $scope.directionText.textOptions[0];
            $scope.directionText.changeTo = $scope.directionText.changeOptions[0];
        }
        else {
            // swap to arrive
            $scope.directionText.current = $scope.directionText.textOptions[1];
            $scope.directionText.changeTo = $scope.directionText.changeOptions[1];
        }
        
        // swap values
        $timeout(function() {
             // if arrive
            departOrArrive == 'arrive' ? $scope.hubDirection = departOrArrive : $scope.hubDirection = 'depart';

            // swap values
            var prevArr = $scope.searchForm.inputs.arrive;
            var prevDep = $scope.searchForm.inputs.depart;
            $scope.searchForm.inputs.arrive = prevDep;
            $scope.searchForm.inputs.depart = prevArr;
        }, 750);
    };

    // searches for flights
    $scope.searchFlights = function () {
        // check for any errors in the values
        checkErrorValues();

        // check if an error exists
        if(!$scope.searchForm.errors.depart.isError && !$scope.searchForm.errors.arrive.isError && !$scope.searchForm.errors.departDate.isError && !$scope.searchForm.errors.returnDate.isError && !$scope.searchForm.errors.adults.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // get the depart
            var depart = null;
            var arrive = null;

            // if direction is arrive
            if($scope.hubDirection == 'arrive') {
                // get the index of ' (Main)'
                var mainIndex = $scope.searchForm.inputs.arrive.indexOf(' (Main)');

                // if user selected main hub
                if(mainIndex != -1) {
                    arrive = $scope.searchForm.inputs.arrive.substring(0, mainIndex);
                }
                else {
                    arrive = $scope.searchForm.inputs.arrive;
                }

                // set depart
                depart = $scope.searchForm.inputs.depart;
            }
            else {
                // get the index of ' (Main)'
                var mainIndex = $scope.searchForm.inputs.depart.indexOf(' (Main)');
                
                // if user selected main hub
                if(mainIndex != -1) {
                    depart = $scope.searchForm.inputs.depart.substring(0, mainIndex);
                }
                else {
                    depart = $scope.searchForm.inputs.depart;
                }

                // set arrive
                arrive = $scope.searchForm.inputs.arrive;
            }

            // get the departing/arriving location
            var foundDepart = _.find($rootScope.$root.airportCodes, { 'name': depart });
            var foundArrive = _.find($rootScope.$root.airportCodes, { 'name': arrive });

            // if both are found
            if(foundDepart && foundArrive) {
                // the data to send
                var searchData = {
                    'depart': { 'iata': foundDepart.iata, 'icao': foundDepart.icao },
                    'arrive': { 'iata': foundArrive.iata, 'icao': foundArrive.icao },
                    'departDate': $scope.searchForm.inputs.departDate,
                    'returnDate': $scope.searchForm.inputs.returnDate,
                    'adults': $scope.searchForm.inputs.adults
                };

                // search flights
                FlightsFactory.getFlights(searchData).then(function (responseF) {
                    // if returned a valid response
                    if (responseF && !responseF.error) {
                        // set the data
                        $scope.flights.flightList = responseF;

                        // show the form is no longer in transit
                        $scope.formInTransit = false;
                    }
                    else {
                        // show error
                        swal({
                            title: 'Error!',
                            text: 'Sorry! There was an error: ' + responseF.message,
                            type: 'error',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            buttonsStyling: false
                        }).then(function () {
                            // show error
                            $scope.searchForm.errors.generic.message = responseF.message;
                            $scope.searchForm.errors.generic.isError = true;
                            $scope.formInTransit = false;

                            // force apply
                            $scope.$apply();
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // show error
                            $scope.searchForm.errors.generic.message = responseF.message;
                            $scope.searchForm.errors.generic.isError = true;
                            $scope.formInTransit = false;

                            // force apply
                            $scope.$apply();         
                        });
                    }
                })
                .catch(function (responseF) {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseF.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show error
                        $scope.searchForm.errors.generic.message = responseF.message;
                        $scope.searchForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show error
                        $scope.searchForm.errors.generic.message = responseF.message;
                        $scope.searchForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();           
                    });
                });
            }
            else {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: Please try again later.',
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show error
                    $scope.searchForm.errors.generic.message = $rootScope.$root.generalStatusError;
                    $scope.searchForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.searchForm.errors.generic.message = $rootScope.$root.generalStatusError;
                    $scope.searchForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();           
                });
            }
        }
    };

    // initialize page
    function initializePage() {
        // show the header if not shown     
        if (!$rootScope.$root.showHeader) {
            $rootScope.$root.showHeader = true;
        }

        // show the footer if not shown
        if (!$rootScope.$root.showFooter) {
            $rootScope.$root.showFooter = true;
        }

        // if page hasn't been requested yet
        if(!pageRequested) {
            // set page has been requested
            pageRequested = true;

            // show the page after a timeout
            $timeout(getPageData, $rootScope.$root.getPageDataTimeout);
        }
    };

    // gets the page data
    function getPageData() {
        // initialize
        $scope.flights = {};
                
        // get flights page data
        FlightsFactory.getFlightsPageInformation().then(function (responseF) {
            // if returned a valid response
            if (responseF && !responseF.error) {
                // set the data
                $scope.flights.data = responseF;
                $scope.flights.title = 'Flights';
                $scope.flights.pageHeader = $scope.flights.title;
                $scope.flights.pageSubHeader = $rootScope.$root.isLoggedIn ? `Hey ${$window.user.firstName}, where do you wanna go?` : 'Please sign in to search flights';

                // holds the page title
                $scope.pageTitle = $scope.flights.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // holds the animation time
                $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseF.title;
                $scope.error.error = true;
                $scope.error.title = responseF.title;
                $scope.error.status = responseF.status;
                $scope.error.message = responseF.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseF) {
            // set error
            $scope.pageTitle = responseF.title;
            $scope.error.error = true;
            $scope.error.title = responseF.title;
            $scope.error.status = responseF.status;
            $scope.error.message = responseF.message;

            // setup page
            setUpPage();
        });
    };

    // sets up the page
    function setUpPage() {
        // set up the title
        var titleDOM = document.getElementById('pageTitle');
        var title = '\'' + $scope.pageTitle + '\'';
        titleDOM.setAttribute('ng-bind-html', title);
        $compile(titleDOM)($scope);

        // set page fully loaded
        $scope.pageFullyLoaded = true;

        // show the page after a timeout
        $timeout(showPage, $rootScope.$root.showPageTimeout);
    };

    // shows the page
    function showPage() {
        // check if collapsing is already occuring
        if(!angular.element('#pageShow').hasClass('collapsing')) {
            // show the page
            angular.element('#pageShow').collapse('show');

            // if an error does not exists
            if(!$scope.error.error) {
                // setup all waypoints
                setUpWaypoints();

                // checks if user is logged in
                checkLoggedIn();
            }
        }
    };

    // sets up all waypoints
    function setUpWaypoints() {
        // get the starting offset
        var startOffset = $rootScope.$root.getWaypointStart();

        // initialize the waypoint list
        var waypointList = [
            { id: 'flights-FIXME', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };

    // checks if user is logged in
    function checkLoggedIn() {
        // if user not logged in, open up drop down to tell user to login
        if(!$rootScope.$root.isLoggedIn) {
            // show info
            swal({
                title: 'Not Signed In!',
                text: 'Please sign in to view flights',
                type: 'info',
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                buttonsStyling: false,
                timer: 2500
            }).then(function () {
                // wait a second before showing
                $timeout(function() {
                    // show dropdown login form
                    $('#navbarDropdownLogin').dropdown('toggle');
                }, 500);
            },
            // handling the promise rejection
            function (dismiss) {
                // wait a second before showing
                $timeout(function() {
                    // show dropdown login form
                    $('#navbarDropdownLogin').dropdown('toggle');
                }, 500);              
            });
        }
        else {
            // initialize
            $scope.hub = {};
            
            // get hub page data
            AccountFactory.getHubPageInformation().then(function (responseH) {
                // if returned a valid response
                if (responseH && !responseH.error) {
                    // set the data
                    $scope.hub.data = responseH;

                    // add all available hubs and home locations
                    _.forEach(responseH.hubs, function(value) {
                        // get the airport code
                        var hubAirport = value.iata ? value.iata : value.icao;

                        // if main
                        if(value.main) {
                            // set main
                            $scope.hubOptions.options.push(`${value.name} (Main)`);
                        }
                        else {
                            // set hub
                            $scope.hubOptions.options.push(value.name);
                        }
                    });

                    // if the user doesn't have hubs
                    if(responseH.hubs.length == 0) {
                        // show error
                        swal({
                            title: 'No hubs!',
                            text: 'Sorry! It looks like you don\'t have any hubs. Lets add some!',
                            type: 'info',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            buttonsStyling: false
                        }).then(function () {
                            // go to account page
                            $window.href = '/account/hubs';
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // go to account page
                            $window.href = '/account/hubs';
                        });
                    }
                }
                else {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseH.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {},
                    // handling the promise rejection
                    function (dismiss) {});
                }
            })
            .catch(function (responseH) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseH.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {},
                // handling the promise rejection
                function (dismiss) {});
            });
        }
    };

    // checks for any errors in the values
    function checkErrorValues() {
        // check for any empty values
        $scope.searchForm.errors.depart.isError = !$scope.searchForm.inputs.depart || $scope.searchForm.inputs.depart.length == 0 || ($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart == $scope.initialText)
                                                    || ($scope.hubDirection == 'depart' && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.depart) == -1)
                                                    || ($scope.hubDirection == 'arrive' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.depart }) == -1);
        $scope.searchForm.errors.arrive.isError = !$scope.searchForm.inputs.arrive || $scope.searchForm.inputs.arrive.length == 0 || ($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive == $scope.initialText)
                                                    || ($scope.hubDirection == 'arrive' && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.arrive) == -1)
                                                    || ($scope.hubDirection == 'depart' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.arrive }) == -1);
        $scope.searchForm.errors.departDate.isError = !$scope.searchForm.inputs.departDate || $scope.searchForm.inputs.departDate.length == 0;
        $scope.searchForm.errors.returnDate.isError = !$scope.searchForm.inputs.returnDate || $scope.searchForm.inputs.returnDate.length == 0;
        $scope.searchForm.errors.adults.isError = !$scope.searchForm.inputs.adults || $scope.searchForm.inputs.adults < 1;

        // set specific text based on empty or equality
        if($scope.hubDirection == 'arrive' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.depart }) == -1) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[3];
        }
        else if($scope.hubDirection == 'depart' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.arrive }) == -1) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[3];
        }

        if($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart != $scope.initialText && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.depart) == -1) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[2];
        }
        else if($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive != $scope.initialText && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.arrive) == -1) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[2];
        }

        if($scope.searchForm.inputs.depart == $scope.searchForm.inputs.arrive) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[1];
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[1];
        }
        if(!$scope.searchForm.inputs.depart || $scope.searchForm.inputs.depart.length == 0 || ($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart == $scope.initialText)) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[0];
        }
        if(!$scope.searchForm.inputs.arrive || $scope.searchForm.inputs.arrive.length == 0 || ($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive == $scope.initialText)) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[0];
        }
    };
}]);