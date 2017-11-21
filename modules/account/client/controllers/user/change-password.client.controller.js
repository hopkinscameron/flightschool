'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('ChangePasswordController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the change password form data
    $scope.changePasswordForm = {
        'inputs': {
            'old': '',
            'new': '',
            'confirm': ''
        },
        'views': {
            'old': 'old',
            'new': 'new',
            'confirm': 'confirm'
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
                'message': 'Please enter a new password'
            },
            'confirm': {
                'isError': false,
                'message': 'Please enter the new password again'
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

     // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the old password view
        if (viewId == $scope.changePasswordForm.views.old) {
            // reset the error
            $scope.changePasswordForm.errors.old = false;
        }
        // if entering the new password view
        else if (viewId == $scope.changePasswordForm.views.new) {
            // reset the error
            $scope.changePasswordForm.errors.new = false;
        }
        // if entering the confirm password view
        else if (viewId == $scope.changePasswordForm.views.confirm) {
            // reset the error
            $scope.changePasswordForm.errors.confirm = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if leaving the old password view
        if (viewId == $scope.changePasswordForm.views.old) {
            // if user left field blank
            if ($scope.changePasswordForm.inputs.old.length == 0) {
                // set error
                $scope.changePasswordForm.errors.old = true;
                $scope.changePasswordForm.errors.generic.isError = true;
            }
        }
        // if leaving the new password view
        else if (viewId == $scope.changePasswordForm.views.new) {
            // if user left field blank
            if ($scope.changePasswordForm.inputs.new.length == 0) {
                // set error
                $scope.changePasswordForm.errors.new = true;
                $scope.changePasswordForm.errors.generic.isError = true;
            }
            // if password is the same as current
            else if($scope.changePasswordForm.inputs.old == $scope.changePasswordForm.inputs.new) {
                // set error
                $scope.changePasswordForm.errors.new = true;
                $scope.changePasswordForm.errors.generic.isError = true;
            }
        }
        // if leaving the confirm password view
        else if (viewId == $scope.changePasswordForm.views.confirm) {
            // if user left field blank
            if ($scope.changePasswordForm.inputs.confirm.length == 0) {
                // set error
                $scope.changePasswordForm.errors.confirm = true;
                $scope.changePasswordForm.errors.generic.isError = true;
            }
            // if passwords don't match
            else if($scope.changePasswordForm.inputs.new != $scope.changePasswordForm.inputs.confirm) {
                // set error
                $scope.changePasswordForm.errors.confirm = true;
                $scope.changePasswordForm.errors.generic.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.changePasswordForm.errors.old) {
            // set error
            $scope.changePasswordForm.errors.generic.message = 'You must enter your old password';
        }
        else if ($scope.changePasswordForm.errors.new) {
            // set error
            $scope.changePasswordForm.errors.generic.message = $scope.changePasswordForm.inputs.new.length == 0 ? 'You must enter your new password' : 'Your new password cannot be the same as your old password';
        }
        else if ($scope.changePasswordForm.errors.confirm) {
            // set error
            $scope.changePasswordForm.errors.generic.message = $scope.changePasswordForm.inputs.confirm.length == 0 ? 'You must enter your new password again' : 'The new password does not match';
        }
        else {
            // remove error
            $scope.changePasswordForm.errors.generic.message = '';
            $scope.changePasswordForm.errors.generic.isError = false;
        }
    };

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
        // check for any empty values
        $scope.changePasswordForm.errors.old.isError = !$scope.changePasswordForm.inputs.old || $scope.changePasswordForm.inputs.old.length == 0;
        $scope.changePasswordForm.errors.new.isError = !$scope.changePasswordForm.inputs.new || $scope.changePasswordForm.inputs.new.length == 0;
        $scope.changePasswordForm.errors.confirm.isError = !$scope.changePasswordForm.inputs.confirm || $scope.changePasswordForm.inputs.confirm.length == 0;
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