'use strict';

// set up the module
var supportModule = angular.module('support');

// create the controller
supportModule.controller('FAQController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'SupportFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, SupportFactory) {
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
        $scope.faq = {};

        // get support page data
        SupportFactory.getFAQPageInformation().then(function (responseF) {
            // if returned a valid response
            if (responseF && !responseF.error) {
                // set the data
                $scope.faq.data = responseF;
                $scope.faq.title = 'FAQ';
                $scope.faq.pageHeader = $scope.faq.title;
                $scope.faq.pageSubHeader = 'Looks like you need some questions answered.';

                // holds the animation time
                $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                // holds the page title
                $scope.pageTitle = $scope.faq.title + ' | ' + ApplicationConfiguration.applicationName;

                // go through all faq's and add an open/close attribute
                _.forEach($scope.faq.faqs, function(value) {
                    value.open = true;
                });
                
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
            }
        }
    };

    // sets up all waypoints
    function setUpWaypoints() {
        // get the starting offset
        var startOffset = $rootScope.$root.getWaypointStart();

        // initialize the waypoint list
        var waypointList = [];

        // go through all faq's and add an open/close attribute
        for(var x = 0; x < $scope.faq.faqs.length; x++) {
            waypointList.push({ id: 'faq-list-item-' + x, offset: startOffset, class: 'animated fadeInUp' })
        };

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };
}]);