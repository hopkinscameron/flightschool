'use strict';

// set up the module
var supportModule = angular.module('support');

// create the controller
supportModule.controller('ContactController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'SupportFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, SupportFactory) {
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

    // show contact phone number
    $scope.showPhoneNumber =  function () {
        swal({
            text: 'Phone: ' + $scope.contact.data.phone,
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false
        });
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
        $scope.contact = {};

        // get support page data
        SupportFactory.getContactPageInformation().then(function (responseC) {
            // if returned a valid response
            if (responseC && !responseC.error) {
                // set the data
                $scope.contact.data = responseC;
                $scope.contact.title = 'Contact Us';
                $scope.contact.pageHeader = $scope.contact.title;
                $scope.contact.pageSubHeader = 'Oh no! Can\'t find what you\'re looking for?';

                // holds the animation time
                $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                // holds the page title
                $scope.pageTitle = $scope.contact.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseC.title;
                $scope.error.error = true;
                $scope.error.title = responseC.title;
                $scope.error.status = responseC.status;
                $scope.error.message = responseC.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseC) {
            // set error
            $scope.pageTitle = responseC.title;
            $scope.error.error = true;
            $scope.error.title = responseC.title;
            $scope.error.status = responseC.status;
            $scope.error.message = responseC.message;

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
            { id: 'contact-body', offset: startOffset, class: 'animated fadeIn' },
            { id: 'contact-customer-service', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };
}]);