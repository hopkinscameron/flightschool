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

    // the departing options
    $scope.departOptions = {
        'selected': $scope.initialText,
        'options': [$scope.initialText]
    };

    // the arrival options
    $scope.arriveOptions = {
        'selected': $scope.initialText,
        'options': [$scope.initialText]
    };

    // holds the sign up form data
    $scope.searchForm = {
        'inputs': {
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
                'optionalMessages': ['Please select a departing location', 'Cannot depart and arrive at same location', 'Can only travel from Home to Hub or Hub to Home, Hub to Hub is not allowed']
            },
            'arrive': {
                'isError': false,
                'message': 'Please select a arrival location',
                'optionalMessages': ['Please select a arrival location', 'Cannot depart and arrive at same location', 'Can only travel from Home to Hub or Hub to Home, Hub to Hub is not allowed']
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

    // searches for flights
    $scope.searchFlights = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.searchForm.errors.depart.isError && !$scope.searchForm.errors.arrive.isError && !$scope.searchForm.errors.departDate.isError && !$scope.searchForm.errors.returnDate.isError && !$scope.searchForm.errors.adults.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var signUpData = {
                'depart': $scope.departOptions.selected,
                'arrive': $scope.arriveOptions.selected,
                'departDate': $scope.searchForm.inputs.departDate,
                'returnDate': $scope.searchForm.inputs.returnDate,
                'adults': $scope.searchForm.inputs.adults
            };

            // search flights
            FlightsFactory.getFlights(signUpData).then(function (responseF) {
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

                    // get the airport code
                    var homeAiport = responseH.homeLocation.iata ? responseH.homeLocation.iata : responseH.homeLocation.icao;
                    $scope.departOptions.options.push(`${homeAiport} - ${responseH.homeLocation.city} (Home)`);
                    $scope.arriveOptions.options.push(`${homeAiport} - ${responseH.homeLocation.city} (Home)`);

                    // add all available hubs and home locations
                    _.forEach(responseH.hubs, function(value) {
                        // get the airport code
                        var hubAirport = value.iata ? value.iata : value.icao;
                        $scope.departOptions.options.push(`${hubAirport} - ${value.city} (Hub)`);
                        $scope.arriveOptions.options.push(`${hubAirport} - ${value.city} (Hub)`);
                    });
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

    // checks for any empty values
    function checkEmptyValues() {
        // get the home location
        var homeAiport = $scope.hub.data.homeLocation.iata ? $scope.hub.data.homeLocation.iata : $scope.hub.data.homeLocation.icao;
        var homeLocation = `${homeAiport} - ${$scope.hub.data.homeLocation.city} (Home)`;

        // check for any empty values
        $scope.searchForm.errors.depart.isError = !$scope.departOptions.selected || $scope.departOptions.selected.length == 0 || $scope.departOptions.selected == $scope.initialText || $scope.departOptions.selected == $scope.arriveOptions.selected || ($scope.departOptions.selected != homeLocation && $scope.arriveOptions.selected != homeLocation);
        $scope.searchForm.errors.arrive.isError = !$scope.arriveOptions.selected || $scope.arriveOptions.selected.length == 0 || $scope.arriveOptions.selected == $scope.initialText || $scope.departOptions.selected == $scope.arriveOptions.selected || ($scope.departOptions.selected != homeLocation && $scope.arriveOptions.selected != homeLocation);
        $scope.searchForm.errors.departDate.isError = !$scope.searchForm.inputs.departDate || $scope.searchForm.inputs.departDate.length == 0;
        $scope.searchForm.errors.returnDate.isError = !$scope.searchForm.inputs.returnDate || $scope.searchForm.inputs.returnDate.length == 0;
        $scope.searchForm.errors.adults.isError = !$scope.searchForm.inputs.adults || $scope.searchForm.inputs.adults < 1;

        // set specific text based on empty or equality
        if($scope.departOptions.selected != homeLocation && $scope.arriveOptions.selected != homeLocation) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[2];
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[2];
        }
        if($scope.departOptions.selected == $scope.arriveOptions.selected) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[1];
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[1];
        }
        if(!$scope.departOptions.selected || $scope.departOptions.selected.length == 0 || $scope.departOptions.selected == $scope.initialText) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[0];
        }
        if(!$scope.arriveOptions.selected || $scope.arriveOptions.selected.length == 0 || $scope.arriveOptions.selected == $scope.initialText) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[0];
        }
    };
}]);