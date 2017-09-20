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
                DataEntryUtils,
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
    $scope.model.booleanValues = [{displayName: 'yes', value: true},{displayName: 'no', value: false}];
    
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
        $scope.getControllerDataElementGroups();
    });
    
    $scope.$watch('model.selectedPeriod', function(){
        $scope.dataValues = {};
        $scope.dataValuesCopy = {};
        $scope.model.valueExists = false;
        reinitializeGroupDetails();        
        $scope.loadDataEntryForm();        
    });    
    
    function reinitializeGroupDetails() {
        for (var i = 0; i < $scope.dataElementGroups.length; i++) {
            if ($scope.dataElementGroups[i].data_controller_group) {
                $scope.dataElementGroups[i].isDisabled = true;
            }
        }
    }
    
    $scope.getControllerDataElementGroups = function () {
        $scope.dataElementGroups = [];
        MetaDataFactory.getAll('dataElementGroups').then(function (tempDataElementGroups) {
            angular.forEach(tempDataElementGroups, function (dataElementGroup) {
                if (dataElementGroup.data_controller_group && dataElementGroup.data_controller_group) {
                    //this dataElementGroup is a controller group
                    //initially it should be disabled
                    dataElementGroup.isDisabled = true;
                    for (var i = 0; i < dataElementGroup.dataElements.length; i++) {
                        if ($scope.model.dataElements) {
                            var newId = dataElementGroup.dataElements[i].id;
                            var newDataElement = $scope.model.dataElements[newId];
                            if (newDataElement && newDataElement.controlling_data_element) {
                                angular.forEach(dataElementGroup.dataElements, function (dataElement) {
                                    dataElementGroup.dataElements[dataElement.id] = dataElement;
                                });
                                $scope.dataElementGroups.push(dataElementGroup);
                            }
                        }
                    }
                }
            });
        });
    };
    
    $scope.checkForGrayField = function (dataElement) {
        if (dataElement.controlling_data_element) {
            return false;
        }
        for (var i = 0; i < $scope.dataElementGroups.length; i++) {
            if ($scope.dataElementGroups[i].dataElements[dataElement.id]) {
                return $scope.dataElementGroups[i].isDisabled;
            }
        }
        return false;
    };
    
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
            if ((dataElement.valueType === 'NUMBER' || dataElement.valueType === "INTEGER" || dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE") && !$scope.checkForGrayField(dataElement)) {
                angular.forEach($scope.model.categoryCombos[dataElement.categoryCombo.id].categoryOptionCombos, function (categoryOptionCombo) {
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

            }, function () {
                console.log("error when saving");
            });
        });
        //performing the save

    };
        
    $scope.loadDataSetDetails = function(){        
        if( $scope.model.selectedDataSet && $scope.model.selectedDataSet.id && $scope.model.selectedDataSet.periodType){
            
            $scope.model.periods = PeriodService.getPeriods($scope.model.selectedDataSet.periodType, $scope.model.periodOffset);

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
                            
                            dv.value = DataEntryUtils.formatDataValue( $scope.model.dataElements[dv.dataElement], dv.value );
                            
                            if(!$scope.dataValues[dv.dataElement]){                                
                                $scope.dataValues[dv.dataElement] = {};
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv;
                            }
                            else{                                
                                $scope.dataValues[dv.dataElement][dv.categoryOptionCombo] = dv;
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
        
        //check for form validity                
        if( $scope.outerForm.$invalid ){            
            $scope.dataValues[deId][ocId] = $scope.dataValuesCopy[deId] && $scope.dataValuesCopy[deId][ocId] ? $scope.dataValuesCopy[deId][ocId] : {value: null};
            $scope.outerForm.$error = {};
            $scope.outerForm.$setPristine();
            return ;
        }
        
        //form is valid        
        $scope.saveStatus[ deId + '-' + ocId] = {saved: false, pending: true, error: false};
        
        var dataValue = {ou: $scope.selectedOrgUnit.id,
                    pe: $scope.model.selectedPeriod.id,
                    de: deId,
                    co: ocId,
                    value: $scope.dataValues[deId][ocId] && $scope.dataValues[deId][ocId].value || $scope.dataValues[deId][ocId].value === false ? $scope.dataValues[deId][ocId].value : ''
                };        
        
        if( $scope.model.selectedAttributeCategoryCombo && !$scope.model.selectedAttributeCategoryCombo.isDefault ){            
            dataValue.cc = $scope.model.selectedAttributeCategoryCombo.id;
            dataValue.cp = DataEntryUtils.getOptionIds($scope.model.selectedOptions);
        }        
                
        DataValueService.saveDataValue( dataValue ).then(function(response){
           $scope.saveStatus[deId + '-' + ocId].saved = true;
           $scope.saveStatus[deId + '-' + ocId].pending = false;
           $scope.saveStatus[deId + '-' + ocId].error = false;
           copyDataValues();
           
           $scope.dataValues[deId] = DataEntryUtils.getDataElementTotal( $scope.dataValues, deId);
           var vres = DataEntryUtils.getValidationResult($scope.model.dataElements[deId], $scope.dataValues, $scope.model.failedValidationRules);
           $scope.model.failedValidationRules = vres.failed ? vres.failed : $scope.model.failedValidationRules;           
           
           //Included for Graying of fields when controller data element changes it's values
           var dataElement = $scope.model.dataElements[deId];
           //check if data element is a controller dataElement
            if (dataElement.controlling_data_element && dataElement.controlling_data_element === true) {
                //loop on all dataElementGroups to find which group the data element controlls
                for (var i = 0; i < $scope.dataElementGroups.length; i++) {
                    if ($scope.dataElementGroups[i].dataElements[deId]) {
                        //if set to false (from notrmal to grayed) show a popup message.
                        if (!$scope.dataValues[deId][ocId]) {

                            var modalOptions = {
                                closeButtonText: 'no',
                                actionButtonText: 'yes',
                                headerText: 'auto_zero_warning',
                                bodyText: 'are_you_sure_to_discard_all_saved_data_in_group'
                            };
                            
                            //temporarily store the dataElement Group to access inside the modal
                            $scope.selectedDataElementGroup = $scope.dataElementGroups[i];

                            ModalService.showModal({}, modalOptions).then(function (result) {
                                
                                //if user clicked ok save the value of the data element, discard all the 
                                //values stored under that dataElementGroup and display a success message.
                                $scope.selectedDataElementGroup.isDisabled = !$scope.dataValues[deId][ocId];
                                //use dataValueSet to delete all values for less communication.
                                var dataValueSet = {
                                    dataSet: $scope.model.selectedDataSet.id,
                                    period: $scope.model.selectedPeriod.id,
                                    orgUnit: $scope.selectedOrgUnit.id,
                                    dataValues: []
                                };
                                for (var j = 0; j < $scope.selectedDataElementGroup.dataElements.length; j++) {
                                    var childDataElement = $scope.selectedDataElementGroup.dataElements[j];
                                    childDataElement = $scope.model.dataElements[childDataElement.id];
                                    //only delete if a data is stored with that data value otherwise ignore that data element
                                    if ($scope.dataValues[childDataElement.id]) {
                                        $scope.dataValues[childDataElement.id] = {};
                                        //delete the values of the child dataelement for each category option combo.
                                        angular.forEach($scope.model.categoryCombos[childDataElement.categoryCombo.id].categoryOptionCombos, function (categoryOptionCombo) {
                                            $scope.dataValues[childDataElement.id][categoryOptionCombo.id] = null;
                                            var val = {dataElement: childDataElement.id, categoryOptionCombo: categoryOptionCombo.id, attributeOptionCombo: $scope.model.selectedAttributeOptionCombos, value: ""};
                                            dataValueSet.dataValues.push(val);
                                        });
                                    }
                                }
                                //delte the temporary variable created above
                                $scope.selectedDataElementGroup = null;

                                //perform the delete by saving the dataValueSet created above
                                DataValueService.saveDataValueSet(dataValueSet).then(function (response) {
                                    copyDataValues();
                                    //show a success dialog
                                    console.log("successfully saved");
                                    console.log(response);
                                    var dialogOptions = {
                                        headerText: 'success',
                                        bodyText: 'child_data_element_groups_deleted_succesfully'
                                    };
                                    DialogService.showDialog({}, dialogOptions);

                                }, function () {
                                    //show an error dialog if problem in saving
                                    console.log("error when saving");
                                    console.log(response);
                                    var dialogOptions = {
                                        headerText: 'error',
                                        bodyText: 'error_deleting_dataValues_of_data_element_groups'
                                    };
                                    DialogService.showDialog({}, dialogOptions);
                                });
                            }, function () {
                                $scope.dataValues[deId][ocId] = !$scope.dataValues[deId][ocId];
                            });
                        } else {
                            //restore back to initial value
                            $scope.dataElementGroups[i].isDisabled = !$scope.dataValues[deId][ocId];


                        }
                    }
                }
            }
           
        }, function(){
            $scope.saveStatus[deId + '-' + ocId].saved = false;
            $scope.saveStatus[deId + '-' + ocId].pending = false;
            $scope.saveStatus[deId + '-' + ocId].error = true;
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
        
    $scope.getAuditInfo = function(de, oco, value, comment){        
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
