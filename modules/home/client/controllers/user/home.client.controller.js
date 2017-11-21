'use strict'

// set up the module
var homeModule = angular.module('home');

// create the controller
homeModule.controller('UserHomeController', ['$scope', '$rootScope', '$compile', '$location', '$timeout', '$window', 'Service', 'AccountFactory', 'HomeFactory', function ($scope, $rootScope, $compile, $location, $timeout, $window, Service, AccountFactory, HomeFactory) {
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

    // holds the sign up form data
    $scope.searchForm = {
        'inputs': {
            'depart': '',
            'arrive': '',
            'departDate': today,
            'returnDate': tomorrow,
            'adults': 1
        },
        'views': {
            'depart': 'depart',
            'arrive': 'arrive',
            'departDate': 'departDate',
            'returnDate': 'returnDate',
            'adults': 'adults'
        },
        'errors': {
            'depart': {
                'isError': false,
                'message': 'Please provide a departing location'
            },
            'arrive': {
                'isError': false,
                'message': 'Please provide a arrival location'
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
        // always refresh header to ensure home
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

            // take to search page
            
        }
    };

    // initialize page
    function initializePage() {
        // hide the header if shown     
        if ($rootScope.$root.showHeader) {
            $rootScope.$root.showHeader = true;
        }

        // hide the footer if shown
        if ($rootScope.$root.showFooter) {
            $rootScope.$root.showFooter = true;
        }

        // if page hasn't been requested yet
        if(!pageRequested) {
            pageRequested = true;

            // get page data
            getPageData();
        }
    };

    // gets the page data
    function getPageData() {
        // initialize
        $scope.home = {};

        // get edit profile page data
        AccountFactory.getEditProfilePageInformation().then(function (responseEP) {
            // if returned a valid response
            if (responseEP && !responseEP.error) {
                // get home page data
                HomeFactory.getHomePageInformation().then(function (responseH) {
                    // if returned a valid response
                    if (responseH && !responseH.error) {
                        // set the data
                        $scope.home.data = responseH;
                        $scope.home.title = 'Home';
                        $scope.home.pageHeader = $scope.home.title;
                        $scope.home.pageSubHeader = 'Welcome ' + responseEP.firstName + ', what do you want to do today?';

                        // holds the page title
                        $scope.pageTitle = $scope.home.title + ' | ' + ApplicationConfiguration.applicationName;

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
            }
            else {
                // set error
                $scope.pageTitle = responseEP.title;
                $scope.error.error = true;
                $scope.error.title = responseEP.title;
                $scope.error.status = responseEP.status;
                $scope.error.message = responseEP.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseEP) {
            // set error
            $scope.pageTitle = responseEP.title;
            $scope.error.error = true;
            $scope.error.title = responseEP.title;
            $scope.error.status = responseEP.status;
            $scope.error.message = responseEP.message;

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
            }
        }
    };

    // sets up all waypoints
    function setUpWaypoints() {
        // get the starting offset
        var startOffset = $rootScope.$root.getWaypointStart();

        // initialize the waypoint list
        var waypointList = [
            { id: 'home-search-form', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };

    // checks for any empty values
    function checkEmptyValues() {
        // check for any empty values
        $scope.searchForm.errors.depart.isError = !$scope.searchForm.inputs.depart || $scope.searchForm.inputs.depart.length == 0;
        $scope.searchForm.errors.arrive.isError = !$scope.searchForm.inputs.arrive || $scope.searchForm.inputs.arrive.length == 0;
        $scope.searchForm.errors.departDate.isError = !$scope.searchForm.inputs.departDate || $scope.searchForm.inputs.departDate.length == 0;
        $scope.searchForm.errors.returnDate.isError = !$scope.searchForm.inputs.returnDate || $scope.searchForm.inputs.returnDate.length == 0;
        $scope.searchForm.errors.adults.isError = !$scope.searchForm.inputs.adults || $scope.searchForm.inputs.adults < 1;
    };
}]);