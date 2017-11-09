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
            'errorMessage': '',
            'isError': false,
            'firstName': false,
            'lastName': false,
            'email': false,
            'password': false            
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

    // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the first name view
        if (viewId == $scope.signUpForm.views.firstName) {
            // reset the error
            $scope.signUpForm.errors.firstName = false;
        }
        // if entering the last name view
        else if (viewId == $scope.signUpForm.views.lastName) {
            // reset the error
            $scope.signUpForm.errors.lastName = false;
        }
        // if entering the email view
        else if (viewId == $scope.signUpForm.views.email) {
            // reset the error
            $scope.signUpForm.errors.email = false;
        }
        // if entering the password view
        else if (viewId == $scope.signUpForm.views.password) {
            // reset the error
            $scope.signUpForm.errors.password = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if leaving the first name view
        if (viewId == $scope.signUpForm.views.firstName) {
            // if user left field blank
            if ($scope.signUpForm.inputs.firstName.length == 0) {
                // set error
                $scope.signUpForm.errors.firstName = true;
                $scope.signUpForm.errors.isError = true;
            }
        }
        // if leaving the last name view
        else if (viewId == $scope.signUpForm.views.lastName) {
            // if user left field blank
            if ($scope.signUpForm.inputs.lastName.length == 0) {
                // set error
                $scope.signUpForm.errors.lastName = true;
                $scope.signUpForm.errors.isError = true;
            }
        }
        // if leaving the email view
        else if (viewId == $scope.signUpForm.views.email) {
            // if user left field blank
            if (!$scope.signUpForm.inputs.email || $scope.signUpForm.inputs.email.length == 0) {
                // set error
                $scope.signUpForm.errors.email = true;
                $scope.signUpForm.errors.isError = true;
            }
        }
        // if leaving the password view
        else if (viewId == $scope.signUpForm.views.password) {
            // if user left field blank
            if ($scope.signUpForm.inputs.password.length == 0) {
                // set error
                $scope.signUpForm.errors.password = true;
                $scope.signUpForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.signUpForm.errors.firstName) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your first name';
        }
        else if ($scope.signUpForm.errors.lastName) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your last name';
        }
        else if ($scope.signUpForm.errors.email) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your email';
        }
        else if ($scope.signUpForm.errors.password) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter a password';
        }
        else {
            // remove error
            $scope.signUpForm.errors.errorMessage = '';
            $scope.signUpForm.errors.isError = false;
        }
    };

    // sign up
    $scope.signUp = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.signUpForm.errors.firstName && !$scope.signUpForm.errors.lastName && !$scope.signUpForm.errors.email && !$scope.signUpForm.errors.password) {
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
                // if no error
                if(!responseSU.error) {
                    swal({
                        title: 'Success!',
                        text: 'An email will be sent and you need to verify your account.',
                        type: 'success',
                        confirmButtonText: 'Sounds Good'
                    }).then(function () {
                        // redirect to home page
                        $window.location.href = '/';
                    });
                }
                else {
                    // show error
                    $scope.signUpForm.errors.errorMessage = responseSU.message;
                    $scope.signUpForm.errors.isError = true;
                    $scope.formInTransit = false;
                }
            })
            .catch(function (responseSU) {
                // show error
                $scope.signUpForm.errors.errorMessage = responseSU.message;
                $scope.signUpForm.errors.isError = true;
                $scope.formInTransit = false;
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
            // if no error
            if(!responseL.error) {
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
                $scope.signUpForm.errors.errorMessage = responseL.message;
                $scope.signUpForm.errors.isError = true;
                $scope.formInTransit = false;
            }
        })
        .catch(function (responseL) {
            // show error
            $scope.signUpForm.errors.errorMessage = responseL.message;
            $scope.signUpForm.errors.isError = true;
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
        if (!$scope.signUpForm.inputs.password || $scope.signUpForm.inputs.password.length == 0) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter a password';
            $scope.signUpForm.errors.password = true;
            $scope.signUpForm.errors.isError = true;
        }
        if (!$scope.signUpForm.inputs.email || $scope.signUpForm.inputs.email.length == 0) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your email';
            $scope.signUpForm.errors.email = true;
            $scope.signUpForm.errors.isError = true;
        }
        if (!$scope.signUpForm.inputs.lastName || $scope.signUpForm.inputs.lastName.length == 0) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your last name';
            $scope.signUpForm.errors.lastName = true;
            $scope.signUpForm.errors.isError = true;
        }
        if (!$scope.signUpForm.inputs.firstName || $scope.signUpForm.inputs.firstName.length == 0) {
            // set error
            $scope.signUpForm.errors.errorMessage = 'You must enter your first name';
            $scope.signUpForm.errors.firstName = true;
            $scope.signUpForm.errors.isError = true;
        }
    };
}]);