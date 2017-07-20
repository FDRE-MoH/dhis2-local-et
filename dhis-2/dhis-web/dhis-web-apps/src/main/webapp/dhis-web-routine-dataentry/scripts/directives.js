/* global directive, selection, dhis2, angular */

'use strict';

/* Directives */

var actionMappingDirectives = angular.module('actionMappingDirectives', [])

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
});  