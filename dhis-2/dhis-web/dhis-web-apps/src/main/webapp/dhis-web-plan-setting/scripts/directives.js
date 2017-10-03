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
})

.directive('d2TabIndex', function(){
    return{
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var setFieldFocus = function( field ){
                
                if( field ){                    
                    field.focus();                    
                }
                else{                    
                    console.log('Invalid field to focus:  ', field);                    
                }
            };
            
            var handleEvent = function( event ){
                event.preventDefault(); 
                event.stopPropagation();
            };
                
            element.bind("keydown keypress", function (event) {                
                
                var key = event.keyCode || event.charCode || event.which;
                
                var currentTabIndex = parseInt( attrs.tabindex );
                
                var field = null;                               
                
                if (key === 38 || key === 37 ) {//get previous input field
                    
                    handleEvent( event );                   
                    
                    field = $( 'input[name="foo"][tabindex="' + ( --currentTabIndex ) + '"]' );
                    
                    while( field ){
                        if ( field.is( ':disabled' ) || field.is( ':hidden' ) ) {
                            field = $( 'input[name="foo"][tabindex="' + ( --currentTabIndex ) + '"]' );
                        }
                        else {
                            break;
                        }
                    }
                    
                    setFieldFocus( field );
                }                
                if( key === 9 || key === 13 || key === 39 || key === 40 ){//get next input field
                    
                    handleEvent( event );
                    
                    field = $( 'input[name="foo"][tabindex="' + ( ++currentTabIndex ) + '"]' );
                    
                    while( field ){
                        if ( field.is( ':disabled' ) || field.is( ':hidden' ) ) {
                            field = $( 'input[name="foo"][tabindex="' + ( ++currentTabIndex ) + '"]' );
                        }
                        else {
                            break;
                        }
                    }
                    
                    setFieldFocus( field );                    
                }
            });
        }
    };
});