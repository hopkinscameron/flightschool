'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('EditProfileController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.editProfile = {};

        // get change password page data
        AccountFactory.getEditProfilePageInformation().then(function (responseCP) {
            // if returned a valid response
            if (responseCP && !responseCP.error) {
                // set the data
                $scope.editProfile.data = responseCP;
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
            'pageHeader': _.cloneDeep($scope.editProfile.pageHeader),
            'pageSubHeader': _.cloneDeep($scope.editProfile.pageSubHeader)
        };

        // update the account page
        $scope.$emit('updateAccountPage', data);
    };
}]);