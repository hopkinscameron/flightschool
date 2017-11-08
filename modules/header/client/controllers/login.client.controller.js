'use strict'

// set up the module
var loginModule = angular.module('login');

// create the controller
loginModule.controller('LoginController', ['$scope', '$rootScope', 'LoginFactory', function ($scope, $rootScope, LoginFactory) {
    // holds the login form data
    $scope.loginForm = {
        'formSubmitted': false,
        'inputs': {
            'username': '',
            'password': ''
        },
        'views': {
            'username': 'username',
            'password': 'password'
        },
        'errors': {
            'errorMessage': '',
            'isError': false,
            'username': false,
            'password': false
        }
    };

    // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the username view
        if (viewId == $scope.loginForm.views.username) {
            // reset the error
            $scope.loginForm.errors.username = false;
        }
        // if entering the password view
        else if (viewId == $scope.loginForm.views.password) {
            // reset the error
            $scope.loginForm.errors.password = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if entering the username view
        if (viewId == $scope.loginForm.views.username) {
            // if user left field blank
            if ($scope.loginForm.inputs.username.length == 0) {
                // set error
                $scope.loginForm.errors.username = true;
                $scope.loginForm.errors.isError = true;
            }
        }
        // if entering the password view
        else if (viewId == $scope.loginForm.views.password) {
            // if user left field blank
            if ($scope.loginForm.inputs.password.length == 0) {
                // set error
                $scope.loginForm.errors.password = true;
                $scope.loginForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.loginForm.errors.username) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter the username';
        }
        else if ($scope.loginForm.errors.password) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter the password';
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
        if(!$scope.loginForm.errors.username && !$scope.loginForm.errors.password) {
            // disable button but showing the form has been submitted
            $scope.loginForm.formSubmitted = true;

            // the data to send
            var loginData = {
                'username': $scope.loginForm.inputs.username,
                'password': $scope.loginForm.inputs.password
            };

            // login
            LoginFactory.login(loginData).then(function (responseL) {
                // if no error
                if(!responseL.error) {
                    // refresh header
                    $rootScope.$emit('refreshHeader', {});
                }
                else {
                    // show error
                    $scope.loginForm.errors.errorMessage = responseL.message;
                    $scope.loginForm.errors.isError = true;
                    $scope.loginForm.formSubmitted = false;
                }
            })
            .catch(function (responseL) {
                // show error
                $scope.loginForm.errors.errorMessage = responseL.message;
                $scope.loginForm.errors.isError = true;
                $scope.loginForm.formSubmitted = false;
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
        if (!$scope.loginForm.inputs.username || $scope.loginForm.inputs.username.length == 0) {
            // set error
            $scope.loginForm.errors.errorMessage = 'You must enter your username';
            $scope.loginForm.errors.username = true;
            $scope.loginForm.errors.isError = true;
        }
    };
}]);