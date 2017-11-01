'use strict'

// set up the module
var dialogModule = angular.module('dialog');

// create the controller
dialogModule.controller('DialogWarningController', ['$scope', 'ngDialog', function ($scope, ngDialog) {

}]);

// remove employee controller
dialogModule.controller('DialogRemoveEmployeeController', ['$scope', 'ngDialog', function ($scope, ngDialog) {
    // shows this is the remove employee controller
    $scope.DialogRemoveEmployeeController = true;

    // the warning head 
    $scope.warningHead = 'GEEZ !?!?';

    // the warning body
    $scope.warningBody = 'Woah there, you are about to remove \'' + $scope.ngDialogData.employeeToBeRemoved.name + '\', are you positive !?';

    // cancel
    $scope.cancel = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': false });
    };

    // submit
    $scope.submit = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': true, 'employeeToBeRemoved': $scope.ngDialogData.employeeToBeRemoved });
    };
}]);

// delete service type controller
dialogModule.controller('DialogDeleteServiceTypeController', ['$scope', 'ngDialog', function ($scope, ngDialog) {
    // shows this is the delete service type controller
    $scope.DialogDeleteServiceTypeController = true;

    // the warning head 
    $scope.warningHead = 'GEEZ !?!?';

    // the warning body
    $scope.warningBody = 'Woah there, you are about to delete the type \'' + $scope.ngDialogData.serviceTypeToBeDeleted.displayName + '\'. If you delete a type, all the services under this type will be deleted as well. Do you wish to continue?';

    // cancel
    $scope.cancel = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': false });
    };

    // submit
    $scope.submit = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': true, 'serviceTypeToBeDeleted': $scope.ngDialogData.serviceTypeToBeDeleted });
    };
}]);

// delete service controller
dialogModule.controller('DialogDeleteServiceController', ['$scope', 'ngDialog', function ($scope, ngDialog) {
    // shows this is the delete service controller
    $scope.DialogDeleteServiceController = true;

    // the warning head 
    $scope.warningHead = 'GEEZ !?!?';

    // the warning body
    $scope.warningBody = 'Woah there, you are about to delete the service \'' + $scope.ngDialogData.serviceToBeDeleted.displayName + '\', are you positive !?';

    // cancel
    $scope.cancel = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': false });
    };

    // submit
    $scope.submit = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': true, 'serviceToBeDeleted': $scope.ngDialogData.serviceToBeDeleted });
    };
}]);

// delete booking controller
dialogModule.controller('DialogDeleteBookingController', ['$scope', 'ngDialog', function ($scope, ngDialog) {
    // shows this is the delete booking controller
    $scope.DialogDeleteBookingController = true;

    // the warning head 
    $scope.warningHead = 'GEEZ !?!?';

    // the warning body
    $scope.warningBody = 'Woah there, you are about to delete the booking by \'' + $scope.ngDialogData.bookingToBeDeleted.clientName + '\', are you positive !?';

    // cancel
    $scope.cancel = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': false });
    };

    // submit
    $scope.submit = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId, { 'accepted': true, 'bookingToBeDeleted': $scope.ngDialogData.bookingToBeDeleted });
    };
}]);