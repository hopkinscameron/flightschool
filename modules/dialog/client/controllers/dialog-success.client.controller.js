'use strict'

// set up the module
var dialogModule = angular.module('dialog');

// create the controller
dialogModule.controller('DialogSuccessController', ['$scope', 'ngDialog', function ($scope, ngDialog) {
	// shows this is the success controller
    $scope.DialogSuccessController = true;

    // okay
    $scope.okay = function () {
        // close the dialog
        ngDialog.close($scope.ngDialogData.ngDialogId);
    };
}]);