'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('AccountController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', '$routeParams', 'Service', 'AccountFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, $routeParams, Service, AccountFactory) {
    // determines if a page has already sent a request for load
    var pageRequested = false;

    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // set the account section
    var section = $routeParams.section;

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

    // checks if the page is active
    $scope.isActive = function (page) {
        // get the third index of forward slash
        var index = nthIndexOf($window.location.href, '/', 3);
        var link = $window.location.href.substring(index + 1);
        
        // check if on page
        if (link == page) {
            // set the class as active
            return true;
        }

        return false;
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
        $scope.account = {};

        // get account navigation data
        AccountFactory.getAccountNavigation().then(function (responseAN) {
            // if returned a valid response
            if (!responseAN.error) {
                // set the data
                $scope.account.navigation = responseAN;
                $scope.account.title = 'Account';

                // holds the animation time
                $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                // holds the page title
                $scope.pageTitle = $scope.account.title + ' | ' + ApplicationConfiguration.applicationName;

                // initialize
                $scope.partialView = undefined;

                // set the correct page
                _.forEach(responseAN, function (value) {
                    // if matches
                    if(value.pageLink == section) {
                        $scope.partialView = _.cloneDeep(value);
                        return;
                    }
                });
                
                // if there is not a correct match
                if(!$scope.partialView) {
                    // set error
                    $scope.pageTitle = 'Page not found';
                    $scope.error.error = true;
                    $scope.error.title = 'Page not found';
                    $scope.error.status = 404;
                    $scope.error.message = 'Page not found';
                }

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseAN.title;
                $scope.error.error = true;
                $scope.error.title = responseAN.title;
                $scope.error.status = responseAN.status;
                $scope.error.message = responseAN.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseAN) {
            // set error
            $scope.pageTitle = responseAN.title;
            $scope.error.error = true;
            $scope.error.title = responseAN.title;
            $scope.error.status = responseAN.status;
            $scope.error.message = responseAN.message;

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
        }
    };
}]);