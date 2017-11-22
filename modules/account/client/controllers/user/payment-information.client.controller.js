'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('PaymentInformationController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // set the range for expiration date
    setAcceptableExpDateRange();

    // holds the payment information form data
    $scope.paymentInformationForm = {
        'inputs': {
            /*
            'name': '',
            'number': undefined,
            'expirationMM': undefined,
            'expirationYY': undefined,
            'ccv': undefined
            */
            'name': 'John Doe',
            'number': 4716955713636688,
            'expirationMM': 12,
            'expirationYY': 17,
            'ccv': ''
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'name': {
                'isError': false,
                'message': 'Please enter the name on the card'
            },
            'number': {
                'isError': false,
                'message': 'Please enter the 16 digit card number'
            },
            'expirationMM': {
                'isError': false,
                'message': 'Please enter the expiration month (01-12)'
            },
            'expirationYY': {
                'isError': false,
                'message': `Please enter the expiration year (${$scope.acceptableDateRangeForExpiration.minYear}-${$scope.acceptableDateRangeForExpiration.maxYear})`
            },
            'ccv': {
                'isError': false,
                'message': 'Please enter the ccv number on the back of the card'
            }
        },
        'cardType': {
            'visa': false,
            'mc': false,
            'amex': false,
            'discover': false
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // update payment information
    $scope.updatePaymentInformation = function () {
        // check for any errors in the values
        checkErrorValues();

        // check if an error exists
        if(!$scope.paymentInformationForm.errors.name.isError && !$scope.paymentInformationForm.errors.number.isError && !$scope.paymentInformationForm.errors.expirationMM.isError && !$scope.paymentInformationForm.errors.expirationYY.isError && !$scope.paymentInformationForm.errors.ccv.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // get the two digit version of both the month and year
            var twoDigitMonth = $scope.paymentInformationForm.inputs.expirationMM < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationMM.toString() : $scope.paymentInformationForm.inputs.expirationMM.toString();
            var twoDigitYear = $scope.paymentInformationForm.inputs.expirationYY < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationYY.toString() : $scope.paymentInformationForm.inputs.expirationYY.toString();

            // the data to send
            var changePaymentInformationData = {
                'name': $scope.paymentInformationForm.inputs.name,
                'number': document.getElementById('number').value,
                'expiration': twoDigitMonth + twoDigitYear,
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

                        // cancel out editing
                        $scope.cancelEditing();

                        // clear the form for security
                        resetForm();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // get the updated information
                        $scope.paymentInformation.data = responseUPI;

                        // cancel out editing
                        $scope.cancelEditing();

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
                        $scope.paymentInformationForm.errors.generic.message = responseUPI.message;
                        $scope.paymentInformationForm.errors.generic.isError = true;

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
                    $scope.paymentInformationForm.errors.generic.message = responseUPI.message;
                    $scope.paymentInformationForm.errors.generic.isError = true;

                    // clear the form for security
                    resetForm();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.paymentInformationForm.errors.generic.message = responseUPI.message;
                    $scope.paymentInformationForm.errors.generic.isError = true;

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
        $scope.paymentInformationForm.inputs.number = parseInt($scope.paymentInformation.data.number);
        $scope.paymentInformationForm.inputs.expirationMM = parseInt($scope.paymentInformation.data.expiration.substring(0, 2));
        $scope.paymentInformationForm.inputs.expirationYY = parseInt($scope.paymentInformation.data.expiration.substring(2));
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
                $scope.paymentInformation.pageSubHeader = $scope.paymentInformation.data.cardOnFile ? 'Your payment information, look okay?' : 'Looks like you haven\'t set up a payment method yet';

                // if there is a card on file
                if($scope.paymentInformation.data.cardOnFile) {
                    // set the last 4 digits and delete the full number
                    $scope.paymentInformation.data.lastFour = $scope.paymentInformation.data.number.substring($scope.paymentInformation.data.number.length - 4);
                }

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

    // checks for any errors in the values
    function checkErrorValues() {
        // get the actual value (integer value will not have leading zero)
        var ccvActual = document.getElementById('ccv').value;
        var monthActual = document.getElementById('expirationMM').value;
        var yearActual = document.getElementById('expirationYY').value;

        // check for any empty values
        $scope.paymentInformationForm.errors.name.isError = !$scope.paymentInformationForm.inputs.name || $scope.paymentInformationForm.inputs.name.length == 0;
        $scope.paymentInformationForm.errors.number.isError = !$scope.paymentInformationForm.inputs.number || !matchesCCNumbers($scope.paymentInformationForm.inputs.number);
        $scope.paymentInformationForm.errors.expirationMM.isError = !expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY);
        $scope.paymentInformationForm.errors.expirationYY.isError = !expDateVaild($scope.paymentInformationForm.inputs.expirationMM, $scope.paymentInformationForm.inputs.expirationYY);
        $scope.paymentInformationForm.errors.ccv.isError = !$scope.paymentInformationForm.inputs.ccv || ccvActual.length != 3;

        // set two digits if valid
        if($scope.paymentInformationForm.inputs.expirationMM) {
            document.getElementById('expirationMM').value = $scope.paymentInformationForm.inputs.expirationMM < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationMM.toString() : $scope.paymentInformationForm.inputs.expirationMM;
        }
        if($scope.paymentInformationForm.inputs.expirationYY) {
            document.getElementById('expirationYY').value = $scope.paymentInformationForm.inputs.expirationYY < 10 ? '0' + $scope.paymentInformationForm.inputs.expirationYY.toString() : $scope.paymentInformationForm.inputs.expirationYY;
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

        // year must be greater than minium year or year must be the minimum year and the month has to be greater than the current month of the minimum year
        return year > $scope.acceptableDateRangeForExpiration.minYear || (month >= $scope.acceptableDateRangeForExpiration.minMonth && year >= $scope.acceptableDateRangeForExpiration.minYear);
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