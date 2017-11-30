'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('MembershipController', ['$scope', '$rootScope', '$location', 'Service', 'TierFactory', 'AccountFactory', function ($scope, $rootScope, $location, Service, TierFactory, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // set the range for expiration date
    setAcceptableExpDateRange();

    // the membership options
    $scope.membershipOptions = {
        'options': []
    };

    // create membership
    $scope.createMembership = function(membership) {
        // the purchase information
        var purchaseData = {
            'number': undefined,
            'expiration': undefined,
            'ccv': undefined,
            'tierId': undefined,
        };

        // the saved membership data
        var savedMembership = undefined;

        // check if there is a card on file
        if(!$scope.membership.data.paymentInfo) {
            swal({
                title: 'Purchase subscription to \n' + membership.displayName,
                html:
                    '<input id="cc-number" class="swal2-input" placeholder="Card number" maxLength="16">' +
                    '<input id="cc-exp" class="swal2-input" placeholder="MM/YY" maxLength="5">' + 
                    '<input id="cc-ccv" class="swal2-input" placeholder="CCV" maxLength="3">',
                focusConfirm: false,
                confirmButtonText: 'Pay $' + membership.price,
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise(function (resolve, reject) {
                        // get each value
                        purchaseData.number = $('#cc-number').val();
                        purchaseData.expiration = $('#cc-exp').val();
                        purchaseData.ccv = $('#cc-ccv').val();
                        purchaseData.tierId = membership._id;

                        // if valid values
                        if(!matchesCCNumbers(purchaseData.number)) {
                            reject('Not a valid credit card');
                        }
                        else if(!expDateVaild(purchaseData.expiration)) {
                            reject('Not a valid expiration date');
                        }
                        else if(!purchaseData.ccv || purchaseData.ccv.length != 3 || parseInt(purchaseData.ccv) == NaN) {
                            reject('Not a valid ccv');
                        }
                        else {
                            // remove the forward slash
                            purchaseData.expiration = purchaseData.expiration.substring(0, 2) + purchaseData.expiration.substring(4);

                            // update membership
                            AccountFactory.updateMembership(purchaseData).then(function (responseUM) {
                                // if returned a valid response
                                if(responseUM && !responseUM.error) {
                                    // set membership
                                    savedMembership = responseUM;

                                    // make the purchase
                                    resolve();
                                }
                                else {
                                    reject(responseUM.message);
                                }
                            })
                            .catch(function (responseUM) {
                                reject(responseUM.message);
                            });
                        }
                    });
                }
            })
            .then(function () {
                swal({
                    type: 'success',
                    title: 'You are now a ' + membership.displayName,
                    timer: 3000
                })
                .then(function () {
                    // update membership
                    $scope.membership.data.tierId = savedMembership.tierId;
                    $scope.membership.data.subscribed = savedMembership.subscribed;
                    $scope.membership.data.nextBillingCycle = savedMembership.nextBillingCycle;

                    // go through each membership and find the corresponding value
                    _.forEach($scope.membershipOptions.options, function(value) {
                        // if the id matches
                        if($scope.membership.data.tierId == value._id) {
                            // copy the value
                            $scope.membership.data.tier = _.cloneDeep(value);

                            // break out the loop 
                            return;
                        }
                    });

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
                    // update membership
                    $scope.membership.data.tierId = savedMembership.tierId;
                    $scope.membership.data.subscribed = savedMembership.subscribed;
                    $scope.membership.data.nextBillingCycle = savedMembership.nextBillingCycle;

                    // go through each membership and find the corresponding value
                    _.forEach($scope.membershipOptions.options, function(value) {
                        // if the id matches
                        if($scope.membership.data.tierId == value._id) {
                            // copy the value
                            $scope.membership.data.tier = _.cloneDeep(value);

                            // break out the loop 
                            return;
                        }
                    });

                    // force apply
                    $scope.$apply()
                });
            },
            // handling the promise rejection
            function (dismiss) {});
        }
        else {
            swal({
                title: 'Purchase subscription to \n' + membership.displayName,
                html:
                    '<p class="mb-0">' + $scope.membership.data.paymentInfo.type + ' ending in <span class="font-weight-bold">' + $scope.membership.data.paymentInfo.lastFour + '</span></p>' +
                    '<p class="mb-0">Expires: <span class="font-weight-bold">' + $scope.membership.data.paymentInfo.expiration.substring(0, 2) + '/' + $scope.membership.data.paymentInfo.expiration.substring(2) + '</span></p>',
                focusConfirm: false,
                confirmButtonText: 'Pay $' + membership.price,
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise(function (resolve, reject) {
                        // get each value
                        purchaseData.number = $scope.membership.data.paymentInfo.number;
                        purchaseData.expiration = $scope.membership.data.paymentInfo.expiration;
                        purchaseData.ccv = $scope.membership.data.paymentInfo.ccv;
                        purchaseData.tierId = membership._id;

                        // if valid values
                        if(!matchesCCNumbers(purchaseData.number)) {
                            reject('Not a valid credit card');
                        }
                        else if(!expDateVaild(purchaseData.expiration)) {
                            reject('Not a valid expiration date');
                        }
                        else if(!purchaseData.ccv || purchaseData.ccv.length != 3 || parseInt(purchaseData.ccv) == NaN) {
                            reject('Not a valid ccv');
                        }
                        else {
                            // update membership
                            AccountFactory.updateMembership(purchaseData).then(function (responseUM) {
                                // if returned a valid response
                                if(responseUM && !responseUM.error) {
                                    // set membership
                                    savedMembership = responseUM;

                                    // make the purchase
                                    resolve();
                                }
                                else {
                                    reject(responseUM.message);
                                }
                            })
                            .catch(function (responseUM) {
                                reject(responseUM.message);
                            });
                        }
                    });
                }
            })
            .then(function () {
                swal({
                    type: 'success',
                    title: 'You are now a ' + membership.displayName,
                    timer: 3000
                })
                .then(function () {
                    // update membership
                    $scope.membership.data.tierId = savedMembership.tierId;
                    $scope.membership.data.subscribed = savedMembership.subscribed;
                    $scope.membership.data.nextBillingCycle = savedMembership.nextBillingCycle;

                    // go through each membership and find the corresponding value
                    _.forEach($scope.membershipOptions.options, function(value) {
                        // if the id matches
                        if($scope.membership.data.tierId == value._id) {
                            // copy the value
                            $scope.membership.data.tier = _.cloneDeep(value);

                            // break out the loop 
                            return;
                        }
                    });

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
                    // update membership
                    $scope.membership.data.tierId = savedMembership.tierId;
                    $scope.membership.data.subscribed = savedMembership.subscribed;
                    $scope.membership.data.nextBillingCycle = savedMembership.nextBillingCycle;

                    // go through each membership and find the corresponding value
                    _.forEach($scope.membershipOptions.options, function(value) {
                        // if the id matches
                        if($scope.membership.data.tierId == value._id) {
                            // copy the value
                            $scope.membership.data.tier = _.cloneDeep(value);

                            // break out the loop 
                            return;
                        }
                    });

                    // force apply
                    $scope.$apply()
                });
            },
            // handling the promise rejection
            function (dismiss) {});
        }
    };

    // cancel membership
    $scope.cancelMembership = function() {
        // get the end of membership
        var formatted = $rootScope.$root.formatDate($rootScope.$root.dateLong, $scope.membership.data.nextBillingCycle.end);

        // the canceled membership
        var canceledMembership = undefined;

        // get the selected airport
        swal({
            type: 'question',
            title: 'Are you sure you want to cancel your membership?',
            html: 'You will still be able to use your membership until the end of your billing cycle <span class="font-weight-bold">(' + formatted + ')</span>',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonClass: 'btn btn-danger btn-cursor-pointer',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer mr-2',
            reverseButtons: true,
            buttonsStyling: false,
            showCancelButton: true,
            focusConfirm: false,
            focusCancel: true,
            showLoaderOnConfirm: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    // cancel membership
                    AccountFactory.cancelMembership().then(function (responseCM) {
                        // if returned a valid response
                        if(responseCM && !responseCM.error) {
                            canceledMembership = responseCM;
                            resolve();
                        }
                        else {
                            reject(responseCM.message);
                        }
                    })
                    .catch(function (responseCM) {
                        reject(responseCM.message);
                    });
                });
            }
        }).then(function () {
            swal({
                type: 'success',
                title: 'Membership canceled',
                text: 'Sad to see you go, but your membership has been canceled. You will still be able to use your membership until the end of your billing cycle (' + formatted + ')'
            })
            .then(function () {
                // update membership
                $scope.membership.data.tierId = canceledMembership.tierId;
                $scope.membership.data.subscribed = canceledMembership.subscribed;
                $scope.membership.data.nextBillingCycle = canceledMembership.nextBillingCycle;

                // check membership expiration
                checkMembershipExpiration();

                // force apply
                $scope.$apply()
            },
            // handling the promise rejection
            function (dismiss) {
                // update membership
                $scope.membership.data.tierId = canceledMembership.tierId;
                $scope.membership.data.subscribed = canceledMembership.subscribed;
                $scope.membership.data.nextBillingCycle = canceledMembership.nextBillingCycle;

                // check membership expiration
                checkMembershipExpiration();

                // force apply
                $scope.$apply()
            });
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.membership = {};

        // get the tiers
        TierFactory.getTiers().then(function (responseT) {
            // if returned a valid response
            if (responseT && !responseT.error) {
                // set the membership options
                $scope.membershipOptions.options = responseT;

                // add a visibility field
                _.forEach($scope.membershipOptions.options, function(value) {
                    value.showDetails = false;
                });

                // get membership page data
                AccountFactory.getMembershipPageInformation().then(function (responseS) {
                    // if returned a valid response
                    if (responseS && !responseS.error) {
                        // set the data
                        $scope.membership.data = responseS;
                        $scope.membership.title = 'Membership';
                        $scope.membership.pageHeader = $scope.membership.title;

                        // FIXME: used for testing
                        if($scope.membership.data.tierId) {
                            $scope.membership.data.payments = [
                                { 'start': new Date('November 30 2017'), 'end': new Date('December 29 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                                { 'start': new Date('November 13 2017'), 'end': new Date('December 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                                { 'start': new Date('October 13 2017'), 'end': new Date('November 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' }
                            ];
                        }

                        // if there is a tier
                        if($scope.membership.data.tierId) {
                            // go through each membership and find the corresponding value
                            _.forEach($scope.membershipOptions.options, function(value) {
                                // if the id matches
                                if($scope.membership.data.tierId == value._id) {
                                    // copy the value
                                    $scope.membership.data.tier = _.cloneDeep(value);

                                    // break out the loop 
                                    return;
                                }
                            });
                        }
                
                        // set the sub header based on membership
                        if($scope.membership.data.tier && $scope.membership.data.subscribed) {
                            $scope.membership.pageSubHeader = 'Looks like you\'re a ' + $scope.membership.data.tier.displayName;
                        }
                        else if($scope.membership.data.tier && !$scope.membership.data.subscribed) {
                            $scope.membership.pageSubHeader = 'Your ' + $scope.membership.data.tier.displayName + ' membership is not currently active';
                        }
                        else if(!$scope.membership.data.tier && !$scope.membership.data.subscribed) {
                            $scope.membership.pageSubHeader = 'You do not currently have a membership';
                        }

                        // if payment information
                        if($scope.membership.data.paymentInfo) {
                            // set the last four if exists
                            $scope.membership.data.paymentInfo.lastFour = $scope.membership.data.paymentInfo.number.substring($scope.membership.data.paymentInfo.number.length - 4);
                        }

                        // check membership expiration
                        checkMembershipExpiration();

                        // holds the page title
                        $scope.pageTitle = $scope.membership.title + ' | ' + ApplicationConfiguration.applicationName;
                        
                        // setup page
                        setUpPage();
                    }
                    else {
                        // set error
                        $scope.pageTitle = responseS.title;
                        $scope.error.error = true;
                        $scope.error.title = responseS.title;
                        $scope.error.status = responseS.status;
                        $scope.error.message = responseS.message;

                        // setup page
                        setUpPage();
                    }
                })
                .catch(function (responseS) {
                    // set error
                    $scope.pageTitle = responseS.title;
                    $scope.error.error = true;
                    $scope.error.title = responseS.title;
                    $scope.error.status = responseS.status;
                    $scope.error.message = responseS.message;

                    // setup page
                    setUpPage();
                });
            }
            else {
                // set error
                $scope.pageTitle = responseT.title;
                $scope.error.error = true;
                $scope.error.title = responseT.title;
                $scope.error.status = responseT.status;
                $scope.error.message = responseT.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseT) {
            // set error
            $scope.pageTitle = responseT.title;
            $scope.error.error = true;
            $scope.error.title = responseT.title;
            $scope.error.status = responseT.status;
            $scope.error.message = responseT.message;

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
            'pageHeader': _.cloneDeep($scope.membership.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.membership.pageSubHeader)
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

    // checks membership expiration
    function checkMembershipExpiration() {
        // if there is not a next billing date but the user was previously subscribed
        if($scope.membership.data.tier && !$scope.membership.data.nextBillingCycle) {
            // if today's date is before the end of the last payment cycle
            if($scope.membership.data.payments && new Date() < $scope.membership.data.payments[0].end) {
                $scope.membershipExpiration = new Date($scope.membership.data.payments[0].end);
            }
        }
    };

    // determines if cc number matches accetable cc types/numbers
    function matchesCCNumbers(value) {
        var visa = $rootScope.$root.visaRegex.test(value);
        var mc = $rootScope.$root.masterCardRegex.test(value);
        var amex = $rootScope.$root.americanExpressRegex.test(value);
        var discover = $rootScope.$root.discoverRegex.test(value);

        return visa || mc || amex || discover;
    };

    // determines if expiration date is valid
    function expDateVaild(date) {
        // get position of forward slash
        var pos = date.indexOf('/');

        // if value doesn't exist, not correct length, not proper format
        if(!date || (date.length != 4 && date.length != 5) || (pos != 2 && pos != -1)) {
            return false;
        }

        // get month and year
        var month = NaN;
        var year = NaN;

        // if forward slash
        if(pos != -1) {
            month = date.substring(0, pos);
            year = date.substring(pos + 1);
        }
        else {
            month = date.substring(0, 2);
            year = date.substring(2);
        }

        // convert to number
        month = parseInt(month);
        year = parseInt(year);

        // if not a number
        if(month == NaN || year == NaN) {
            return false;
        }

        // year must be greater than minium year or year must be the minimum year and the month has to be greater than the current month of the minimum year
        return year > $scope.acceptableDateRangeForExpiration.minYear || (month >= $scope.acceptableDateRangeForExpiration.minMonth && year >= $scope.acceptableDateRangeForExpiration.minYear);
    };
}]);