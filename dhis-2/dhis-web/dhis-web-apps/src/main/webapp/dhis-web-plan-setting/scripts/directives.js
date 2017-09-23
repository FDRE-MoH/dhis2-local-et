/* global directive, selection, dhis2, angular */

'use strict';

/* Directives */

var planSettingDirectives = angular.module('planSettingDirectives', [])

.directive('d2Blur', function () {
    return function (scope, elem, attrs) {
        elem.change(function () {
            scope.$apply(attrs.d2Blur);
        });
    };
})

.directive('equalHeightNavTabs', function ($timeout) {
    return function (scope, element, attrs) {        
        $timeout(function () {
            var highest = 0;            
            var selector = '.nav-tabs.nav-justified > li > a';
            $(selector).each(function(){
                var h = $(this).height();
                if(h > highest){
                   highest = $(this).height();  
                }
            });            
            if( highest > 0 ){
                $(".nav-tabs.nav-justified > li > a").height(highest);
            }
        });
    };
})

.directive('d2Radio', function(){
    return {
        restrict: 'EA',            
        templateUrl: "./views/radio-input.html",
        scope: {            
            id: '=',
            name: '@d2Name',
            d2Object: '=',
            d2ValueSaveStatus: '=',
            d2Disabled: '=',
            d2Required: '=',
            d2Options: '=',
            d2CallbackFunction: '&d2Function'
        },
        link: function (scope, element, attrs) {
            
        },
        controller: function($scope){
            
            $scope.d2Object = $scope.d2Object || {};
            
            var getModelRadioValue = function(){
                var val = $scope.d2Object[$scope.id] && ( $scope.d2Object[$scope.id].value || $scope.d2Object[$scope.id].value === false )? $scope.d2Object[$scope.id].value : '';
                return val;
            };
            
            $scope.$watch('d2Object',function(newObj, oldObj){
                if( angular.isObject(newObj) ){
                    $scope.d2Object = newObj;
                    $scope.model = {radio: getModelRadioValue()};
                }                
            });
            
            $scope.model = {radio: getModelRadioValue()};
            
            $scope.saveValue = function( value ){                
                $scope.model.radio = value;
                $scope.d2Object[$scope.id] = $scope.d2Object[$scope.id] || {};
                if( $scope.model.radio === $scope.d2Object[$scope.id].value ){
                    $scope.model.radio = null;
                }
                
                $scope.d2Object[$scope.id].value = $scope.model.radio;                
                if( angular.isDefined( $scope.d2CallbackFunction ) ){
                    $scope.d2CallbackFunction();
                }
            };
            
            $scope.getRadioInputNotificationClass = function(val){                
                if( val === $scope.model.radio ){
                    return $scope.d2ValueSaveStatus;
                }
                return 'form-control';
            };
        }
    };
});  