'use strict';

/* Filters */

var actionMappingFilters = angular.module('actionMappingFilters', [])

.filter('toCalendarDate', function($filter, CalendarService){
    
    return function(input) {
        
        if( input ){            
            var calendarSetting = CalendarService.getSetting();
            
            var year = parseInt($filter('date')(input, 'yyyy'));
            var month = parseInt($filter('date')(input, 'M'));
            var day = parseInt($filter('date')(input, 'd'));
            
            var calendar = $.calendars.instance(calendarSetting.keyCalendar);
            var gregorianDate = $.calendars.instance('gregorian').toJD(year,month,day);            
            var calendarDate = calendar.fromJD(gregorianDate);
            
            return calendar.formatDate('M d, yyyy', calendarDate);
            //return $filter('date')(input, format);
        }
        
        return input;
    };            
});