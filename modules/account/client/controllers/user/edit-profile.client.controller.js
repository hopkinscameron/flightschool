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
        'selected': $scope.initialText,
        'options': [$scope.initialText, 'Male', 'Female']
    };

    // holds the profile form data
    $scope.profileForm = {
        'inputs': {
            'first': '',
            'last': '',
            'phone': '',
            'email': ''
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'first': {
                'isError': false,
                'message': 'Please enter your first name'
            },
            'last': {
                'isError': false,
                'message': 'Please enter your last name'
            },
            'sex': {
                'isError': false,
                'message': 'Please enter your sex'
            },
            'phone': {
                'isError': false,
                'message': 'Please enter your phone number'
            },
            'email': {
                'isError': false,
                'message': 'Please enter your email'
            }
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // update profile
    $scope.updateProfile = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.profileForm.errors.first.isError && !$scope.profileForm.errors.last.isError && !$scope.profileForm.errors.sex.isError && !$scope.profileForm.errors.phone.isError && !$scope.profileForm.errors.email.isError) {
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
                        $scope.$apply();
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
                        $scope.profileForm.errors.generic.message = responseUP.message;
                        $scope.profileForm.errors.generic.isError = true;

                        // show the form is no longer in transit
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show error
                        $scope.profileForm.errors.generic.message = responseUP.message;
                        $scope.profileForm.errors.generic.isError = true;

                        // show the form is no longer in transit
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();                 
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
                    $scope.profileForm.errors.generic.message = responseUP.message;
                    $scope.profileForm.errors.generic.isError = true;

                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.profileForm.errors.generic.message = responseUP.message;
                    $scope.profileForm.errors.generic.isError = true;

                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();                 
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
                
                // set form values
                $scope.profileForm.inputs.first = $scope.editProfile.data.firstName;
                $scope.profileForm.inputs.last = $scope.editProfile.data.lastName;
                $scope.sexOptions.selected = $scope.editProfile.data.sex.charAt(0).toUpperCase() + $scope.editProfile.data.sex.slice(1);
                $scope.profileForm.inputs.phone = $scope.editProfile.data.phone;
                $scope.profileForm.inputs.email = $scope.editProfile.data.email;

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
        $scope.profileForm.errors.first.isError = !$scope.profileForm.inputs.first || $scope.profileForm.inputs.first.length == 0;
        $scope.profileForm.errors.last.isError = !$scope.profileForm.inputs.last || $scope.profileForm.inputs.last.length == 0;
        $scope.profileForm.errors.sex.isError = !$scope.sexOptions.selected || $scope.sexOptions.selected.length == 0 || $scope.sexOptions.selected == $scope.initialText;
        $scope.profileForm.errors.phone.isError = !$scope.profileForm.inputs.phone || $scope.profileForm.inputs.phone.length == 0;
        $scope.profileForm.errors.email.isError = !$scope.profileForm.inputs.email || $scope.profileForm.inputs.email.length == 0;
    };
}]);