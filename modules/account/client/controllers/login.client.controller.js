'use strict'

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('LoginController', ['$scope', '$rootScope', '$window', 'LoginFactory', function ($scope, $rootScope, $window, LoginFactory) {
    // holds the login form data
    $scope.loginForm = {
        'inputs': {
            'email': 'john.doe@example.com',
            'password': 'password',
            'rememberMe': false
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'email': {
                'isError': false,
                'message': 'Please enter your email'
            },
            'password': {
                'isError': false,
                'message': 'Please enter your password'
            }
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // login
    $scope.login = function () {
        // check for any errors in the values
        checkErrorValues();

        // check if an error exists
        if(!$scope.loginForm.errors.email.isError && !$scope.loginForm.errors.password.isError) {
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
                    $window.location.reload();

                    // clear the form for security
                    $scope.loginForm.inputs.email = '';
                    $scope.loginForm.inputs.password = '';
                }
                else {
                    // show error
                    $scope.loginForm.errors.generic.message = responseL.message;
                    $scope.loginForm.errors.generic.isError = true;
                    
                    // clear the form for security
                    resetForm();
                }
            })
            .catch(function (responseL) {
                // show error
                $scope.loginForm.errors.generic.message = responseL.message;
                $scope.loginForm.errors.generic.isError = true;
                $scope.formInTransit = false;

                // clear the form for security
                resetForm();
            });
        }
    };

    // checks for any errors in the values
    function checkErrorValues() {
        // check for any empty values
        $scope.loginForm.errors.email.isError = !$scope.loginForm.inputs.email || $scope.loginForm.inputs.email.length == 0;
        $scope.loginForm.errors.password.isError = !$scope.loginForm.inputs.password || $scope.loginForm.inputs.password.length == 0;
    };

    // clear the fields
    function resetForm() {
        // set to default
        $scope.loginForm.inputs.password = '';
        $scope.formInTransit = false;
    };
}]);