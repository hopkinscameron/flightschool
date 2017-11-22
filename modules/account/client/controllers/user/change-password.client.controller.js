'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('ChangePasswordController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // owasp strength test
    var owasp = $window.owaspPasswordStrengthTest;

    // holds the change password form data
    $scope.changePasswordForm = {
        'inputs': {
            'old': '',
            'new': '',
            'confirm': ''
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'old': {
                'isError': false,
                'message': 'Please enter the old password'
            },
            'new': {
                'isError': false,
                'message': 'Please enter a new password',
                'optionalMessages': ['Please enter a new password', 'New password cannot be the same as the old', `Please enter a passphrase or password with ${owasp.configs.minLength} or more characters, numbers, lowercase, uppercase, and special characters.`]
            },
            'confirm': {
                'isError': false,
                'message': 'Please enter the new password again',
                'optionalMessages': ['Please enter the new password again', 'Passwords do not match']
            }
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // holds the last password changed
    $scope.lastPasswordChanged = {
        'date': new Date('1/13/17, 10:03 AM'),
        'timeAgo': null,
        'format': null
    };

    // set the time ago and format
    $scope.lastPasswordChanged.timeAgo = $rootScope.$root.getTimeSince($scope.lastPasswordChanged.date);
    $scope.lastPasswordChanged.format = $rootScope.$root.formatDate($rootScope.$root.locale, $scope.lastPasswordChanged.date);

    // update password
    $scope.updatePassword = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.changePasswordForm.errors.old.isError && !$scope.changePasswordForm.errors.new.isError && !$scope.changePasswordForm.errors.confirm.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var changePasswordData = {
                'oldPassword': $scope.changePasswordForm.inputs.old,
                'newPassword': $scope.changePasswordForm.inputs.new,
                'confirmedPassword': $scope.changePasswordForm.inputs.confirm
            };

            // update password
            AccountFactory.updatePassword(changePasswordData).then(function (responseUP) {
                // if returned a valid response
                if(responseUP && !responseUP.error) {
                    // show success
                    swal({
                        title: 'Success!',
                        text: 'You have successfully changed your password.',
                        type: 'success',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // clear the form for security
                        resetForm();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // clear the form for security
                        resetForm();                   
                    });
                }
                else {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseUP.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show error
                        $scope.changePasswordForm.errors.generic.message = responseUP.message;
                        $scope.changePasswordForm.errors.generic.isError = true;

                        // clear the form for security
                        resetForm();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // clear the form for security
                        resetForm();                   
                    });
                }
            })
            .catch(function (responseUP) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseUP.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show error
                    $scope.changePasswordForm.errors.generic.message = responseUP.message;
                    $scope.changePasswordForm.errors.generic.isError = true;

                    // clear the form for security
                    resetForm();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.changePasswordForm.errors.generic.message = responseUP.message;
                    $scope.changePasswordForm.errors.generic.isError = true;

                    // clear the form for security
                    resetForm();               
                });
            });
        }
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.changePassword = {};

        // set the data
        $scope.changePassword.title = 'Change Password';
        $scope.changePassword.pageHeader = $scope.changePassword.title;
        $scope.changePassword.pageSubHeader = 'Oh we see you want to change your password right?';

        // holds the page title
        $scope.pageTitle = $scope.changePassword.title + ' | ' + ApplicationConfiguration.applicationName;
        
        // setup page
        setUpPage();
    };

    // sets up the page
    function setUpPage() {
        // the data to send to the parent
        var data = {
            'error': _.cloneDeep($scope.error),
            'pageTitle': _.cloneDeep($scope.pageTitle),
            'pageHeader': _.cloneDeep($scope.changePassword.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.changePassword.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // checks for any empty values
    function checkEmptyValues() {
        // get strength result
        var strengthResult = owasp.test($scope.changePasswordForm.inputs.new).errors.length;

        // check for any empty values
        $scope.changePasswordForm.errors.old.isError = !$scope.changePasswordForm.inputs.old || $scope.changePasswordForm.inputs.old.length == 0;
        $scope.changePasswordForm.errors.new.isError = !$scope.changePasswordForm.inputs.new || $scope.changePasswordForm.inputs.new.length == 0 || $scope.changePasswordForm.inputs.old == $scope.changePasswordForm.inputs.new || strengthResult;
        $scope.changePasswordForm.errors.confirm.isError = !$scope.changePasswordForm.inputs.confirm || $scope.changePasswordForm.inputs.confirm.length == 0 || $scope.changePasswordForm.inputs.new != $scope.changePasswordForm.inputs.confirm;
    
        // set specific text based on empty or equality or strong password
        if(strengthResult) {
            $scope.changePasswordForm.errors.new.message = $scope.changePasswordForm.errors.new.optionalMessages[2];
        }
        if($scope.changePasswordForm.inputs.old == $scope.changePasswordForm.inputs.new) {
            $scope.changePasswordForm.errors.new.message = $scope.changePasswordForm.errors.new.optionalMessages[1];
        }
        if(!$scope.changePasswordForm.inputs.new || $scope.changePasswordForm.inputs.new.length == 0) {
            $scope.changePasswordForm.errors.confirm.message = $scope.changePasswordForm.errors.new.optionalMessages[0];
        }
        if($scope.changePasswordForm.inputs.new != $scope.changePasswordForm.inputs.confirm) {
            $scope.changePasswordForm.errors.confirm.message = $scope.changePasswordForm.errors.confirm.optionalMessages[1];
        }
        if(!$scope.changePasswordForm.inputs.confirm || $scope.changePasswordForm.inputs.confirm.length == 0) {
            $scope.changePasswordForm.errors.confirm.message = $scope.changePasswordForm.errors.confirm.optionalMessages[0];
        }
    };

    // clear the fields
    function resetForm() {
        // set to default
        $scope.changePasswordForm.inputs.old = '';
        $scope.changePasswordForm.inputs.new = '';
        $scope.changePasswordForm.inputs.confirm = '';
        $scope.formInTransit = false;

        // force apply
        $scope.$apply()
    };
}]);