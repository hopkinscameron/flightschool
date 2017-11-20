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
            'name': 'John Doe',
            'number': 4716955713636688,
            'expirationMM': 12,
            'expirationYY': 17,
            'ccv': ''
        },
        'views': {
            'name': 'name',
            'number': 'number',
            'expirationMM': 'expirationMM',
            'expirationYY': 'expirationYY',
            'ccv': 'ccv'
        },
        'errors': {
            'errorMessage': '',
            'isError': false,
            'name': false,
            'number': false,
            'expirationMM': false,
            'expirationYY': false,
            'ccv': false
        },
        'cardType': {
            'visa': false,
            'mc': false,
            'amex': false,
            'discover': false
        }
    };

    // set the range for expiration date
    setAcceptableExpDateRange();

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
        // if entering the expirationMM view
        else if (viewId == $scope.paymentInformationForm.views.expirationMM) {
            // reset the error
            $scope.paymentInformationForm.errors.expirationMM = false;
        }
        // if entering the expirationYY view
        else if (viewId == $scope.paymentInformationForm.views.expirationYY) {
            // reset the error
            $scope.paymentInformationForm.errors.expirationYY = false;
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
            if (!$scope.paymentInformationForm.inputs.number || !matchesCCNumbers($scope.paymentInformationForm.inputs.number)) {
                // set error
                $scope.paymentInformationForm.errors.number = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
        }
        // if leaving the expirationMM view
        else if (viewId == $scope.paymentInformationForm.views.expirationMM) {
            // if user left field blank
            if (!$scope.paymentInformationForm.inputs.expirationMM) {
                // set error
                $scope.paymentInformationForm.errors.expirationMM = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
            // if valid number
            else if ($scope.paymentInformationForm.inputs.expirationMM) {
                // set two digits
                document.getElementById('expirationMM').value = $scope.paymentInformationForm.inputs.expirationMM < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationMM.toString() : $scope.paymentInformationForm.inputs.expirationMM;
            }

            // if not a valid date
            if ($scope.paymentInformationForm.inputs.expirationYY && !expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY)) {
                // set error
                $scope.paymentInformationForm.errors.expirationYY = true;
                $scope.paymentInformationForm.errors.expirationMM = true;
                $scope.paymentInformationForm.errors.isError = true;
            }

            // if valid date
            if (expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY)) {
                // set error
                $scope.paymentInformationForm.errors.expirationYY = false;
                $scope.paymentInformationForm.errors.expirationMM = false;
            }
        }
        // if leaving the expirationYY view
        else if (viewId == $scope.paymentInformationForm.views.expirationYY) {
            // if user left field blank
            if (!$scope.paymentInformationForm.inputs.expirationYY) {
                // set error
                $scope.paymentInformationForm.errors.expirationYY = true;
                $scope.paymentInformationForm.errors.isError = true;
            }
            // if valid number
            else if ($scope.paymentInformationForm.inputs.expirationMM) {
                // set two digits
                document.getElementById('expirationYY').value = $scope.paymentInformationForm.inputs.expirationYY < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationYY.toString() : $scope.paymentInformationForm.inputs.expirationYY;
            }

            // if not a valid date
            if ($scope.paymentInformationForm.inputs.expirationYY && !expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY)) {
                // set error
                $scope.paymentInformationForm.errors.expirationYY = true;
                $scope.paymentInformationForm.errors.expirationMM = true;
                $scope.paymentInformationForm.errors.isError = true;
            }

            // if valid date
            if (expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY)) {
                // set error
                $scope.paymentInformationForm.errors.expirationYY = false;
                $scope.paymentInformationForm.errors.expirationMM = false;
            }
        }
        // if leaving the ccv view
        else if (viewId == $scope.paymentInformationForm.views.ccv) {
            // get the actual value (integer value will not have leading zero)
            var actual = document.getElementById('ccv').value;

            // if user left field blank or has inccorect length
            if (!$scope.paymentInformationForm.inputs.ccv || actual.length != 3) {
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
        else if ($scope.paymentInformationForm.errors.expirationMM && $scope.paymentInformationForm.errors.expirationYY) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = `The expiration date is invalid (must be the minumum date ${$scope.acceptableDateRangeForExpiration.minMonth}/${$scope.acceptableDateRangeForExpiration.minYear})`;
        }
        else if ($scope.paymentInformationForm.errors.expirationMM) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the month for the expiration date (between 1 and 12)';
        }
        else if ($scope.paymentInformationForm.errors.expirationYY) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = `You must enter the year for the expiration date (between ${$scope.acceptableDateRangeForExpiration.minYear} and ${$scope.acceptableDateRangeForExpiration.maxYear})`;
        }
        else if ($scope.paymentInformationForm.errors.ccv) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the ccv number on the back of the card (needs to be 3 digits in length)';
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
        if(!$scope.paymentInformationForm.errors.name && !$scope.paymentInformationForm.errors.number && !$scope.paymentInformationForm.errors.expirationMM && !$scope.paymentInformationForm.errors.expirationYY && !$scope.paymentInformationForm.errors.ccv) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // the data to send
            var changePaymentInformationData = {
                'name': $scope.paymentInformationForm.inputs.name,
                'number': document.getElementById('number').value,
                'expiration': document.getElementById('expirationMM').value + document.getElementById('expirationYY').value,
                'ccv': document.getElementById('ccv').value
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
                        // get the updated information
                        $scope.paymentInformation.data = responseUPI;

                        // clear the form for security
                        resetForm();

                        // cancel out editing
                        $scope.cancelEditing();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // get the updated information
                        $scope.paymentInformation.data = responseUPI;

                        // clear the form for security
                        resetForm();
                        
                        // cancel out editing
                        $scope.cancelEditing();
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

    // edit's the card on file
    $scope.editCard = function () {
        // set editing
        $scope.editingCard = true;

        // set the form values
        $scope.paymentInformationForm.inputs.name = $scope.paymentInformation.data.name;
        $scope.paymentInformationForm.inputs.number = $scope.paymentInformation.data.number;
        $scope.paymentInformationForm.inputs.expirationMM = $scope.paymentInformation.data.expiration.substring(0, 2);
        $scope.paymentInformationForm.inputs.expirationYY = $scope.paymentInformation.data.expiration.substring(2);
        $scope.paymentInformationForm.inputs.ccv = '';
    };

    // cancel's editing
    $scope.cancelEditing = function () {
        // set editing
        $scope.editingCard = false;

        // set the form values
        $scope.paymentInformationForm.inputs.name = '';
        $scope.paymentInformationForm.inputs.number = undefined;
        $scope.paymentInformationForm.inputs.expirationMM = undefined;
        $scope.paymentInformationForm.inputs.expirationYY = undefined;
        $scope.paymentInformationForm.inputs.ccv = undefined;
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.paymentInformation = {};

        // get payment information page data
        AccountFactory.getPaymentInformationPageInformation().then(function (responsePI) {
            // if returned a valid response
            if (responsePI && !responsePI.error) {
                // set the data
                $scope.paymentInformation.data = responsePI;
                $scope.paymentInformation.title = 'Payment Information';
                $scope.paymentInformation.pageHeader = $scope.paymentInformation.title;
                $scope.paymentInformation.pageSubHeader = 'Your payment information, look okay?';

                // holds the page title
                $scope.pageTitle = $scope.paymentInformation.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responsePI.title;
                $scope.error.error = true;
                $scope.error.title = responsePI.title;
                $scope.error.status = responsePI.status;
                $scope.error.message = responsePI.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responsePI) {
            // set error
            $scope.pageTitle = responsePI.title;
            $scope.error.error = true;
            $scope.error.title = responsePI.title;
            $scope.error.status = responsePI.status;
            $scope.error.message = responsePI.message;

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
            'pageHeader': _.cloneDeep($scope.paymentInformation.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.paymentInformation.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };

    // sets acceptable date range for expiration date
    function setAcceptableExpDateRange() {
        // get next valid date
        var nextValidMonthYear = new Date();
        nextValidMonthYear.setMonth(nextValidMonthYear.getMonth() + 1);
        var minMonth = nextValidMonthYear.getMonth();
        minMonth++;
        minMonth = minMonth < 10 ? `0${minMonth.toString()}` : minMonth.toString();

        // get the next 5 years based on the next valid date
        var fiveComing = new Date(nextValidMonthYear);
        fiveComing.setFullYear(fiveComing.getFullYear() + 5);
        $scope.acceptableDateRangeForExpiration = { 
            'minMonth': parseInt(minMonth), 
            'maxMonth': 12, 
            'minYear': parseInt(nextValidMonthYear.getFullYear().toString().substring(2)), 
            'maxYear': parseInt(fiveComing.getFullYear().toString().substring(2))
        };
    };

    // checks for any empty values
    function checkEmptyValues() {
        // get the actual value (integer value will not have leading zero)
        var ccvActual = document.getElementById('ccv').value;
        var monthActual = document.getElementById('expirationMM').value;
        var yearActual = document.getElementById('expirationYY').value;

        // check for any empty values
        if (!$scope.paymentInformationForm.inputs.ccv || ccvActual.length != 3) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the ccv number on the back of the card (needs to be 3 digits in length)';
            $scope.paymentInformationForm.errors.ccv = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.expirationYY) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = `You must enter the year for the expiration date (between ${$scope.acceptableDateRangeForExpiration.minYear} and ${$scope.acceptableDateRangeForExpiration.maxYear})`;
            $scope.paymentInformationForm.errors.expirationYY = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.expirationMM) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = 'You must enter the month for the expiration date (between 1 and 12)';
            $scope.paymentInformationForm.errors.expirationMM = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY)) {
            // set error
            $scope.paymentInformationForm.errors.errorMessage = `The expiration date is invalid (must be the minumum date ${$scope.acceptableDateRangeForExpiration.minMonth}/${$scope.acceptableDateRangeForExpiration.minYear})`;
            $scope.paymentInformationForm.errors.expirationYY = true;
            $scope.paymentInformationForm.errors.expirationMM = true;
            $scope.paymentInformationForm.errors.isError = true;
        }
        if (!$scope.paymentInformationForm.inputs.number || !matchesCCNumbers($scope.paymentInformationForm.inputs.number)) {
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

    // determines if cc number matches accetable cc types/numbers
    function matchesCCNumbers(value) {
        var visa = $scope.paymentInformationForm.cardType.visa = $rootScope.$root.visaRegex.test(value);
        var mc = $scope.paymentInformationForm.cardType.mc = $rootScope.$root.masterCardRegex.test(value);
        var amex = $scope.paymentInformationForm.cardType.amex = $rootScope.$root.americanExpressRegex.test(value);
        var discover = $scope.paymentInformationForm.cardType.discover = $rootScope.$root.discoverRegex.test(value);

        return visa || mc || amex || discover;
    };

    // determines if expiration date is valid
    function expDateVaild(month, year) {
        // if value doesn't exist
        if(!month || !year) {
            return false;
        }

        return month >= $scope.acceptableDateRangeForExpiration.minMonth && year >= $scope.acceptableDateRangeForExpiration.minYear;
    };

    // clear the fields
    function resetForm() {
        // set to default
        $scope.paymentInformationForm.inputs.ccv = undefined;
        $scope.formInTransit = false;

        // force apply
        $scope.$apply()
    };

    // clear the fields completely
    function resetFormCompletely() {
        // set to default
        $scope.paymentInformationForm.inputs.name = '';
        $scope.paymentInformationForm.inputs.number = undefined;
        $scope.paymentInformationForm.inputs.expirationMM = undefined;
        $scope.paymentInformationForm.inputs.expirationYY = undefined;
        $scope.paymentInformationForm.inputs.ccv = undefined;
        $scope.formInTransit = false;

        // force apply
        $scope.$apply()
    };
}]);