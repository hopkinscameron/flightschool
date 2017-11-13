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
            'errorMessage': '',
            'isError': false,
            'old': false,
            'new': false,
            'confirm': false
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
                $scope.changePasswordForm.errors.isError = true;
            }
        }
        // if leaving the new password view
        else if (viewId == $scope.changePasswordForm.views.new) {
            // if user left field blank
            if ($scope.changePasswordForm.inputs.new.length == 0) {
                // set error
                $scope.changePasswordForm.errors.new = true;
                $scope.changePasswordForm.errors.isError = true;
            }
            // if password is the same as current
            else if($scope.changePasswordForm.inputs.old == $scope.changePasswordForm.inputs.new) {
                // set error
                $scope.changePasswordForm.errors.new = true;
                $scope.changePasswordForm.errors.isError = true;
            }
        }
        // if leaving the confirm password view
        else if (viewId == $scope.changePasswordForm.views.confirm) {
            // if user left field blank
            if ($scope.changePasswordForm.inputs.confirm.length == 0) {
                // set error
                $scope.changePasswordForm.errors.confirm = true;
                $scope.changePasswordForm.errors.isError = true;
            }
            // if passwords don't match
            else if($scope.changePasswordForm.inputs.new != $scope.changePasswordForm.inputs.confirm) {
                // set error
                $scope.changePasswordForm.errors.confirm = true;
                $scope.changePasswordForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.changePasswordForm.errors.old) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = 'You must enter your old password';
        }
        else if ($scope.changePasswordForm.errors.new) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = $scope.changePasswordForm.inputs.new.length == 0 ? 'You must enter your new password' : 'Your new password cannot be the same as your old password';
        }
        else if ($scope.changePasswordForm.errors.confirm) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = $scope.changePasswordForm.inputs.confirm.length == 0 ? 'You must enter your new password again' : 'The new password does not match';
        }
        else {
            // remove error
            $scope.changePasswordForm.errors.errorMessage = '';
            $scope.changePasswordForm.errors.isError = false;
        }
    };

    // update password
    $scope.updatePassword = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.changePasswordForm.errors.old && !$scope.changePasswordForm.errors.new && !$scope.changePasswordForm.errors.confirm) {
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
                        $scope.changePasswordForm.errors.errorMessage = responseUP.message;
                        $scope.changePasswordForm.errors.isError = true;

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
                    $scope.changePasswordForm.errors.errorMessage = responseUP.message;
                    $scope.changePasswordForm.errors.isError = true;

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

        // get change new page data
        AccountFactory.getChangePasswordPageInformation().then(function (responseCP) {
            // if returned a valid response
            if (responseCP && !responseCP.error) {
                // set the data
                $scope.changePassword.data = responseCP;
                $scope.changePassword.title = 'Change Password';
                $scope.changePassword.pageHeader = $scope.changePassword.title;
                $scope.changePassword.pageSubHeader = 'Oh we see you want to change your password right?';

                // holds the page title
                $scope.pageTitle = $scope.changePassword.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseCP.title;
                $scope.error.error = true;
                $scope.error.title = responseCP.title;
                $scope.error.status = responseCP.status;
                $scope.error.message = responseCP.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseCP) {
            // set error
            $scope.pageTitle = responseCP.title;
            $scope.error.error = true;
            $scope.error.title = responseCP.title;
            $scope.error.status = responseCP.status;
            $scope.error.message = responseCP.message;

            // setup page
            setUpPage();
        });
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
        if (!$scope.changePasswordForm.inputs.confirm || $scope.changePasswordForm.inputs.confirm.length == 0) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = $scope.changePasswordForm.inputs.confirm.length == 0 ? 'You must enter your new password again' : 'The new password does not match';
            $scope.changePasswordForm.errors.confirm = true;
            $scope.changePasswordForm.errors.isError = true;
        }
        if (!$scope.changePasswordForm.inputs.new || $scope.changePasswordForm.inputs.new.length == 0) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = $scope.changePasswordForm.inputs.new.length == 0 ? 'You must enter your new password' : 'Your new password cannot be the same as your old password';
            $scope.changePasswordForm.errors.new = true;
            $scope.changePasswordForm.errors.isError = true;
        }
        if (!$scope.changePasswordForm.inputs.old || $scope.changePasswordForm.inputs.old.length == 0) {
            // set error
            $scope.changePasswordForm.errors.errorMessage = 'You must enter your old password';
            $scope.changePasswordForm.errors.old = true;
            $scope.changePasswordForm.errors.isError = true;
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