/* global angular, selection */

'use strict';

var routineDataEntry = angular.module('routineDataEntry');

//Controller for reports page
routineDataEntry.controller('reportTypesController',
        function($scope,
                $location) {
    $scope.whoDoesWhat = function(){
        selection.load();
        $location.path('/report-whodoeswhat').search();
    };
    
    $scope.geoCoveragePerSh = function(){   
        selection.load();
        $location.path('/report-geocoverage').search();
    };
    
    $scope.popCoveragePerSh = function(){   
        selection.load();
        $location.path('/report-popcoverage').search();
    };
});
