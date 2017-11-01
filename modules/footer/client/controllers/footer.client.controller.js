'use strict'

// set up the module
var footerModule = angular.module('footer');

// create the controller
footerModule.controller('FooterController', ['$scope', '$rootScope', 'CoreFactory', 'FooterFactory', function ($scope, $rootScope, CoreFactory, FooterFactory) {
    // initialize variables
    initializeVariables() ;

    // get the footer information
    getFooterInformation();

    // on refresh
    $rootScope.$on('refreshFooter', function (event, data) {
        // initialize variables
        initializeVariables() ;

        // get the footer information
        getFooterInformation();
    });

    // initialize variables
    function initializeVariables () {
        // initialize show footer
        $rootScope.$root.showFooter = true;

        // the footer backend data
        $scope.footer = {};
    };

    // initializes the backend data
    function getFooterInformation() {
        // get the footer information
        FooterFactory.getFooterInformation().then(function (responseF) {
            // get the core information
            CoreFactory.getCoreInformation().then(function (responseC) {
                // set the footer
                $scope.footer = responseF;
                $scope.footer.core = responseC;

                // footer refreshed
                $rootScope.$emit('footerRefreshed', {});
            })
            .catch(function (responseC) {
                // footer refreshed with error
                $rootScope.$emit('footerRefreshed', {'error': true, 'message': responseC.message});
            });
        })
        .catch(function (responseF) {
            // footer refreshed with error
            $rootScope.$emit('footerRefreshed', {'error': true, 'message': responseF.message});
        });
    };
}]);