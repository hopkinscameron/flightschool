'use strict'

// set up the module
var homeModule = angular.module('home');

// create the controller
homeModule.controller('HomeController', ['$scope', '$rootScope', '$compile', '$location', '$timeout', '$window', 'Service', 'HomeFactory', function ($scope, $rootScope, $compile, $location, $timeout, $window, Service, HomeFactory) {
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

        // get home page data
        HomeFactory.getHomePageInformation().then(function (responseH) {
            // if returned a valid response
            if (responseH && !responseH.error) {
                // set the data
                $scope.home.data = responseH;
                $scope.home.title = 'Home';
                $scope.home.pageHeader = $scope.home.title;
                $scope.home.pageSubHeader = 'Oh no! Can\'t find what you\'re looking for?';

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
            { id: 'home-services', offset: startOffset, class: 'animated fadeIn' },
            { id: 'home-slider', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };
}]);