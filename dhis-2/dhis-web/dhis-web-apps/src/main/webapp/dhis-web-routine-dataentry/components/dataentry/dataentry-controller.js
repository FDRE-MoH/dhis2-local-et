/* global angular */

'use strict';

var routineDataEntry = angular.module('routineDataEntry');

//Controller for settings page
routineDataEntry.controller('dataEntryController',
        function($scope,
                $filter,
                $modal,
                orderByFilter,
                SessionStorageService,
                storage,
                DataSetFactory,
                PeriodService,
                MetaDataFactory,
                ActionMappingUtils,
                DataValueService,
                CompletenessService,
                ModalService,
                DialogService,
                CustomFormService) {
    $scope.periodOffset = 0;
    $scope.saveStatus = {};    
    $scope.model = {invalidDimensions: false,
                    selectedAttributeCategoryCombo: null,
                    standardDataSets: [],
                    multiDataSets: [],
                    dataSets: [],
                    optionSets: null,
                    displayCustomForm: false,
                    categoryOptionsReady: false,
                    allowMultiOrgUnitEntry: false,
                    selectedOptions: [],
                    dataValues: {},
                    orgUnitsWithValues: [],
                    selectedAttributeOptionCombos: {},
                    selectedAttributeOptionCombo: null,
                    categoryCombos: {},
                    optionCombos: {},
                    validationRules: [],
                    validationResults: [],
                    failedValidationRules: [],
                    attributeCategoryUrl: null,
                    showCustomForm: false,
                    valueExists: false};
    
    //watch for selection of org unit from tree
    $scope.$watch('selectedOrgUnit', function() {
        $scope.model.periods = [];
        $scope.model.dataSets = [];
        $scope.model.validationResults = [];
        $scope.model.failedValidationRules = [];
        $scope.model.selectedDataSet = null;
        $scope.model.selectedPeriod = null;
        $scope.model.selectedAttributeCategoryCombo = null;
        $scope.model.selectedAttributeOptionCombos = {};
        $scope.model.selectedAttributeOptionCombo = null;
        $scope.model.selectedProgram = null;
        $scope.dataValues = {};
        $scope.model.basicAuditInfo = {};
        $scope.model.orgUnitsWithValues = [];
        $scope.model.categoryOptionsReady = false;
        $scope.model.valueExists = false;
        if( angular.isObject($scope.selectedOrgUnit)){
            SessionStorageService.set('SELECTED_OU', $scope.selectedOrgUnit); 
            var systemSetting = storage.get('SYSTEM_SETTING');
            $scope.model.allowMultiOrgUnitEntry = systemSetting && systemSetting.multiOrganisationUnitForms ? systemSetting.multiOrganisationUnitForms : false;
            loadOptionSets();
            loadOptionCombos();
            loadValidationRules();
            $scope.loadDataSets($scope.selectedOrgUnit);
        }
    });
        
    function loadOptionSets() {        
        if(!$scope.model.optionSets){
            $scope.model.optionSets = [];
            MetaDataFactory.getAll('optionSets').then(function(optionSets){
                angular.forEach(optionSets, function(optionSet){
                    $scope.model.optionSets[optionSet.id] = optionSet;
                });
            });
        }
    }
    
    function loadOptionCombos(){        
        MetaDataFactory.getAll('categoryCombos').then(function(ccs){            
            angular.forEach(ccs, function(cc){
                $scope.model.categoryCombos[cc.id] = cc;
            });
        });
    }
    
    function loadValidationRules(){
        MetaDataFactory.getAll('validationRules').then(function(vrs){            
            $scope.model.validationRules = vrs;
        });
    }
    
    //load datasets associated with the selected org unit.
    $scope.loadDataSets = function(orgUnit) {
        $scope.selectedOrgUnit = orgUnit;
        $scope.model.dataSets = [];
        $scope.model.selectedAttributeCategoryCombo = null;
        $scope.model.selectedAttributeOptionCombos = {};
        $scope.model.selectedAttributeOptionCombo = null;
        $scope.model.selectedPeriod = null;
        $scope.model.orgUnitsWithValues = [];
        $scope.dataValues = {};
        $scope.model.valueExists = false;
        $scope.model.displayCustomForm = false;
        if (angular.isObject($scope.selectedOrgUnit)) {            
            DataSetFactory.getByOu( $scope.selectedOrgUnit, $scope.model.selectedDataSet ).then(function(response){                
                $scope.model.dataSets = response.dataSets || [];
            });
        }        
    }; 
    
    //watch for selection of data set
    $scope.$watch('model.selectedDataSet', function() {        
        $scope.model.periods = [];
        $scope.model.selectedPeriod = null;
        $scope.model.categoryOptionsReady = false;
        $scope.dataValues = {};
        $scope.model.selectedProgram = null;
        $scope.model.selectedEvent = {};
        $scope.model.orgUnitsWithValues = [];
        $scope.model.valueExists = false;
        $scope.model.displayCustomForm = false;
        if( angular.isObject($scope.model.selectedDataSet) && $scope.model.selectedDataSet.id){
            $scope.loadDataSetDetails();
        }
    });
    
    $scope.$watch('model.selectedPeriod', function(){        
        $scope.dataValues = {};
        $scope.model.valueExists = false;
        $scope.loadDataEntryForm();
    });    
        
    $scope.loadDataSetDetails = function(){        
        if( $scope.model.selectedDataSet && $scope.model.selectedDataSet.id && $scope.model.selectedDataSet.periodType){
            
            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedDataSet.periodType, $scope.model.periodOffset);
            
            if(!$scope.model.selectedDataSet.dataElements || $scope.model.selectedDataSet.dataElements.length < 1){                
                $scope.invalidCategoryDimensionConfiguration('error', 'missing_data_elements_indicators');
                return;
            }            
                        
            $scope.model.selectedAttributeCategoryCombo = null;     
            if( $scope.model.selectedDataSet && $scope.model.selectedDataSet.categoryCombo && $scope.model.selectedDataSet.categoryCombo.id ){
                
                $scope.model.selectedAttributeCategoryCombo = $scope.model.categoryCombos[$scope.model.selectedDataSet.categoryCombo.id];
                if( $scope.model.selectedAttributeCategoryCombo && $scope.model.selectedAttributeCategoryCombo.isDefault ){
                    $scope.model.categoryOptionsReady = true;
                }                
                angular.forEach($scope.model.selectedAttributeCategoryCombo.categoryOptionCombos, function(oco){
                    $scope.model.selectedAttributeOptionCombos['"' + oco.displayName + '"'] = oco.id;
                });
            }
            
            $scope.model.dataElements = [];
            angular.forEach($scope.model.selectedDataSet.dataElements, function(de){
                de.validationRules = [];
                angular.forEach($scope.model.validationRules, function(vr){
                    if( vr.params && vr.params.length > 0 && vr.params.indexOf(de.id) !== -1){
                        de.validationRules.push( vr );
                    }
                });
                $scope.model.dataElements[de.id] = de;
            });
            
            $scope.customDataEntryForm = CustomFormService.getForDataSet($scope.model.selectedDataSet, $scope.model.dataElements);
            $scope.displayCustomForm = $scope.customDataEntryForm ? true : false;
        }
    };
    
    var resetParams = function(){
        $scope.dataValues = {};
        $scope.model.orgUnitsWithValues = [];
        $scope.model.validationResults = [];
        $scope.model.failedValidationRules = [];
        $scope.model.selectedEvent = {};
        $scope.model.valueExists = false;
        $scope.model.basicAuditInfo = {};
        $scope.model.basicAuditInfo.exists = false;
        $scope.saveStatus = {};
    };
    
    $scope.loadDataEntryForm = function(){
        
        resetParams();
        if( angular.isObject( $scope.selectedOrgUnit ) && $scope.selectedOrgUnit.id &&
                angular.isObject( $scope.model.selectedDataSet ) && $scope.model.selectedDataSet.id &&
                angular.isObject( $scope.model.selectedPeriod) && $scope.model.selectedPeriod.id &&
                $scope.model.categoryOptionsReady ){
            
            var dataValueSetUrl = 'dataSet=' + $scope.model.selectedDataSet.id + '&period=' + $scope.model.selectedPeriod.id;

            dataValueSetUrl += '&orgUnit=' + $scope.selectedOrgUnit.id;
            
            $scope.model.selectedAttributeOptionCombo = ActionMappingUtils.getOptionComboIdFromOptionNames($scope.model.selectedAttributeOptionCombos, $scope.model.selectedOptions);
            
            $scope.model.attributeCategoryUrl = {cc: $scope.model.selectedAttributeCategoryCombo.id, default: $scope.model.selectedAttributeCategoryCombo.isDefault, cp: ActionMappingUtils.getOptionIds($scope.model.selectedOptions)};
                        
            //fetch data values...
            DataValueService.getDataValueSet( dataValueSetUrl ).then(function(response){
                if( response && response.dataValues && response.dataValues.length > 0 ){
                    response.dataValues = $filter('filter')(response.dataValues, {attributeOptionCombo: $scope.model.selectedAttributeOptionCombo});
                    if( response.dataValues.length > 0 ){
                        $scope.model.valueExists = true;
                        angular.forEach(response.dataValues, function(dv){
                            
                            dv.value = ActionMappingUtils.formatDataValue( $scope.model.dataElements[dv.dataElement], dv.value );
                            
                            if(!$scope.dataValues[dv.dataElement]){                                
                                $scope.dataValues[dv.dataElement] = {};
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv.value;
                            }
                            else{                                
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv.value;
                            }                 
                        });
                        response.dataValues = orderByFilter(response.dataValues, '-created').reverse();                    
                        $scope.model.basicAuditInfo.created = $filter('date')(response.dataValues[0].created, 'dd MMM yyyy');
                        $scope.model.basicAuditInfo.storedBy = response.dataValues[0].storedBy;
                        $scope.model.basicAuditInfo.exists = true;
                    }
                }
                
                angular.forEach($scope.dataValues, function(vals, de) {
                    $scope.dataValues[de] = ActionMappingUtils.getDataElementTotal( $scope.dataValues, de);
                });
                
                angular.forEach($scope.model.selectedDataSet.dataElements, function(de){                    
                    var vres = ActionMappingUtils.getValidationResult($scope.model.dataElements[de.id], $scope.dataValues, $scope.model.failedValidationRules);
                    $scope.model.failedValidationRules = vres.failed ? vres.failed : $scope.model.failedValidationRules;                    
                });
            });
            
            $scope.model.dataSetCompletness = {};
            CompletenessService.get( $scope.model.selectedDataSet.id, 
                                    $scope.selectedOrgUnit.id,
                                    $scope.model.selectedPeriod.startDate,
                                    $scope.model.selectedPeriod.endDate,
                                    $scope.model.allowMultiOrgUnitEntry).then(function(response){                
                if( response && 
                        response.completeDataSetRegistrations && 
                        response.completeDataSetRegistrations.length &&
                        response.completeDataSetRegistrations.length > 0){
                    
                    angular.forEach(response.completeDataSetRegistrations, function(cdr){
                        $scope.model.dataSetCompletness[cdr.attributeOptionCombo.id] = true;                        
                    });
                }
            });
        }
    };
    
    function checkOptions(){
        resetParams();
        for(var i=0; i<$scope.model.selectedAttributeCategoryCombo.categories.length; i++){
            if($scope.model.selectedAttributeCategoryCombo.categories[i].selectedOption && $scope.model.selectedAttributeCategoryCombo.categories[i].selectedOption.id){
                $scope.model.categoryOptionsReady = true;
                $scope.model.selectedOptions.push($scope.model.selectedAttributeCategoryCombo.categories[i].selectedOption);
            }
            else{
                $scope.model.categoryOptionsReady = false;
                break;
            }
        }        
        if($scope.model.categoryOptionsReady){
            $scope.loadDataEntryForm();
        }
    };
    
    $scope.getCategoryOptions = function(){
        $scope.model.categoryOptionsReady = false;
        $scope.model.selectedOptions = [];
        checkOptions();      
    };
    
    $scope.getPeriods = function(mode){
        
        if( mode === 'NXT'){
            $scope.periodOffset = $scope.periodOffset + 1;
            $scope.model.selectedPeriod = null;
            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedDataSet.periodType, $scope.periodOffset);
        }
        else{
            $scope.periodOffset = $scope.periodOffset - 1;
            $scope.model.selectedPeriod = null;
            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedDataSet.periodType, $scope.periodOffset);
        }
    };
    
    $scope.saveDataValue = function( deId, ocId ){
        
        $scope.saveStatus[ deId + '-' + ocId] = {saved: false, pending: true, error: false};
        
        var dataValue = {ou: $scope.selectedOrgUnit.id,
                    pe: $scope.model.selectedPeriod.id,
                    de: deId,
                    co: ocId,
                    value: $scope.dataValues[deId][ocId] ? $scope.dataValues[deId][ocId] : ''
                };        
        
        if( $scope.model.selectedAttributeCategoryCombo && !$scope.model.selectedAttributeCategoryCombo.isDefault ){            
            dataValue.cc = $scope.model.selectedAttributeCategoryCombo.id;
            dataValue.cp = ActionMappingUtils.getOptionIds($scope.model.selectedOptions);
        }        
                
        DataValueService.saveDataValue( dataValue ).then(function(response){
           $scope.saveStatus[deId + '-' + ocId].saved = true;
           $scope.saveStatus[deId + '-' + ocId].pending = false;
           $scope.saveStatus[deId + '-' + ocId].error = false;
           
           $scope.dataValues[deId] = ActionMappingUtils.getDataElementTotal( $scope.dataValues, deId);
           var vres = ActionMappingUtils.getValidationResult($scope.model.dataElements[deId], $scope.dataValues, $scope.model.failedValidationRules);
           $scope.model.failedValidationRules = vres.failed ? vres.failed : $scope.model.failedValidationRules;           
           
        }, function(){
            $scope.saveStatus[deId + '-' + ocId].saved = false;
            $scope.saveStatus[deId + '-' + ocId].pending = false;
            $scope.saveStatus[deId + '-' + ocId].error = true;
        });
    };
    
    $scope.getIndicatorValue = function( indicator ){  
        return ActionMappingUtils.getIndicatorResult( indicator, $scope.dataValues );
    };
    
    $scope.getInputNotifcationClass = function(deId, ocId){
        
        var style = 'form-control';        
        var currentElement = $scope.saveStatus[deId + '-' + ocId];
        
        if( currentElement ){
            if(currentElement.pending){
                style = 'form-control input-pending';
            }
            if(currentElement.saved){
                style = 'form-control input-success';
            }            
            else{
                style = 'form-control input-error';
            }
        }
        return style;
    };
        
    $scope.getAuditInfo = function(de, ouId, oco, value, comment){        
        var modalInstance = $modal.open({
            templateUrl: 'components/dataentry/history.html',
            controller: 'DataEntryHistoryController',
            windowClass: 'modal-window-history',
            resolve: {
                period: function(){
                    return $scope.model.selectedPeriod;
                },
                dataElement: function(){
                    return de;
                },
                value: function(){
                    return value;
                },
                comment: function(){
                    return comment;
                },
                program: function () {
                    return $scope.model.selectedProgram;
                },
                orgUnitId: function(){
                    return  ouId;
                },
                attributeCategoryCombo: function(){
                    return $scope.model.selectedAttributeCategoryCombo;
                },
                attributeCategoryOptions: function(){
                    return ActionMappingUtils.getOptionIds($scope.model.selectedOptions);
                },
                attributeOptionCombo: function(){
                    return $scope.model.selectedAttributeOptionCombo;
                },
                optionCombo: function(){
                    return oco;
                },
                currentEvent: function(){
                    return $scope.model.selectedEvent[ouId];
                }
            }
        });
        
        modalInstance.result.then(function () {
        }); 
    };
    
    $scope.saveCompletness = function(orgUnit, multiOrgUnit){
        var modalOptions = {
            closeButtonText: 'no',
            actionButtonText: 'yes',
            headerText: 'mark_complete',
            bodyText: 'are_you_sure_to_save_completeness'
        };

        ModalService.showModal({}, modalOptions).then(function(result){
            
            CompletenessService.save($scope.model.selectedDataSet.id, 
                $scope.model.selectedPeriod.id, 
                orgUnit,
                $scope.model.selectedAttributeCategoryCombo.id,
                ActionMappingUtils.getOptionIds($scope.model.selectedOptions),
                multiOrgUnit).then(function(response){
                    
                var dialogOptions = {
                    headerText: 'success',
                    bodyText: 'marked_complete'
                };
                DialogService.showDialog({}, dialogOptions);
                //processCompletness(orgUnit, multiOrgUnit, true);                
                //$scope.model.dataSetCompleted = angular.equals({}, $scope.model.dataSetCompletness);
                $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo] = true;                
                
            }, function(response){
                ActionMappingUtils.errorNotifier( response );
            });
        });        
    };
    
    $scope.deleteCompletness = function( orgUnit, multiOrgUnit){
        var modalOptions = {
            closeButtonText: 'no',
            actionButtonText: 'yes',
            headerText: 'mark_incomplete',
            bodyText: 'are_you_sure_to_delete_completeness'
        };

        ModalService.showModal({}, modalOptions).then(function(result){
            
            CompletenessService.delete($scope.model.selectedDataSet.id, 
                $scope.model.selectedPeriod.id, 
                orgUnit,
                $scope.model.selectedAttributeCategoryCombo.id,
                ActionMappingUtils.getOptionIds($scope.model.selectedOptions),
                multiOrgUnit).then(function(response){
                
                var dialogOptions = {
                    headerText: 'success',
                    bodyText: 'marked_incomplete'
                };
                DialogService.showDialog({}, dialogOptions);
                //processCompletness(orgUnit, multiOrgUnit, false);
                //$scope.model.dataSetCompleted = !angular.equals({}, $scope.model.dataSetCompletness);
                $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo] = false;
                
            }, function(response){
                ActionMappingUtils.errorNotifier( response );
            });
        });        
    };
});
