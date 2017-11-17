'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('MembershipController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // the membership options
    $scope.membershipOptions = {
        'options': [
            { 'displayName': 'Bronze Wanderer', 'descriptions': ['Up to two flights per month. Members can roll over 1 flight into the next month; maximum of 3 flights in one month.', '1 Home location, no other hubs.'] }, 
            { 'displayName': 'Silver Wanderer', 'descriptions': ['Up to 2 roundtrip flights per month. Members can roll over as many as 2 flights into the next month; Maximum of 4 in one month.', '1 Home location, no other hubs.'] }, 
            { 'displayName': 'Gold Wanderer', 'descriptions': ['Up to 5 roundtrip flights per month. Members can roll over 2 flights into the next month; maximum of 7 flights in one month.', '1 Home location, with 5 other hubs.'] }, 
            { 'displayName': 'Platinum Wanderer', 'descriptions': ['Unlimited flights each month, accumulate Ultimate Flyer Miles', 'Unlimited hubs to fly from at a discounted rate.'] }]
    };

    // show the membership details
    $scope.showMembershipDetails = function(membership) {
        // set up the html
        var htmlText = '<ul>';

        // loop through each description
        _.forEach(membership.descriptions, function(value) {
            // add the text
            htmlText += '<li class="text-left">' + value + '</li>';
        });

        // add the ending
        htmlText += '</ul>';

        // show alert
        swal({
            title:  membership.displayName,
            html: htmlText,
            showCancelButton: true,
            confirmButtonText: 'Sign Up',
            cancelButtonText: 'Okay',
            confirmButtonClass: 'btn btn-success btn-cursor-pointer mr-2',
            cancelButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false
        }).then(function () {
            // TODO: take them to sign up page
        },
        // handling the promise rejection
        function (dismiss) {});
    };

    // renews membership
    $scope.renewMembership = function() {

    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.membership = {};

        // get membership page data
        AccountFactory.getMembershipPageInformation().then(function (responseS) {
            // if returned a valid response
            if (responseS && !responseS.error) {
                // set the data
                $scope.membership.data = responseS;
                $scope.membership.title = 'Membership';
                $scope.membership.pageHeader = $scope.membership.title;

                // FIXME: used for testing
                $scope.membership.data = {
                    'tierId': 'Bronze Wanderer',
                    'subscribed': true,
                    'renewalDate': new Date('December 13 2017'),
                    'payments': [
                        { 'date': new Date('November 13 2017'), 'endDate': new Date('December 12 2017'), 'price': 30.00, 'tax': 1.47, 'tierId': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                        { 'date': new Date('October 13 2017'), 'endDate': new Date('November 12 2017'), 'price': 30.00, 'tax': 1.47, 'tierId': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' }
                    ]
                };

                // go through each membership and find the corresponding value
                _.forEach($scope.membershipOptions.options, function(value) {
                    // if the id matches
                    if($scope.membership.data.tierId == value.displayName) {
                        // copy the value
                        $scope.membership.data.tier = _.cloneDeep(value);

                        // break out the loop 
                        return;
                    }
                });

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
}]);