'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('PaymentInformationController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the payment information form data
    $scope.paymentInformationForm = {
        'inputs': {
            'name': '',
            'number': '',
            'expiration': '',
            'ccv': ''
        },
        'views': {
            'name': 'name',
            'number': 'number',
            'expiration': 'expiration',
            'ccv': 'ccv'
        },
        'errors': {
            'errorMessage': '',
            'isError': false,
            'name': false,
            'number': false,
            'expiration': false,
            'ccv': false
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

     // on call event when the focus enters
    $scope.viewFocusEnter = function (viewId) {
        // if entering the name view
        if (viewId == $scope.paymentInformationForm.views.name) {
            // reset the error
            $scope.paymentInformationForm.errors.name = false;
        }
        // if entering the number view
        else if (viewId == $scope.paymentInformationForm.views.number) {
            // reset the error
            $scope.paymentInformationForm.errors.number = false;
        }
        // if entering the expiration view
        else if (viewId == $scope.paymentInformationForm.views.expiration) {
            // reset the error
            $scope.paymentInformationForm.errors.expiration = false;
        }
        // if entering the ccv view
        else if (viewId == $scope.paymentInformationForm.views.ccv) {
            // reset the error
            $scope.paymentInformationForm.errors.ccv = false;
        }
    };

    // on call event when the focus leaves
    $scope.viewFocusLeave = function (viewId) {
        // if leaving the name view
        if (viewId == $scope.paymentInformationForm.views.name) {
            // if user left field blank
            if ($scope.paymentInformationForm.inputs.name.length == 0) {
                // set error
                $scope.paymentInformationForm.errors.name = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
        }
        // if leaving the number view
        else if (viewId == $scope.paymentInformationForm.views.number) {
            // if user left field blank
            if ($scope.paymentInformationForm.inputs.number.length == 0) {
                // set error
                $scope.paymentInformationForm.errors.number = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
        }
        // if leaving the expiration view
        else if (viewId == $scope.paymentInformationForm.views.expiration) {
            // if user left field blank
            if ($scope.paymentInformationForm.inputs.expiration.length == 0) {
                // set error
                $scope.paymentInformationForm.errors.expiration = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
        }
        // if leaving the ccv view
        else if (viewId == $scope.paymentInformationForm.views.ccv) {
            // if user left field blank
            if ($scope.paymentInformationForm.inputs.ccv.length == 0) {
                // set error
                $scope.paymentInformationForm.errors.ccv = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
        }
        
        // check to see if there is an error
        if ($scope.paymentInformationForm.errors.name) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the name on the card';
        }
        else if ($scope.paymentInformationForm.errors.number) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the 16 digit number on the front of the card';
        }
        else if ($scope.paymentInformationForm.errors.expiration) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the expiration date';
        }
        else if ($scope.paymentInformationForm.errors.ccv) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the ccv number on the back of the card';
        }
        else {
            // remove error
            $scope.paymentInformationForm.errors.errorMessage = '';
            $scope.paymentInformationForm.errors.isError = false;
        }
    };

    // update payment information
    $scope.updatePaymentInformation = function () {
        // check for empty values
        checkEmptyValues();

        // check if an error exists
        if(!$scope.paymentInformationForm.errors.name && !$scope.paymentInformationForm.errors.number && !$scope.paymentInformationForm.errors.expiration && !$scope.paymentInformationForm.errors.ccv) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var changePaymentInformationData = {
                'name': $scope.paymentInformationForm.inputs.name,
                'number': $scope.paymentInformationForm.inputs.number,
                'expiration': $scope.paymentInformationForm.inputs.expiration,
                'ccv': $scope.paymentInformationForm.inputs.ccv
            };

            // update payment information
            AccountFactory.updatePaymentInformation(changePaymentInformationData).then(function (responseUPI) {
                // if returned a valid response
                if(responseUPI && !responseUPI.error) {
                    // show success
                    swal({
                        title: 'Success!',
                        text: 'You have successfully updated the payment information.',
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
                        text: 'Sorry! There was an error: ' + responseUPI.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show error
                        $scope.paymentInformationForm.errors.errorMessage = responseUPI.message;
                        $scope.paymentInformationForm.errors.isError = true;

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
            .catch(function (responseUPI) {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseUPI.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show error
                    $scope.paymentInformationForm.errors.errorMessage = responseUPI.message;
                    $scope.paymentInformationForm.errors.isError = true;

                    // clear the form for security
                    resetForm();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.paymentInformationForm.errors.errorMessage = responseUPI.message;
                    $scope.paymentInformationForm.errors.isError = true;

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
        $scope.paymentInformation = {};

        // set the data
        $scope.paymentInformation.title = 'Payment Information';
        $scope.paymentInformation.pageHeader = $scope.paymentInformation.title;
        $scope.paymentInformation.pageSubHeader = 'Your payment information, look okay?';

        // holds the page title
        $scope.pageTitle = $scope.paymentInformation.title + ' | ' + ApplicationConfiguration.applicationName;

        // populate the form
        $scope.paymentInformationForm.inputs.name = $scope.paymentInformation.name ? $scope.paymentInformation.name : '';
        $scope.paymentInformationForm.inputs.number = $scope.paymentInformation.number ? $scope.paymentInformation.number : '';
        $scope.paymentInformationForm.inputs.expiration = $scope.paymentInformation.expiration ? $scope.paymentInformation.expiration : '';
        
        // setup page
        setUpPage();
    };

    // sets up the page
    function setUpPage() {
        // the data to send to the parent
        var data = {
            'error': _.cloneDeep($scope.error),
            'pageTitle': _.cloneDeep($scope.pageTitle),
            'pageHeader': _.cloneDeep($scope.paymentInformation.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.paymentInformation.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // checks for any empty values
    function checkEmptyValues() {
        // check for any empty values
        if (!$scope.paymentInformationForm.inputs.ccv || $scope.paymentInformationForm.inputs.ccv.length == 0) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the ccv number on the back of the card';
            $scope.paymentInformationForm.errors.ccv = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.expiration || $scope.paymentInformationForm.inputs.expiration.length == 0) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the expiration date';
            $scope.paymentInformationForm.errors.expiration = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.number || $scope.paymentInformationForm.inputs.number.length == 0) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the 16 digit number on the front of the card';
            $scope.paymentInformationForm.errors.number = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.name || $scope.paymentInformationForm.inputs.name.length == 0) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the name on the card';
            $scope.paymentInformationForm.errors.name = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
    };

    // clear the fields
    function resetForm() {
        // set to default
        $scope.paymentInformationForm.inputs.ccv = '';
        $scope.formInTransit = false;

        // force apply
        $scope.$apply()
    };
}]);