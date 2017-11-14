'use strict'

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('LoginController', ['$scope', '$rootScope', 'LoginFactory', function ($scope, $rootScope, LoginFactory) {
    // holds the login form data
    $scope.loginForm = {
        'inputs': {
            'email': 'john.doe@example.com',
            'password': 'password',
            'rememberMe': false
        },
        'views': {
            'email': 'email',
            'password': 'password'
        },
        'errors': {
            'errorMessage': '',
            'isError': false,
            'email': false,
            'password': false
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the email view
        if (viewId == $scope.loginForm.views.email) {
            // reset the error
            $scope.loginForm.errors.email = false;
        }
        // if entering the password view
        else if (viewId == $scope.loginForm.views.password) {
            // reset the error
            $scope.loginForm.errors.password = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if leaving the email view
        if (viewId == $scope.loginForm.views.email) {
            // if user left field blank
            if ($scope.loginForm.inputs.email.length == 0) {
                // set error
                $scope.loginForm.errors.email = true;
                $scope.loginForm.errors.isError = true;
            }
        }
        // if leaving the password view
        else if (viewId == $scope.loginForm.views.password) {
            // if user left field blank
            if ($scope.loginForm.inputs.password.length == 0) {
                // set error
                $scope.loginForm.errors.password = true;
                $scope.loginForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.loginForm.errors.email) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter your email';
        }
        else if ($scope.loginForm.errors.password) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter your password';
        }
        else {
            // remove error
            $scope.loginForm.errors.errorMessage = '';
            $scope.loginForm.errors.isError = false;
        }
    };

    // login
    $scope.login = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.loginForm.errors.email && !$scope.loginForm.errors.password) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var loginData = {
                'email': $scope.loginForm.inputs.email,
                'password': $scope.loginForm.inputs.password
            };

            // login
            LoginFactory.login(loginData).then(function (responseL) {
                // if returned a valid response
                if(responseL && !responseL.error) {
                    // refresh header
                    $rootScope.$emit('refreshHeader', {});
                }
                else {
                    // show error
                    $scope.loginForm.errors.errorMessage = responseL.message;
                    $scope.loginForm.errors.isError = true;
                    $scope.formInTransit = false;
                }
            })
            .catch(function (responseL) {
                // show error
                $scope.loginForm.errors.errorMessage = responseL.message;
                $scope.loginForm.errors.isError = true;
                $scope.formInTransit = false;
            });
        }
    };

    // checks for any empty values
    function checkEmptyValues() {
        // check for any empty values
        if (!$scope.loginForm.inputs.password || $scope.loginForm.inputs.password.length == 0) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter your password';
            $scope.loginForm.errors.password = true;
            $scope.loginForm.errors.isError = true;
        }
        if (!$scope.loginForm.inputs.email || $scope.loginForm.inputs.email.length == 0) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter your email';
            $scope.loginForm.errors.email = true;
            $scope.loginForm.errors.isError = true;
        }
    };
}]);