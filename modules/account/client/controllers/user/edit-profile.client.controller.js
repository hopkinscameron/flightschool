'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('EditProfileController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // the initial text of a dropdown
    $scope.initialText = 'Select One';

    // the sex options
    $scope.sexOptions = {
        'selected': 'Male', //$scope.initialText
        'options': [$scope.initialText, 'Male', 'Female']
    };

    // holds the profile form data
    $scope.profileForm = {
        'inputs': {
            'first': 'John',
            'last': 'Does',
            'phone': '555-555-5555',
            'email': 'example@example.com'
        },
        'views': {
            'first': 'first',
            'last': 'last',
            'phone': 'phone',
            'email': 'email'
        },
        'errors': {
            'errorMessage': '',
            'isError': false,
            'first': false,
            'last': false,
            'phone': false,
            'email': false
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

     // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the first name view
        if (viewId == $scope.profileForm.views.first) {
            // reset the error
            $scope.profileForm.errors.first = false;
        }
        // if entering the last name view
        else if (viewId == $scope.profileForm.views.last) {
            // reset the error
            $scope.profileForm.errors.last = false;
        }
        // if entering the sex view
        else if (viewId == $scope.profileForm.views.sex) {
            // reset the error
            $scope.profileForm.errors.sex = false;
        }
        // if entering the phone number view
        else if (viewId == $scope.profileForm.views.phone) {
            // reset the error
            $scope.profileForm.errors.phone = false;
        }
        // if entering the email view
        else if (viewId == $scope.profileForm.views.email) {
            // reset the error
            $scope.profileForm.errors.email = false;
        }

        // check if there are any other errors
        if(!$scope.profileForm.errors.first && !$scope.profileForm.errors.last && !$scope.profileForm.errors.sex && !$scope.profileForm.errors.phone && !$scope.profileForm.errors.email) {
            // remove error
            $scope.profileForm.errors.errorMessage = '';
            $scope.profileForm.errors.isError = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if leaving the first name view
        if (viewId == $scope.profileForm.views.first) {
            // if user left field blank
            if ($scope.profileForm.inputs.first.length == 0) {
                // set error
                $scope.profileForm.errors.first = true;
                $scope.profileForm.errors.isError = true;
            }
        }
        // if leaving the last name view
        else if (viewId == $scope.profileForm.views.last) {
            // if user left field blank
            if ($scope.profileForm.inputs.last.length == 0) {
                // set error
                $scope.profileForm.errors.last = true;
                $scope.profileForm.errors.isError = true;
            }
        }
        // if leaving the sex view
        else if (viewId == $scope.profileForm.views.sex) {
            // if user left field blank
            if ($scope.profileForm.inputs.sex.length == 0) {
                // set error
                $scope.profileForm.errors.sex = true;
                $scope.profileForm.errors.isError = true;
            }
        }
        // if leaving the phone number view
        else if (viewId == $scope.profileForm.views.phone) {
            // if user left field blank
            if ($scope.profileForm.inputs.phone.length == 0) {
                // set error
                $scope.profileForm.errors.phone = true;
                $scope.profileForm.errors.isError = true;
            }
            // if not correct format
            else if(!$rootScope.$root.phoneRegex.test($scope.profileForm.inputs.phone)) {
                // set error
                $scope.profileForm.errors.phone = true;
                $scope.profileForm.errors.isError = true;
            }
        }
        // if leaving the email view
        else if (viewId == $scope.profileForm.views.email) {
            // if user left field blank
            if (!$scope.profileForm.inputs.email || $scope.profileForm.inputs.email.length == 0) {
                // set error
                $scope.profileForm.errors.email = true;
                $scope.profileForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.profileForm.errors.first) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your first name';
        }
        else if ($scope.profileForm.errors.last) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your last name';
        }
        else if ($scope.profileForm.errors.sex) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must select your sex';
        }
        else if ($scope.profileForm.errors.phone) {
            // set error
            $scope.profileForm.errors.errorMessage = $scope.profileForm.inputs.phone.length == 0 ? 'You must enter your phone number' : 'Not a valid phone number';
        }
        else if ($scope.profileForm.errors.email) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your email';
        }
        else {
            // remove error
            $scope.profileForm.errors.errorMessage = '';
            $scope.profileForm.errors.isError = false;
        }
    };

    // check the dropdown selection
    $scope.checkSelection = function (viewId) {
        // if entering the service view
        if (viewId == $scope.profileForm.views.sex) {
            // if user left field blank
            if (!$scope.sexOptions.selected || $scope.sexOptions.selected.length == 0 || $scope.sexOptions.selected == $scope.initialText) {
                // set error
                $scope.profileForm.errors.sex = true;
                $scope.profileForm.errors.isError = true;
            }
            else {
                // delete error
                $scope.profileForm.errors.sex = false;
            }
        }

        // check to see if there is an error
        if ($scope.profileForm.errors.sex) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must select a sex';
        }
        // check if there are any other errors
        else if(!$scope.profileForm.errors.first && !$scope.profileForm.errors.last && !$scope.profileForm.errors.sex && !$scope.profileForm.errors.phone && !$scope.profileForm.errors.email) {
            // delete error
            $scope.profileForm.errors.errorMessage = '';
            $scope.profileForm.errors.isError = false;
        }
    };

    // update profile
    $scope.updateProfile = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.profileForm.errors.first && !$scope.profileForm.errors.last && !$scope.profileForm.errors.sex && !$scope.profileForm.errors.phone && !$scope.profileForm.errors.email) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var profileData = {
                'firstName': $scope.profileForm.inputs.first,
                'lastName': $scope.profileForm.inputs.last,
                'sex': $scope.sexOptions.selected,
                'phone': $scope.profileForm.inputs.phone,
                'email': $scope.profileForm.inputs.email
            };

            // update profile
            AccountFactory.updateProfile(profileData).then(function (responseUP) {
                // if returned a valid response
                if(responseUP && !responseUP.error) {
                    // show success
                    swal({
                        title: 'Success!',
                        text: 'You have successfully updated your profile.',
                        type: 'success',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show the form is no longer in transit
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply()
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
                        $scope.profileForm.errors.errorMessage = responseUP.message;
                        $scope.profileForm.errors.isError = true;

                        // show the form is no longer in transit
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply()
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
                    $scope.profileForm.errors.errorMessage = responseUP.message;
                    $scope.profileForm.errors.isError = true;

                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply()
                });
            });
        }
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.editProfile = {};

        // get edit profile page data
        AccountFactory.getEditProfilePageInformation().then(function (responseEP) {
            // if returned a valid response
            if (responseEP && !responseEP.error) {
                // set the data
                $scope.editProfile.data = responseEP;
                $scope.editProfile.title = 'Edit Profile';
                $scope.editProfile.pageHeader = $scope.editProfile.title;
                $scope.editProfile.pageSubHeader = 'Something not right with your profile?';

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
    };

    // sets up the page
    function setUpPage() {
        // the data to send to the parent
        var data = {
            'error': _.cloneDeep($scope.error),
            'pageTitle': _.cloneDeep($scope.pageTitle),
            'pageHeader': _.cloneDeep($scope.editProfile.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.editProfile.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // checks for any empty values
    function checkEmptyValues() {
        // check for any empty values
        if (!$scope.profileForm.inputs.email || $scope.profileForm.inputs.email.length == 0) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your email';
            $scope.profileForm.errors.email = true;
            $scope.profileForm.errors.isError = true;
        }
        if (!$scope.profileForm.inputs.phone || $scope.profileForm.inputs.phone.length == 0) {
            // set error
            $scope.profileForm.errors.errorMessage = $scope.profileForm.inputs.phone.length == 0 ? 'You must enter your phone number' : 'Not a valid phone number';
            $scope.profileForm.errors.phone = true;
            $scope.profileForm.errors.isError = true;
        }
        if (!$scope.sexOptions.selected || $scope.sexOptions.selected.length == 0 || $scope.sexOptions.selected == $scope.initialText) {
            // set error
            $scope.serviceForm.errors.errorMessage = 'You must select a sex';
            $scope.serviceForm.errors.sex = true;
            $scope.serviceForm.errors.isError = true;
        }
        if (!$scope.profileForm.inputs.last || $scope.profileForm.inputs.last.length == 0) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your last name';
            $scope.profileForm.errors.last = true;
            $scope.profileForm.errors.isError = true;
        }
        if (!$scope.profileForm.inputs.first || $scope.profileForm.inputs.first.length == 0) {
            // set error
            $scope.profileForm.errors.errorMessage = 'You must enter your first name';
            $scope.profileForm.errors.first = true;
            $scope.profileForm.errors.isError = true;
        }
    };
}]);