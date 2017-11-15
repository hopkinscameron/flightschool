'use strict';

// set up the module
var accountModule = angular.module('account');

// create the controller
accountModule.controller('NotificationsController', ['$scope', '$rootScope', '$location', 'Service', 'AccountFactory', function ($scope, $rootScope, $location, Service, AccountFactory) {
    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the notifications form data
    $scope.notificationsForm = {
        'inputs': {
            'news': false,
            'reminderEmail': false,
            'research': false,
            'reminderSMS': false
        }
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // update notifications
    $scope.updateNotifications = function () {
        // disable button but showing the form has been submitted
        $scope.formInTransit = true;

        // the data to send
        var notificationsData = {
            'news': $scope.notificationsForm.inputs.news,
            'reminderEmail': $scope.notificationsForm.inputs.reminderEmail,
            'research': $scope.notificationsForm.inputs.research,
            'reminderSMS': $scope.notificationsForm.inputs.reminderSMS
        };

        // update notifications
        AccountFactory.updateNotifications(notificationsData).then(function (responseUN) {
            // if returned a valid response
            if(responseUN && !responseUN.error) {
                // show success
                swal({
                    title: 'Success!',
                    text: 'You have successfully updated your notifications.',
                    type: 'success',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply()
                },
                // handling the promise rejection
                function (dismiss) {
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
                    text: 'Sorry! There was an error: ' + responseUN.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show error
                    $scope.notificationsForm.errors.errorMessage = responseUN.message;
                    $scope.notificationsForm.errors.isError = true;

                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.notificationsForm.errors.errorMessage = responseUN.message;
                    $scope.notificationsForm.errors.isError = true;

                    // show the form is no longer in transit
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();                
                });
            }
        })
        .catch(function (responseUN) {
            // show error
            swal({
                title: 'Error!',
                text: 'Sorry! There was an error: ' + responseUN.message,
                type: 'error',
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                buttonsStyling: false
            }).then(function () {
                // show error
                $scope.notificationsForm.errors.errorMessage = responseUN.message;
                $scope.notificationsForm.errors.isError = true;

                // show the form is no longer in transit
                $scope.formInTransit = false;

                // force apply
                $scope.$apply();
            },
            // handling the promise rejection
            function (dismiss) {
                // show error
                $scope.notificationsForm.errors.errorMessage = responseUN.message;
                $scope.notificationsForm.errors.isError = true;

                // show the form is no longer in transit
                $scope.formInTransit = false;

                // force apply
                $scope.$apply();                
            });
        });
    };

    // get page data
    getPageData();
    
    // gets the page data
    function getPageData() {
        // initialize
        $scope.notifications = {};

        // get notifications page data
        AccountFactory.getNotificationsPageInformation().then(function (responseN) {
            // if returned a valid response
            if (responseN && !responseN.error) {
                // set the data
                $scope.notifications.data = responseN;
                $scope.notifications.title = 'Notifications';
                $scope.notifications.pageHeader = $scope.notifications.title;
                $scope.notifications.pageSubHeader = 'Let\'s manage these notifications!';

                // holds the page title
                $scope.pageTitle = $scope.notifications.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // set form values
                $scope.notificationsForm.inputs.news = $scope.notifications.data.notificationNews;
                $scope.notificationsForm.inputs.reminderEmail = $scope.notifications.data.notificationReminderEmail;
                $scope.notificationsForm.inputs.research = $scope.notifications.data.notificationResearch;
                $scope.notificationsForm.inputs.reminderSMS = $scope.notifications.data.notificationReminderSMS;

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseN.title;
                $scope.error.error = true;
                $scope.error.title = responseN.title;
                $scope.error.status = responseN.status;
                $scope.error.message = responseN.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseN) {
            // set error
            $scope.pageTitle = responseN.title;
            $scope.error.error = true;
            $scope.error.title = responseN.title;
            $scope.error.status = responseN.status;
            $scope.error.message = responseN.message;

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