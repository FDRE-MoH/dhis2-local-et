/* global angular */

'use strict';

var planSetting = angular.module('planSetting');

//Controller for settings page
planSetting.controller('DataEntryHistoryController',
        function($scope,
                $modalInstance,
                $translate,
                $filter,
                value,
                comment,
                period,
                dataElement,
                orgUnitId,
                attributeCategoryCombo,
                attributeCategoryOptions,
                attributeOptionCombo,
                optionCombo,
                DataValueService,
                DataValueAuditService) {    
    $scope.commentSaveStarted = false;
    $scope.dataElement = dataElement;
    $scope.historyUrl = "../api/charts/history/data.png?";
    $scope.historyUrl += 'de=' + dataElement.id;
    $scope.historyUrl += '&co=' + optionCombo.id;
    $scope.historyUrl += '&ou=' + orgUnitId;
    $scope.historyUrl += '&pe=' + period.id;
    $scope.historyUrl += '&cp=' + attributeOptionCombo;
    
    var dataValueAudit = {de: dataElement.id, pe: period.id, ou: orgUnitId, co: optionCombo.id, cc: attributeOptionCombo};
    $scope.dataValue = {de: dataElement.id, pe: period.id, ou: orgUnitId, co: optionCombo.id, cc: attributeCategoryCombo.id, cp: attributeCategoryOptions, value: value, comment: comment};
    
    $scope.auditColumns = [{id: 'created', displayName: $translate.instant('created')},
                           {id: 'modifiedBy', displayName: $translate.instant('modified_by')},
                           {id: 'value', displayName: $translate.instant('value')},
                           {id: 'auditType', displayName: $translate.instant('audit_type')}];
    
    $scope.dataValueAudits = [];        
    DataValueAuditService.getDataValueAudit( dataValueAudit ).then(function( response ){
        $scope.dataValueAudits = response && response.dataValueAudits ? response.dataValueAudits : [];
        $scope.dataValueAudits = $filter('filter')($scope.dataValueAudits, {period: {id: period.id}});
    });
    
    $scope.saveComment = function(){
        $scope.commentSaveStarted = true;
        $scope.commentSaved = false;
        DataValueService.saveDataValue( $scope.dataValue ).then(function(response){
           $scope.commentSaved = true;
        }, function(){
            $scope.commentSaved = false;
        });
    };
    
    $scope.getCommentNotifcationClass = function(){
        if( $scope.commentSaveStarted ){
            if($scope.commentSaved){
                return 'form-control input-success';
            }
            else{
                return 'form-control input-error';
            }
        }        
        return 'form-control';
    };
    
    $scope.close = function(status) {        
        $modalInstance.close( status );
    };
});