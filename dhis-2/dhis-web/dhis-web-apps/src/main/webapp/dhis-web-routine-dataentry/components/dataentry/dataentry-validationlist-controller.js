'use strict';

var routineDataEntry = angular.module('routineDataEntry');

//Controller for settings page
routineDataEntry.controller('DataEntryValidationlistController',
        function($scope,
                $modalInstance,
                $translate,
                $filter,
                failedValidationRules) {
    $scope.failedValidationRules=failedValidationRules;
                    
    $scope.close = function(status) {  
        $modalInstance.close( status );
    };
});