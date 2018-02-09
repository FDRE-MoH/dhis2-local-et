/* global angular */

'use strict';

var routineDataEntry = angular.module('routineDataEntry');

//Controller for settings page
routineDataEntry.controller('dataEntryController',
        function($scope,
                $filter,
                $modal,
                $translate,
                orderByFilter,
                SessionStorageService,
                storage,
                DataSetFactory,
                PeriodService,
                MetaDataFactory,
                DataElementGroupFactory,
                DataEntryUtils,
                DataValueService,
                CompletenessService,
                ModalService,
                DialogService) {
    $scope.periodOffset = 0;
    $scope.maxOptionSize = 30;
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
        $scope.dataValuesCopy = {};
        $scope.model.basicAuditInfo = {};
        $scope.model.orgUnitsWithValues = [];
        $scope.model.categoryOptionsReady = false;
        $scope.model.valueExists = false;
        if( angular.isObject($scope.selectedOrgUnit)){
            SessionStorageService.set('SELECTED_OU', $scope.selectedOrgUnit); 
            var systemSetting = storage.get('SYSTEM_SETTING');
            $scope.model.allowMultiOrgUnitEntry = systemSetting && systemSetting.multiOrganisationUnitForms ? systemSetting.multiOrganisationUnitForms : false;
            $scope.model.booleanValues = [{displayName: $translate.instant('yes'), value: true},{displayName: $translate.instant('no'), value: false}];
            if(!$scope.model.optionSets){
                $scope.model.optionSets = [];                
                MetaDataFactory.getAll('optionSets').then(function(opts){
                    angular.forEach(opts, function(op){
                        $scope.model.optionSets[op.id] = op;
                    });
                    
                    MetaDataFactory.getAll('categoryCombos').then(function(ccs){
                        angular.forEach(ccs, function(cc){
                            $scope.model.categoryCombos[cc.id] = cc;
                        });

                        MetaDataFactory.getAll('validationRules').then(function(vrs){
                            $scope.model.validationRules = vrs;
                            $scope.controllingDataElementGroups = {};
                            $scope.groupsByMember = {};
                            DataElementGroupFactory.getControllingDataElementGroups().then(function( degs ){
                                angular.forEach(degs, function(deg){
                                    $scope.controllingDataElementGroups[deg.id] = deg;
                                    angular.forEach(deg.dataElements, function(de){
                                        $scope.groupsByMember[de] = deg.id;
                                    });
                                });
                                $scope.loadDataSets($scope.selectedOrgUnit); 
                            });
                            DataElementGroupFactory.getNonControllingDataElementGroups().then(function (degs) {
                                $scope.dataElementGroups = degs;
                            });
                        });
                    }); 
                });
            }
            else{
                $scope.loadDataSets($scope.selectedOrgUnit);
            }
        }
    });
    
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
            DataSetFactory.getByOuAndProperty( $scope.selectedOrgUnit, $scope.model.selectedDataSet,'DataSetCategory','Routine' ).then(function(response){                
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
        $scope.dataValuesCopy = {};
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
        $scope.dataValuesCopy = {};
        $scope.model.valueExists = false;
        reinitializeControllingDataElementGroupDetails();        
        $scope.loadDataEntryForm();        
    });    
    
    function reinitializeControllingDataElementGroupDetails() {        
        angular.forEach($scope.controllingDataElementGroups, function(deg){
            deg.isDisabled = true;
        });
    }
    
    $scope.checkDisabled = function (section,de,oco){
        if($scope.model && $scope.model.dataSetCompletness && $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo]){//if dataset is complete return true (disabled) without checking anything.
            return true;
        }
        else if(de.controlling_data_element){//if data element is a controlling data element return false (is not disabled)
                                        //it is only disabled when the dataSet is marked complete.
            return false;
        }
        
        else if(section.greyedFields.indexOf(de.id+'.'+oco.id) !== -1){//if the category option combo is greyed out return true;
            return true;
        }
        else if($scope.controllingDataElementGroups[$scope.groupsByMember[de.id]] && $scope.controllingDataElementGroups[$scope.groupsByMember[de.id]].isDisabled){
            //return if controlling data element value is disabled.
            return true;
        }
        //if the above conditions are not fullfilled return false;
        return false;
        //return (section.greyedFields.indexOf(de.id+'.'+oco.id) !== -1 || $scope.controllingDataElementGroups[$scope.groupsByMember[de.id]].isDisabled) && !de.controlling_data_element || $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo];
    }
    
    $scope.performAutoZero = function(section){
        var dataValueSet = {
            dataSet: $scope.model.selectedDataSet.id,
            period: $scope.model.selectedPeriod.id,
            orgUnit: $scope.selectedOrgUnit.id,
            dataValues: []
        };
        var counter=0;

        angular.forEach(section.dataElements, function (dataElement) {
            dataElement = $scope.model.dataElements[dataElement.id];
            if (dataElement && (dataElement.valueType === 'NUMBER' || dataElement.valueType === "INTEGER" || dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE")) {
                angular.forEach($scope.model.categoryCombos[dataElement.categoryCombo.id].categoryOptionCombos, function (categoryOptionCombo) {
                    if($scope.checkDisabled(section,dataElement,categoryOptionCombo)){
                        return;
                    }
                    //check if the data value of the data element has a catagoroptiondownloaded
                    if (!$scope.dataValues[dataElement.id]) {
                        $scope.dataValues[dataElement.id] = {};
                    }
                    //check if the category option is null or had a value
                    if (!$scope.dataValues[dataElement.id][categoryOptionCombo.id]) {
                        counter=counter+1;
                        var val = {dataElement: dataElement.id, categoryOptionCombo: categoryOptionCombo.id, value: '0'};
                        dataValueSet.dataValues.push(val);

                    }
                    //check if dataValue of thte data element and the exists but it's value is empty or null.
                    else if ($scope.dataValues[dataElement.id][categoryOptionCombo.id].value === '' || $scope.dataValues[dataElement.id][categoryOptionCombo.id].value === "" || $scope.dataValues[dataElement.id][categoryOptionCombo.id].value === null) {
                        counter=counter+1;
                        var val = {dataElement: dataElement.id, categoryOptionCombo: categoryOptionCombo.id, value: '0'};
                        dataValueSet.dataValues.push(val);
                    }
                });
            }
        });
        var modalOptions = {
            closeButtonText: 'no',
            actionButtonText: 'yes',
            headerText: 'fill_zero',
            bodyText: $translate.instant('are_you_sure_you_want_to_fill')+" "+ counter
        };

        ModalService.showModal({}, modalOptions).then(function (result) {
            angular.forEach(dataValueSet.dataValues,function (dataValue){
                if (!$scope.dataValues[dataValue.dataElement][dataValue.categoryOptionCombo]) {
                    $scope.dataValues[dataValue.dataElement][dataValue.categoryOptionCombo] = {};
                }
                $scope.dataValues[dataValue.dataElement][dataValue.categoryOptionCombo].value=0;
            });
            DataValueService.saveDataValueSet(dataValueSet).then(function (response) {
                copyDataValues();
                console.log("successfully saved", response);
                
                //change the input fields color to Green for feedback.
                angular.forEach(dataValueSet.dataValues,function(dataValue){
                    if(!$scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo]){
                        $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo]={};
                    }
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].saved=true;
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].pending=false;
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].error=false;
                    
                });
            }, function () {
                //turn the input fields to red as a feedback for the users if error occurs    
                angular.forEach(dataValueSet.dataValues,function(dataValue){
                    if(!$scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo]){
                        console.log('true')
                        $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo]={};
                    }
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].saved=false;
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].pending=false;
                    $scope.saveStatus[dataValue.dataElement+'-'+dataValue.categoryOptionCombo].error=true; 
                });
            });
        });
        //performing the save

    };
        
    $scope.loadDataSetDetails = function(){        
        if( $scope.model.selectedDataSet && $scope.model.selectedDataSet.id && $scope.model.selectedDataSet.periodType){
            
            var opts = {
                periodType: $scope.model.selectedDataSet.periodType,
                periodOffset: $scope.periodOffset,
                futurePeriods: $scope.model.selectedDataSet.openFuturePeriods
            };
            
            $scope.model.periods = PeriodService.getPeriods( opts );

            if(!$scope.model.selectedDataSet.dataElements || $scope.model.selectedDataSet.dataElements.length < 1){                
                DataEntryUtils.notify('error', 'missing_data_elements_indicators');
                return;
            }
                        
            $scope.model.selectedAttributeCategoryCombo = null;     
            if( $scope.model.selectedDataSet && $scope.model.selectedDataSet.categoryCombo && $scope.model.selectedDataSet.categoryCombo.id ){
                
                $scope.model.selectedAttributeCategoryCombo = $scope.model.categoryCombos[$scope.model.selectedDataSet.categoryCombo.id];
                if( $scope.model.selectedAttributeCategoryCombo && $scope.model.selectedAttributeCategoryCombo.isDefault ){
                    $scope.model.categoryOptionsReady = true;
                    $scope.model.selectedOptions = $scope.model.selectedAttributeCategoryCombo.categories[0].categoryOptions;
                }                
                angular.forEach($scope.model.selectedAttributeCategoryCombo.categoryOptionCombos, function(oco){
                    $scope.model.selectedAttributeOptionCombos['"' + oco.displayName + '"'] = oco.id;
                });
            }
            
            $scope.model.dataElements = [];
            $scope.tabOrder = {};
            var idx = 0;
            angular.forEach($scope.model.selectedDataSet.dataElements, function(de){
                de.validationRules = [];
                angular.forEach($scope.model.validationRules, function(vr){
                    if( vr.params && vr.params.length > 0 && vr.params.indexOf(de.id) !== -1){
                        de.validationRules.push( vr );
                    }
                });
                $scope.model.dataElements[de.id] = de;
                
                $scope.tabOrder[de.id] = {};
                angular.forEach($scope.model.categoryCombos[de.categoryCombo.id].categoryOptionCombos, function(oco){
                    $scope.tabOrder[de.id][oco.id] = idx++;
                });
                
            });
            
            if( $scope.model.selectedDataSet.sections.length > 0 ){
                $scope.tabOrder = {};
                idx = 0;
                angular.forEach($scope.model.selectedDataSet.sections, function(section){                    
                    angular.forEach(section.dataElements, function(de){
                        angular.forEach($scope.dataElementGroups,function(dataElementGroup){
                           if(dataElementGroup.dataElements[de.id]){
                               if(!dataElementGroup.previouslyTaken ){
                                   dataElementGroup.previouslyTaken=true;
                                   $scope.model.dataElements[de.id].displayTitle={};
                                   $scope.model.dataElements[de.id].displayTitle.displayName=dataElementGroup.displayName;
                                   $scope.model.dataElements[de.id].displayTitle.serialNumber=dataElementGroup.serial_number;
                               }
                           } 
                        });
                        $scope.tabOrder[de.id] = {};
                        var dataElement = $scope.model.dataElements[de.id];
                        if( dataElement && dataElement.categoryCombo ){
                            angular.forEach($scope.model.categoryCombos[dataElement.categoryCombo.id].categoryOptionCombos, function(oco){
                                $scope.tabOrder[de.id][oco.id] = idx++;
                            });
                        }
                        else{
                            console.log('dataSet:  ', $scope.model.selectedDataSet.displayName, ', section:  ', section.displayName, ', dataElement:  ', de.id);
                        }
                    });
                    angular.forEach(section.indicators,function(indicator){
                       angular.forEach(indicator.attributeValues,function(attribute){
                           var val=attribute.value;
                           if(val==="true"){
                               val=true;
                           }else if(val==="false"){
                               val=false;
                           }
                           indicator[attribute.attribute.code]= val;
                       }); 
                    });
                });
            }
        }
    };
    
    var resetParams = function(){
        $scope.dataValues = {};
        $scope.dataValuesCopy = {};
        $scope.model.orgUnitsWithValues = [];
        $scope.model.validationResults = [];
        $scope.model.failedValidationRules = [];
        $scope.model.selectedEvent = {};
        $scope.model.valueExists = false;
        $scope.model.basicAuditInfo = {};
        $scope.model.basicAuditInfo.exists = false;
        $scope.saveStatus = {};
    };
    
    var copyDataValues = function(){
        $scope.dataValuesCopy = angular.copy( $scope.dataValues );
    };
    
    $scope.loadDataEntryForm = function(){
        
        resetParams();        
        if( angular.isObject( $scope.selectedOrgUnit ) && $scope.selectedOrgUnit.id &&
                angular.isObject( $scope.model.selectedDataSet ) && $scope.model.selectedDataSet.id &&
                angular.isObject( $scope.model.selectedPeriod) && $scope.model.selectedPeriod.id &&
                $scope.model.categoryOptionsReady ){
            
            var dataValueSetUrl = 'dataSet=' + $scope.model.selectedDataSet.id + '&period=' + $scope.model.selectedPeriod.id;

            dataValueSetUrl += '&orgUnit=' + $scope.selectedOrgUnit.id;
            
            $scope.model.selectedAttributeOptionCombo = DataEntryUtils.getOptionComboIdFromOptionNames($scope.model.selectedAttributeOptionCombos, $scope.model.selectedOptions);
            
            $scope.model.attributeCategoryUrl = {cc: $scope.model.selectedAttributeCategoryCombo.id, default: $scope.model.selectedAttributeCategoryCombo.isDefault, cp: DataEntryUtils.getOptionIds($scope.model.selectedOptions)};
                        
            //fetch data values...
            DataValueService.getDataValueSet( dataValueSetUrl ).then(function(response){                
                if( response && response.dataValues && response.dataValues.length > 0 ){
                    response.dataValues = $filter('filter')(response.dataValues, {attributeOptionCombo: $scope.model.selectedAttributeOptionCombo});
                    if( response.dataValues.length > 0 ){
                        $scope.model.valueExists = true;
                        angular.forEach(response.dataValues, function(dv){
                            
                            dv.value = DataEntryUtils.formatDataValue( $scope.model.dataElements[dv.dataElement], dv.value, $scope.model.optionSets, 'USER' );
                            
                            if(!$scope.dataValues[dv.dataElement]){                                
                                $scope.dataValues[dv.dataElement] = {};
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv;
                            }
                            else{                                
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv;
                            }                            
                            //check if the dataElement is controlling dataElement and set the dataElementGroup
                            if($scope.model.dataElements[dv.dataElement].controlling_data_element && 
                                    $scope.model.dataElements[dv.dataElement].controlling_data_element === true &&
                                    $scope.groupsByMember[dv.dataElement] &&
                                    $scope.controllingDataElementGroups[$scope.groupsByMember[dv.dataElement]]){
                                $scope.controllingDataElementGroups[$scope.groupsByMember[dv.dataElement]].isDisabled = !dv.value;
                            }                            
                        });
                        response.dataValues = orderByFilter(response.dataValues, '-created').reverse();                    
                        $scope.model.basicAuditInfo.created = $filter('date')(response.dataValues[0].created, 'dd MMM yyyy');
                        $scope.model.basicAuditInfo.storedBy = response.dataValues[0].storedBy;
                        $scope.model.basicAuditInfo.exists = true;
                    }
                }
                
                angular.forEach($scope.dataValues, function(vals, de) {
                    $scope.dataValues[de] = DataEntryUtils.getDataElementTotal( $scope.dataValues, de);
                });
                
                angular.forEach($scope.model.selectedDataSet.dataElements, function(de){                    
                    var vres = DataEntryUtils.getValidationResult($scope.model.dataElements[de.id], $scope.dataValues, $scope.model.failedValidationRules);
                    $scope.model.failedValidationRules = vres.failed ? vres.failed : $scope.model.failedValidationRules;                    
                });
                
                copyDataValues();
                
                $scope.model.dataSetCompletness = {};
                CompletenessService.get( $scope.model.selectedDataSet.id, 
                                        $scope.selectedOrgUnit.id,
                                        $scope.model.selectedPeriod.id,
                                        $scope.model.allowMultiOrgUnitEntry).then(function(response){                
                    if( response && 
                            response.completeDataSetRegistrations && 
                            response.completeDataSetRegistrations.length &&
                            response.completeDataSetRegistrations.length > 0){

                        angular.forEach(response.completeDataSetRegistrations, function(cdr){
                            $scope.model.dataSetCompletness[cdr.attributeOptionCombo] = true;                        
                        });
                    }
                });
            });
        }
    };
    
    $scope.interacted = function(field) {
        var status = false;
        if(field){            
            status = $scope.outerForm.submitted || field.$dirty;
        }
        return status;
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
        $scope.model.selectedPeriod = null;        
        var opts = {
            periodType: $scope.model.selectedDataSet.periodType,
            periodOffset: mode === 'NXT' ? ++$scope.periodOffset: --$scope.periodOffset,
            futurePeriods: $scope.model.selectedDataSet.openFuturePeriods
        };        
        $scope.model.periods = PeriodService.getPeriods( opts );
    };
    
    $scope.saveDataValue = function( deId, ocId ){
        
        //check for form validity                
        if( $scope.outerForm.$invalid ){            
            $scope.dataValues[deId][ocId] = $scope.dataValuesCopy[deId] && $scope.dataValuesCopy[deId][ocId] ? $scope.dataValuesCopy[deId][ocId] : {value: null};
            $scope.outerForm.$error = {};
            $scope.outerForm.$setPristine();
            return ;
        }
        
        //form is valid        
        $scope.saveStatus[ deId + '-' + ocId] = {saved: false, pending: true, error: false};
        
        var getValue=function(deId,ocId){
            if($scope.dataValues[deId][ocId] && ($scope.dataValues[deId][ocId].value || $scope.dataValues[deId][ocId].value===0 || $scope.dataValues[deId][ocId].value===false)){
                //above condition is included to allow saving of the value zero and false,
                //since the condition automatically assumes both zero and false as a false condition, it was jumping them.
                return $scope.dataValues[deId][ocId].value;
            }
            else{
                return '';
            }
        }
        
        var dataValue = {ou: $scope.selectedOrgUnit.id,
                    pe: $scope.model.selectedPeriod.id,
                    de: deId,
                    co: ocId,
                    value: getValue(deId,ocId),
                    ao: $scope.model.selectedAttributeOptionCombo
                };
                
        dataValue.value = DataEntryUtils.formatDataValue( $scope.model.dataElements[deId], dataValue.value, $scope.model.optionSets, 'API' );
        
        if( $scope.model.selectedAttributeCategoryCombo && !$scope.model.selectedAttributeCategoryCombo.isDefault ){            
            dataValue.cc = $scope.model.selectedAttributeCategoryCombo.id;
            dataValue.cp = DataEntryUtils.getOptionIds($scope.model.selectedOptions);
        }
        
        var processDataValue = function(){
            copyDataValues();
            $scope.dataValues[deId] = DataEntryUtils.getDataElementTotal( $scope.dataValues, deId);
            var vres = DataEntryUtils.getValidationResult($scope.model.dataElements[deId], $scope.dataValues, $scope.model.failedValidationRules);
            $scope.model.failedValidationRules = vres.failed ? vres.failed : $scope.model.failedValidationRules;
        };
        
        var saveSuccessStatus = function(){
            $scope.saveStatus[deId + '-' + ocId].saved = true;
            $scope.saveStatus[deId + '-' + ocId].pending = false;
            $scope.saveStatus[deId + '-' + ocId].error = false;            
        };
        
        var saveFailureStatus = function(){
            $scope.saveStatus[deId + '-' + ocId].saved = false;
            $scope.saveStatus[deId + '-' + ocId].pending = false;
            $scope.saveStatus[deId + '-' + ocId].error = true;
        };

        if( $scope.model.dataElements[deId].controlling_data_element && 
                $scope.groupsByMember[deId] && 
                $scope.controllingDataElementGroups[$scope.groupsByMember[deId]] &&
                $scope.controllingDataElementGroups[$scope.groupsByMember[deId]].dataElements ){            
            //this means that the dataElement is a controlling dataElement
            var dataValueSet={
                dataSet: $scope.model.selectedDataSet.id,
                period:$scope.model.selectedPeriod.id,
                orgUnit: $scope.selectedOrgUnit.id,
                attributeOptionCombo: $scope.model.selectedAttributeOptionCombo,
                dataValues: []
            };
            
            if( $scope.model.selectedAttributeCategoryCombo && !$scope.model.selectedAttributeCategoryCombo.isDefault ){            
                dataValueSet.cc = $scope.model.selectedAttributeCategoryCombo.id;
                dataValueSet.cp = DataEntryUtils.getOptionIds($scope.model.selectedOptions);
            }
            
            
            if( dataValue.value && dataValue.value !== '' ){
                //value set to true, open all blocked fields
                $scope.controllingDataElementGroups[$scope.groupsByMember[deId]].isDisabled=false;
            } else{
                //value set to false or empty. 
                //show modal message. 
                //if user accepts clear values, block fields and save all changes.
                var _dataValues = angular.copy( $scope.dataValues );
                var count = 0;                
                angular.forEach($scope.controllingDataElementGroups[$scope.groupsByMember[deId]].dataElements, function(_deId){                    
                    if( _dataValues[_deId] && _deId !== deId ){
                        angular.forEach(_dataValues[_deId], function(val, key) {
                            if( key === 'total' ){
                                _dataValues[_deId].total = 0;
                            }
                            else{
                                val.value = "";
                                _dataValues[_deId][key] = val;
                                dataValueSet.dataValues.push({dataElement: _deId, categoryOptionCombo: key, value: "", deleted: true});
                                count++;
                            }
                        });
                    }
                });
                
                dataValueSet.dataValues.push({dataElement: deId, categoryOptionCombo: ocId, value: dataValue.value, deleted: dataValue.value === '' ? true : false});
                
                if( count > 0 ){
                    var modalOptions={
                        closeButtonText: 'no',
                        actionButtonText: 'yes',
                        headerText: 'auto_zero_warning',
                        bodyText: 'are_you_sure_to_discard_all_saved_data_in_group'
                    };
                    ModalService.showModal({},modalOptions).then(function (){
                        //this means user clicked yes.
                        //save value of the controlling data element, discard all the values stored under the datElementGroup.                        
                        $scope.controllingDataElementGroups[$scope.groupsByMember[deId]].isDisabled=true;
                        DataValueService.saveDataValueSet(dataValueSet).then(function(response){
                            $scope.dataValues = Object.assign($scope.dataValues, _dataValues);
                            var dialogOptions={
                                headerText:'success',
                                bodyText: 'child_data_element_groups_deleted_successfully'
                            };
                            DialogService.showDialog({},dialogOptions);
                            saveSuccessStatus();
                            processDataValue();
                        },function (){                            
                            var dialogOptions={
                                headerText:'error',
                                bodyText: 'error_deleting_dataValues_of_data_element_groups'
                            };
                            DialogService.showDialog({},dialogOptions);                            
                            saveFailureStatus();
                        });
                        return;//return so that it won't continue to save the dataValue Object created above.
                    },function (){
                        //this means that the user clicked NO so no changes will be saved.
                        $scope.dataValues[deId][ocId].value=true;
                        return;//return so that it won't continue to save the dataValue object created above.
                    });
                    return;//return so that it won't continue to save the dataValue object created above.
                }
            }                
        }
        
        //this means it is not controller dataElelement or the controller data element is set to true so continue saving the data.
        
        DataValueService.saveDataValue( dataValue ).then(function(response){
           saveSuccessStatus();
           processDataValue();           
        }, function(){
            saveFailureStatus();
        });
    };
    
    $scope.getIndicatorValue = function( indicator ){  
        return DataEntryUtils.getIndicatorResult( indicator, $scope.dataValues );
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
        
    $scope.getAuditInfo = function(de, oco, value, comment, followUp){ 
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
                    return  $scope.selectedOrgUnit.id;
                },
                attributeCategoryCombo: function(){
                    return $scope.model.selectedAttributeCategoryCombo;
                },
                attributeCategoryOptions: function(){
                    return DataEntryUtils.getOptionIds($scope.model.selectedOptions);
                },
                attributeOptionCombo: function(){
                    return $scope.model.selectedAttributeOptionCombo;
                },
                optionCombo: function(){
                    return oco;
                },
                followUp: function(){
                    return followUp;
                }
            }
        });
        
        modalInstance.result.then(function (status) {
            var dataValue=status.dataValue;
            
            /**
             * changing followup and comment is necessary here because if the 
             * history window is reopened after editing the followup and the 
             * comment we need to refresh the page inorder to see the change.
             * But in this case when reopening the window, the appropriate data 
             * will be replied back to it.
             */
            
            if(dataValue.followUp){ 
                $scope.dataValues[dataValue.de][dataValue.co].followUp=true;
            }
            if(dataValue.comment){
                $scope.dataValues[dataValue.de][dataValue.co].comment=dataValue.comment;
            }
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
            
            var dsr = {completeDataSetRegistrations: [{dataSet: $scope.model.selectedDataSet.id, organisationUnit: $scope.selectedOrgUnit.id, period: $scope.model.selectedPeriod.id, attributeOptionCombo: $scope.model.selectedAttributeOptionCombo}]};
            CompletenessService.save(dsr).then(function(response){                    
                if( response && response.status === 'SUCCESS' ){
                    var dialogOptions = {
                        headerText: 'success',
                        bodyText: 'marked_complete'
                    };
                    DialogService.showDialog({}, dialogOptions);
                    $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo] = true;
                }                
            }, function(response){
                DataEntryUtils.errorNotifier( response );
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
                DataEntryUtils.getOptionIds($scope.model.selectedOptions),
                multiOrgUnit).then(function(response){
                
                var dialogOptions = {
                    headerText: 'success',
                    bodyText: 'marked_incomplete'
                };
                DialogService.showDialog({}, dialogOptions);
                $scope.model.dataSetCompletness[$scope.model.selectedAttributeOptionCombo] = false;
                
            }, function(response){
                DataEntryUtils.errorNotifier( response );
            });
        });        
    };
});
