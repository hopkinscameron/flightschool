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

    // determines if the top level (account) page has been set up
    $scope.pageAlreadySet = false;

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

    // listen for the event in the relevant $scope
    $scope.$on('updateAccountPage', function (event, data) {
        // if there is data
        if(data) {
            // if there is a new error
            if(data.error) {
                // set the error
                $scope.error = data.error;
            }

            // if there is a new page title
            if(data.pageTitle) {
                // set the title
                $scope.pageTitle = data.pageTitle;

                // set up the title
                var titleDOM = document.getElementById('pageTitle');
                var title = '\'' + $scope.pageTitle + '\'';
                titleDOM.setAttribute('ng-bind-html', title);
                $compile(titleDOM)($scope);
            }

            // if there is a new page header
            if(data.pageHeader) {
                // set the header
                $scope.account.pageHeader = data.pageHeader;
            }

            // if there is a new page sub header
            if(data.pageSubHeader) {
                // set the sub header
                $scope.account.pageSubHeader = data.pageSubHeader;
            }
        }
    });

    // navigate to tab
    $scope.navigateToTab = function (path) {
        // change the location without reloading the entire page
        $location.path(path, false);

        // set the path
        Service.afterPath = $location.path();
        $routeParams.section = path.substring(path.lastIndexOf('/') + 1);

        // set the account section
        section = $routeParams.section;

        // change page and get the data
        getPageData();
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
        // if not set
        if(!$scope.pageAlreadySet) {
            $scope.pageAlreadySet = true;

            // initialize
            $scope.account = {};

            // get account navigation data
            AccountFactory.getAccountNavigation().then(function (responseAN) {
                // if returned a valid response
                if (responseAN && !responseAN.error) {
                    // set the data
                    $scope.account.navigation = responseAN;
                    $scope.account.title = 'Account';
                    $scope.account.pageHeader = $scope.account.title;
                    $scope.account.pageSubHeader = 'Let\'s go ahead and edit some stuff.';

                    // holds the page title
                    $scope.pageTitle = $scope.account.title + ' | ' + ApplicationConfiguration.applicationName;

                    // holds the animation time
                    $scope.animationStyle = $rootScope.$root.getAnimationDelay();

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
        }
        else {
            // initialize
            $scope.partialView = undefined;

            // set the correct page
            _.forEach($scope.account.navigation, function (value) {
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
        }
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