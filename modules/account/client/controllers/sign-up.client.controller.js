'use strict'

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('SignUpController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'LoginFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, LoginFactory) {
    // determines if a page has already sent a request for load
    var pageRequested = false;
    
    // set jQuery
    $ = window.jQuery;

    // previous path
    var previousPath = Service.afterPath;

    // set the path
    Service.afterPath = $location.path();

    // holds the error
    $scope.error = {
        'error': false,
        'title': '',
        'status': 404,
        'message': ''
    };

    // holds the sign up form data
    $scope.signUpForm = {
        'inputs': {
            'firstName': '   John   ',
            'lastName': '   Doe    ',
            'email': 'john.doe@example.com  ',
            'password': 'password'            
        },
        'views': {
            'firstName': 'firstName',
            'lastName': 'lastName',
            'email': 'email',
            'password': 'password'
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'firstName': {
                'isError': false,
                'message': 'Please provide your first name'
            },
            'lastName': {
                'isError': false,
                'message': 'Please provide your last name'
            },
            'email': {
                'isError': false,
                'message': 'Please provide an email'
            },
            'password': {
                'isError': false,
                'message': 'Please a password'
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

    // sign up
    $scope.signUp = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.signUpForm.errors.firstName.isError && !$scope.signUpForm.errors.lastName.isError && !$scope.signUpForm.errors.email.isError && !$scope.signUpForm.errors.password.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var signUpData = {
                'firstName': $scope.signUpForm.inputs.firstName,
                'lastName': $scope.signUpForm.inputs.lastName,
                'email': $scope.signUpForm.inputs.email,
                'password': $scope.signUpForm.inputs.password
            };

            // login
            LoginFactory.signUp(signUpData).then(function (responseSU) {
                // if returned a valid response
                if(responseSU && !responseSU.error) {
                    // show success
                    swal({
                        title: 'Success!',
                        text: 'An email will be sent and you need to verify your account.',
                        type: 'success',
                        confirmButtonText: 'Sounds Good'
                    }).then(function () {
                        // redirect to home page
                        $window.location.href = '/';
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // redirect to home page
                        $window.location.href = '/';
                    });
                }
                else {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseSU.message,
                        type: 'error'
                    }).then(function () {
                        // show error
                        $scope.signUpForm.errors.generic.message = responseSU.message;
                        $scope.signUpForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply()
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show error
                        $scope.signUpForm.errors.generic.message = responseSU.message;
                        $scope.signUpForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply()
                    });
                }
            })
            .catch(function (responseSU) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseSU.message,
                    type: 'error'
                }).then(function () {
                    // show error
                    $scope.signUpForm.errors.generic.message = responseSU.message;
                    $scope.signUpForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.signUpForm.errors.generic.message = responseSU.message;
                    $scope.signUpForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply()
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
        // check if user is logged in
        LoginFactory.isUserLoggedIn().then(function (responseL) {
            // if returned a valid response
            if(responseL && !responseL.error) {
                // if user is not logged in
                if(!responseL.isLoggedIn) {
                    $scope.signUp.title = 'Sign Up';
                    $scope.signUp.pageHeader = $scope.signUp.title;
                    $scope.signUp.pageSubHeader = 'Awesome! Let\'s go ahead and get you signed up for something special!';

                    // holds the animation time
                    $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                    // holds the page title
                    $scope.pageTitle = $scope.signUp.title + ' | ' + ApplicationConfiguration.applicationName;
                    
                    // setup page
                    setUpPage();
                }
                // if was on a previous route
                else if(previousPath && previousPath.length > 0) {
                    // redirect to previous page and reload page to refresh user object
                    $window.location.href = previousPath;
                }
                else {
                    // redirect to account page and reload page to refresh user object
                    $window.location.href = '/account/edit';
                }
            }
            else {
                // show error
                $scope.signUpForm.errors.generic.message = responseL.message;
                $scope.signUpForm.errors.generic.isError = true;
                $scope.formInTransit = false;
            }
        })
        .catch(function (responseL) {
            // show error
            $scope.signUpForm.errors.generic.message = responseL.message;
            $scope.signUpForm.errors.generic.isError = true;
            $scope.formInTransit = false;
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
            { id: 'signUp-form', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };

    // checks for any empty values
    function checkEmptyValues() {
        // check for any empty values
        $scope.signUpForm.errors.firstName.isError = !$scope.signUpForm.inputs.firstName || $scope.signUpForm.inputs.firstName.length == 0;
        $scope.signUpForm.errors.lastName.isError = !$scope.signUpForm.inputs.lastName || $scope.signUpForm.inputs.lastName.length == 0;
        $scope.signUpForm.errors.email.isError = !$scope.signUpForm.inputs.email || $scope.signUpForm.inputs.email.length == 0;
        $scope.signUpForm.errors.password.isError = !$scope.signUpForm.inputs.password || $scope.signUpForm.inputs.password.length == 0;
    };
}]);