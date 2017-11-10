'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('NotificationsController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.notifications = {};

        // get change password page data
        AccountFactory.getNotificationsPageInformation().then(function (responseCP) {
            // if returned a valid response
            if (responseCP && !responseCP.error) {
                // set the data
                $scope.notifications.data = responseCP;
                $scope.notifications.title = 'Notifications';
                $scope.notifications.pageHeader = $scope.notifications.title;
                $scope.notifications.pageSubHeader = 'Let\'s manage these notifications?';

                // holds the page title
                $scope.pageTitle = $scope.notifications.title + ' | ' + ApplicationConfiguration.applicationName;
                
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
            'pageHeader': _.cloneDeep($scope.notifications.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.notifications.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };
}]);