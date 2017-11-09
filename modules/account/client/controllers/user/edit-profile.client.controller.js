'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('EditProfileController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'AccountFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, AccountFactory) {
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
        // get account navigation data
        AccountFactory.getAccountNavigation().then(function (responseAN) {
            // if returned a valid response
            if (!responseAN.error) {
                // get edit profile page data
                AccountFactory.getEditProfilePageInformation().then(function (responseEP) {
                    // if returned a valid response
                    if (!responseEP.error) {
                        // set the data
                        $scope.editProfile = responseEP;
                        $scope.editProfile.navigation = responseAN;
                        $scope.editProfile.title = 'Edit Profile';

                        // holds the animation time
                        $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                        // holds the page title
                        $scope.pageTitle = $scope.editProfile.title + ' | ' + ApplicationConfiguration.applicationName;
                        
                        // setup page
                        setUpPage();
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