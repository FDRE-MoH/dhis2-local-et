/* global angular, moment, dhis2, parseFloat */

'use strict';

/* Services */

var actionMappingServices = angular.module('actionMappingServices', ['ngResource'])

.factory('PMTStorageService', function(){
    var store = new dhis2.storage.Store({
        name: "dhis2rd",
        adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
        objectStores: ['dataSets', 'optionSets', 'categoryCombos', 'programs', 'ouLevels', 'indicatorTypes', 'validationRules','dataElementGroups']
    });
    return{
        currentStore: store
    };
})

/* current selections */
.service('PeriodService', function(DateUtils){
    
    this.getPeriods = function(periodType, periodOffset){
        periodOffset = angular.isUndefined(periodOffset) ? 0 : periodOffset;
        var availablePeriods = [];
        if(!periodType){
            return availablePeriods;
        }        

        var pt = new PeriodType();
        var d2Periods = pt.get(periodType).generatePeriods({offset: periodOffset, filterFuturePeriods: false, reversePeriods: false});
        angular.forEach(d2Periods, function(p){
            p.endDate = DateUtils.formatFromApiToUser(p.endDate);
            p.startDate = DateUtils.formatFromApiToUser(p.startDate);
            if(moment(DateUtils.getToday()).isAfter(p.endDate)){                    
                availablePeriods.push( p );
            }
        });        
        availablePeriods = availablePeriods.reverse();
        return availablePeriods;
    };
})

/* Factory to fetch optionSets */
.factory('OptionSetService', function($q, $rootScope, PMTStorageService) { 
    return {
        getAll: function(){
            
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('optionSets').done(function(optionSets){
                    $rootScope.$apply(function(){
                        def.resolve(optionSets);
                    });                    
                });
            });            
            
            return def.promise;            
        },
        get: function(uid){            
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.get('optionSets', uid).done(function(optionSet){                    
                    $rootScope.$apply(function(){
                        def.resolve(optionSet);
                    });
                });
            });                        
            return def.promise;
        },
        getCode: function(options, key){
            if(options){
                for(var i=0; i<options.length; i++){
                    if( key === options[i].displayName){
                        return options[i].code;
                    }
                }
            }            
            return key;
        },        
        getName: function(options, key){
            if(options){
                for(var i=0; i<options.length; i++){                    
                    if( key === options[i].code){
                        return options[i].displayName;
                    }
                }
            }            
            return key;
        }
    };
})

/*service to fetch dataElementGroups*/
.factory('dataElementGroupService', function($q, $rootScope, PMTStorageService) { 
    return {
        getAll: function(){
            
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('dataElementGroups').done(function(dataElementGroups){
                    $rootScope.$apply(function(){
                        def.resolve(dataElementGroups);
                    });                    
                });
            });            
            
            return def.promise;            
        },
        get: function(uid){            
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.get('dataElementGroups', uid).done(function(dataElementGroup){                    
                    $rootScope.$apply(function(){
                        def.resolve(dataElementGroup);
                    });
                });
            });                        
            return def.promise;
        },
        getCode: function(options, key){
            if(options){
                for(var i=0; i<options.length; i++){
                    if( key === options[i].displayName){
                        return options[i].code;
                    }
                }
            }            
            return key;
        },        
        getName: function(options, key){
            if(options){
                for(var i=0; i<options.length; i++){                    
                    if( key === options[i].code){
                        return options[i].displayName;
                    }
                }
            }            
            return key;
        }
    };
})

/* Service to fetch option combos */
.factory('OptionComboService', function($q, $rootScope, PMTStorageService) { 
    return {
        getAll: function(){            
            var def = $q.defer();            
            var optionCombos = [];
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('categoryCombos').done(function(categoryCombos){
                    angular.forEach(categoryCombos, function(cc){
                        optionCombos = optionCombos.concat( cc.categoryOptionCombos );
                    });
                    $rootScope.$apply(function(){
                        def.resolve(optionCombos);
                    });                    
                });
            });            
            
            return def.promise;            
        },
        getMappedOptionCombos: function(uid){            
            var def = $q.defer();            
            var optionCombos = [];
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('categoryCombos').done(function(categoryCombos){
                    angular.forEach(categoryCombos, function(cc){
                        angular.forEach(cc.categoryOptionCombos, function(oco){
                            oco.categories = [];
                            angular.forEach(cc.categories, function(c){
                                oco.categories.push({id: c.id, displayName: c.displayName});
                            });
                            optionCombos[oco.id] = oco;
                        });
                    });
                    $rootScope.$apply(function(){
                        def.resolve(optionCombos);
                    });                    
                });
            });            
            
            return def.promise;            
        }
    };
})

/* Factory to fetch programs */
.factory('DataSetFactory', function($q, $rootScope, SessionStorageService, storage, PMTStorageService, orderByFilter, CommonUtils, ActionMappingUtils) { 
  
    return {        
        getActionDataSets: function( ou ){            
            var systemSetting = storage.get('SYSTEM_SETTING');
            var allowMultiOrgUnitEntry = systemSetting && systemSetting.multiOrganisationUnitForms ? systemSetting.multiOrganisationUnitForms : false;
    
            var roles = SessionStorageService.get('USER_ROLES');
            var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('dataSets').done(function(dss){
                    var multiDs = angular.copy(dss);
                    var dataSets = [];
                    var pushedDss = [];
                    
                    angular.forEach(dss, function(ds){
                        if( CommonUtils.userHasValidRole(ds, 'dataSets', userRoles ) && ds.organisationUnits.hasOwnProperty( ou.id ) ){
                            ds.entryMode = 'Single Entry';
                            ds = ActionMappingUtils.processDataSet( ds );
                            dataSets.push(ds);
                        }
                    });
                    
                    if( allowMultiOrgUnitEntry && ou.c && ou.c.length > 0 ){
                        
                        angular.forEach(multiDs, function(ds){  
                            
                            if( CommonUtils.userHasValidRole( ds, 'dataSets', userRoles ) ){
                                angular.forEach(ou.c, function(c){                                    
                                    if( ds.organisationUnits.hasOwnProperty( c ) && pushedDss.indexOf( ds.id ) === -1 && ds.dataSetType === "action"){
                                        ds.entryMode = 'Multiple Entry';
                                        ds = ActionMappingUtils.processDataSet( ds );
                                        dataSets.push(ds);
                                        pushedDss.push( ds.id );                                            
                                    }
                                });                               
                            }
                        });
                    }
                    $rootScope.$apply(function(){
                        def.resolve(dataSets);
                    });
                });
            });            
            return def.promise;            
        },
        getTargetDataSets: function(){
            
            var roles = SessionStorageService.get('USER_ROLES');
            var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('dataSets').done(function(dss){
                    var dataSets = [];                    
                    angular.forEach(dss, function(ds){
                        if( CommonUtils.userHasValidRole(ds, 'dataSets', userRoles ) && ds.dataSetType && ds.dataSetType === 'targetGroup'){                        
                            ds = ActionMappingUtils.processDataSet( ds );
                            dataSets.push(ds);
                        }
                    });
                    
                    $rootScope.$apply(function(){
                        def.resolve(dataSets);
                    });
                });
            });
            return def.promise;
        },
        getActionAndTargetDataSets: function(){
            
            var roles = SessionStorageService.get('USER_ROLES');
            var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('dataSets').done(function(dss){
                    var dataSets = [];                    
                    angular.forEach(dss, function(ds){
                        if( CommonUtils.userHasValidRole(ds, 'dataSets', userRoles ) && ds.dataSetType && ( ds.dataSetType === 'targetGroup' || ds.dataSetType === 'action') ){                        
                            ds = ActionMappingUtils.processDataSet( ds );
                            dataSets.push(ds);
                        }
                    });
                    
                    $rootScope.$apply(function(){
                        def.resolve(dataSets);
                    });
                });
            });
            return def.promise;
        },
        get: function(uid){
            
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.get('dataSets', uid).done(function(ds){
                    ds = ActionMappingUtils.processDataSet( ds );
                    $rootScope.$apply(function(){
                        def.resolve(ds);
                    });
                });
            });                        
            return def.promise;            
        },
        getByOu: function(ou, selectedDataSet){
            var roles = SessionStorageService.get('USER_ROLES');
            var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
            var def = $q.defer();
            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll('dataSets').done(function(dss){
                    var dataSets = [];
                    angular.forEach(dss, function(ds){                            
                        if(ds.organisationUnits.hasOwnProperty( ou.id ) && CommonUtils.userHasValidRole(ds,'dataSets', userRoles)){
                            ds = ActionMappingUtils.processDataSet( ds );
                            dataSets.push(ds);
                        }
                    });
                    
                    dataSets = orderByFilter(dataSets, '-displayName').reverse();
                    
                    if(dataSets.length === 0){
                        selectedDataSet = null;
                    }
                    else if(dataSets.length === 1){
                        selectedDataSet = dataSets[0];
                    } 
                    else{
                        if(selectedDataSet){
                            var continueLoop = true;
                            for(var i=0; i<dataSets.length && continueLoop; i++){
                                if(dataSets[i].id === selectedDataSet.id){                                
                                    selectedDataSet = dataSets[i];
                                    continueLoop = false;
                                }
                            }
                            if(continueLoop){
                                selectedDataSet = null;
                            }
                        }
                    }
                                        
                    if(!selectedDataSet || angular.isUndefined(selectedDataSet) && dataSets.legth > 0){
                        selectedDataSet = dataSets[0];
                    }
                    
                    $rootScope.$apply(function(){
                        def.resolve({dataSets: dataSets, selectedDataSet: selectedDataSet});
                    });                      
                });
            });            
            return def.promise;
        }
    };
})

/* factory to fetch and process programValidations */
.factory('MetaDataFactory', function($q, $rootScope, PMTStorageService, orderByFilter) {  
    
    return {        
        get: function(store, uid){            
            var def = $q.defer();            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.get(store, uid).done(function(obj){                    
                    $rootScope.$apply(function(){
                        def.resolve(obj);
                    });
                });
            });                        
            return def.promise;
        },
        set: function(store, obj){            
            var def = $q.defer();            
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.set(store, obj).done(function(obj){                    
                    $rootScope.$apply(function(){
                        def.resolve(obj);
                    });
                });
            });                        
            return def.promise;
        },
        getAll: function(store){
            var def = $q.defer();
            PMTStorageService.currentStore.open().done(function(){
                PMTStorageService.currentStore.getAll(store).done(function(objs){                    
                    objs = orderByFilter(objs, '-displayName').reverse();                    
                    $rootScope.$apply(function(){
                        def.resolve(objs);
                    });
                });                
            });            
            return def.promise;
        }
    };        
})

.service('DataValueService', function($http, ActionMappingUtils) {   
    
    return {        
        saveDataValue: function( dv ){
            
            var url = '?de='+dv.de + '&ou='+dv.ou + '&pe='+dv.pe + '&co='+dv.co + '&value='+dv.value;            
            
            if( dv.cc && dv.cp ) {
                url += '&cc='+dv.cc + '&cp='+dv.cp;
            }            
            if( dv.comment ){
                url += '&comment=' + dv.comment; 
            }            
            var promise = $http.post('../api/dataValues.json' + url).then(function(response){
                return response.data;
            });
            return promise;
        },
        getDataValue: function( dv ){
            var promise = $http.get('../api/dataValues.json?de='+dv.de+'&ou='+dv.ou+'&pe='+dv.pe).then(function(response){
                return response.data;
            });
            return promise;
        },
        saveDataValueSet: function(dvs){
            var promise = $http.post('../api/dataValueSets.json', dvs).then(function(response){
                return response.data;
            });
            return promise;
        },
        getDataValueSet: function( params ){            
            var promise = $http.get('../api/dataValueSets.json?' + params ).then(function(response){               
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });            
            return promise;
        }
    };    
})

.service('CompletenessService', function($http, ActionMappingUtils) {   
    
    return {        
        get: function( ds, ou, startDate, endDate, children ){
            var promise = $http.get('../api/completeDataSetRegistrations?dataSet='+ds+'&orgUnit='+ou+'&startDate='+startDate+'&endDate='+endDate+'&children='+children).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        save: function( ds, pe, ou, cc, cp, multiOu){
            var promise = $http.post('../api/completeDataSetRegistrations?ds='+ ds + '&pe=' + pe + '&ou=' + ou + '&cc=' + cc + '&cp=' + cp + '&multiOu=' + multiOu ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        delete: function( ds, pe, ou, cc, cp, multiOu){
            var promise = $http.delete('../api/completeDataSetRegistrations?ds='+ ds + '&pe=' + pe + '&ou=' + ou + '&cc=' + cc + '&cp=' + cp + '&multiOu=' + multiOu ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        }
    };
})

.service('DataValueAuditService', function($http, ActionMappingUtils) {   
    
    return {        
        getDataValueAudit: function( dv ){
            var promise = $http.get('../api/audits/dataValue.json?paging=false&de='+dv.de+'&ou='+dv.ou+'&pe='+dv.pe+'&co='+dv.co+'&cc='+dv.cc).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        }
    };
})

.service('EventValueAuditService', function($http, ActionMappingUtils) {   
    
    return {        
        getEventValueAudit: function( event ){
            var promise = $http.get('../api/audits/trackedEntityDataValue.json?paging=false&psi='+event).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        }
    };
})

.service('StakeholderService', function($http, ActionMappingUtils) {   
    
    return {        
        addCategoryOption: function( categoryOption ){
            var promise = $http.post('../api/categoryOptions.json' , categoryOption ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        updateCategory: function( category ){
            var promise = $http.put('../api/categories/' + category.id + '.json&mergeMode=MERGE', category ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        getCategoryCombo: function(uid){            
            var promise = $http.get('../api/categoryCombos/' + uid + '.json?fields=id,displayName,code,skipTotal,isDefault,categoryOptionCombos[id,displayName,categoryOptions[displayName]],categories[id,displayName,code,dimension,dataDimensionType,attributeValues[value,attribute[id,name,valueType,code]],categoryOptions[id,displayName,code]]').then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        addOption: function( opt ){
            var promise = $http.post('../api/options.json' , opt ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        updateOptionSet: function( optionSet ){
            var promise = $http.put('../api/optionSets/' + optionSet.id + '.json&mergeMode=MERGE', optionSet ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        },
        getOptionSet: function( uid ){
            var promise = $http.get('../api/optionSets/' + uid + '.json?paging=false&fields=id,name,displayName,version,valueType,attributeValues[value,attribute[id,name,valueType,code]],options[id,name,displayName,code]').then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        }
    };    
})

.service('OrgUnitService', function($http){
    var orgUnit, orgUnitPromise;
    return {
        get: function( uid ){
            if( orgUnit !== uid ){
                orgUnitPromise = $http.get( '../api/organisationUnits.json?filter=path:like:/' + uid + '&fields=id,displayName,path,level,parent[id]&paging=false' ).then(function(response){
                    orgUnit = response.data.id;
                    return response.data;
                });
            }
            return orgUnitPromise;
        }
    };
})

.service('MaintenanceService', function($http, ActionMappingUtils){
    return {
        updateOptionCombo: function(){
            var promise = $http.post('../api/maintenance/categoryOptionComboUpdate' , true ).then(function(response){
                return response.data;
            }, function(response){
                ActionMappingUtils.errorNotifier(response);
            });
            return promise;
        }
    };
})

.service('ActionMappingUtils', function($q, $translate, $filter, DialogService, OrgUnitService){
    return {
        getSum: function( op1, op2 ){
            op1 = dhis2.validation.isNumber(op1) ? parseInt(op1) : 0;
            op2 = dhis2.validation.isNumber(op2) ? parseInt(op2) : 0;        
            return op1 + op2;
        },
        getPercent: function(op1, op2){        
            op1 = dhis2.validation.isNumber(op1) ? parseInt(op1) : 0;
            op2 = dhis2.validation.isNumber(op2) ? parseInt(op2) : 0;        
            if( op1 === 0){
                return "";
            }
            if( op2 === 0 ){
                return $translate.instant('missing_target');
            }
            return parseFloat((op1 / op2)*100).toFixed(2) + '%';
        },
        getOptionComboIdFromOptionNames: function(optionComboMap, options){
            var optionNames = [];
            angular.forEach(options, function(op){
                optionNames.push(op.displayName);
            });
            
            var selectedAttributeOcboName = optionNames.toString();            
            var selectedAttributeOcobo = optionComboMap['"' + selectedAttributeOcboName + '"'];
            
            if( !selectedAttributeOcobo || angular.isUndefined( selectedAttributeOcobo ) ){
                selectedAttributeOcboName = optionNames.reverse().toString();
                selectedAttributeOcobo = optionComboMap['"' + selectedAttributeOcboName + '"'];
            }
            return selectedAttributeOcobo;
        },
        getOptionIds: function(options){            
            var optionNames = '';
            angular.forEach(options, function(o){
                optionNames += o.id + ';';
            });            
            
            return optionNames.slice(0,-1);
        },
        errorNotifier: function(response){
            if( response && response.data && response.data.status === 'ERROR'){
                var dialogOptions = {
                    headerText: response.data.status,
                    bodyText: response.data.message ? response.data.message : $translate.instant('unable_to_fetch_data_from_server')
                };		
                DialogService.showDialog({}, dialogOptions);
            }
        },
        getNumeratorAndDenominatorIds: function( ind ){            
            var num = ind.numerator.substring(2,ind.numerator.length-1);
            num = num.split('.');            
            var den = ind.denominator.substring(2,ind.numerator.length-1);
            den = den.split('.');            
            return {numerator: num[0], numeratorOptionCombo: num[1], denominator: den[0], denominatorOptionCombo: den[1]};
        },
        populateOuLevels: function( orgUnit, ouLevels ){
            var ouModes = [{displayName: $translate.instant('selected_level') , value: 'SELECTED', level: orgUnit.l}];
            var limit = orgUnit.l === 1 ? 2 : 3;
            for( var i=orgUnit.l+1; i<=limit; i++ ){
                var lvl = ouLevels[i];
                ouModes.push({value: lvl, displayName: lvl, level: i});
            }
            var selectedOuMode = ouModes[0];            
            return {ouModes: ouModes, selectedOuMode: selectedOuMode};
        },
        getChildrenIds: function( orgUnit ){
            var def = $q.defer();
            OrgUnitService.get( orgUnit.id ).then(function( json ){
                var childrenIds = [];
                var children = json.organisationUnits;
                var childrenByIds = [];
                var allChildren = [];
                angular.forEach(children, function(c){
                    c.path = c.path.substring(1, c.path.length);
                    c.path = c.path.split("/");
                    childrenByIds[c.id] = c;
                    if( c.level <= 3 ){
                        allChildren.push( c );
                    }
                });                    
                
                if( orgUnit.l === 1 ){
                    angular.forEach($filter('filter')(children, {level: 3}), function(c){
                        childrenIds.push(c.id);                        
                    });
                }
                else if ( orgUnit.l === 2 ){
                    childrenIds = orgUnit.c;
                }
                else {
                    childrenIds = [orgUnit.id];
                }

                def.resolve( {childrenIds: childrenIds, allChildren: allChildren, children: $filter('filter')(children, {parent: {id: orgUnit.id}}), descendants: $filter('filter')(children, {level: 3}), childrenByIds: childrenByIds } );
            });
            
            return def.promise;
        },
        processDataSet: function( ds ){
            var dataElements = [];
            angular.forEach(ds.dataSetElements, function(dse){
                if( dse.dataElement ){
                    dataElements.push( dhis2.metadata.processMetaDataAttribute( dse.dataElement ) );
                }                            
            });
            ds.dataElements = dataElements;
            delete ds.dataSetElements;
            
            return ds;
        },
        formatDataValue: function( de, val){            
            if( de.valueType === 'NUMBER' ){
                val = parseFloat( val );
            }
            else if(de.valueType === 'INTEGER' ||
                    de.valueType === 'INTEGER_POSITIVE' ||
                    de.valueType === 'INTEGER_NEGATIVE' ||
                    de.valueType === 'INTEGER_ZERO_OR_POSITIVE' ){
                val = parseInt( val );
            }
            else if(de.valueType=== 'TRUE_ONLY'){
                val=val==='true'? true: '';
            }
            
            return val;
        },
        getDataElementTotal: function(dataValues, dataElement){            
            if( dataValues[dataElement] ){                
                dataValues[dataElement].total = 0;                
                angular.forEach(dataValues[dataElement], function(val, key){
                    if( key !== 'total' && val && val.value ){                        
                        dataValues[dataElement].total += val.value;
                    }
                });
            }            
            return dataValues[dataElement];
        },
        getValidationResult: function( de, dataValues, failedValidationRules ){
            var vrs = [];
            if( de && de.validationRules && de.validationRules.length > 0 ){
                angular.forEach(de.validationRules, function(vr){                    
                    var leftSide = null, rightSide = null; 
                    if( vr.leftSide && vr.leftSide.expression ){
                        leftSide = angular.copy( vr.leftSide.expression );
                        var matcher = leftSide.match( dhis2.metadata.formulaRegex );
                        for( var k in matcher ){
                            var match = matcher[k];
                            var operand = match.replace( dhis2.metadata.operatorRegex, '' );
                            var isTotal = !!( operand.indexOf( dhis2.metadata.cstSeparator ) == -1 );
                            var value = null;
                            if ( isTotal )
                            {                                
                                if( dataValues && dataValues[operand] && dataValues[operand].total ){                                    
                                    value = dataValues[operand].total;
                                }
                            }
                            else
                            {
                                var ids = operand.split('.');
                                if( dataValues && 
                                        dataValues[ids[0]] && 
                                        dataValues[ids[0]][ids[1]] &&
                                        dataValues[ids[0]][ids[1]].value){
                                    value = dataValues[ids[0]][ids[1]].value;
                                }
                            }
                            leftSide = leftSide.replace( match, value );                    
                        }
                    }                    
                    if( vr.rightSide && vr.rightSide.expression ){
                        rightSide = angular.copy( vr.rightSide.expression );
                        var matcher = rightSide.match( dhis2.metadata.formulaRegex );
                        for( var k in matcher ){
                            var match = matcher[k];
                            var operand = match.replace( dhis2.metadata.operatorRegex, '' );
                            var isTotal = !!( operand.indexOf( dhis2.metadata.cstSeparator ) == -1 );
                            var value = null;
                            if ( isTotal )
                            {                                
                                if( dataValues && dataValues[operand] && dataValues[operand].total ){                                    
                                    value = dataValues[operand].total;
                                }
                            }
                            else
                            {
                                var ids = operand.split('.');;
                                if( dataValues && 
                                        dataValues[ids[0]] && 
                                        dataValues[ids[0]][ids[1]] &&
                                        dataValues[ids[0]][ids[1]].value){
                                    value = dataValues[ids[0]][ids[1]].value;
                                }
                            }
                            rightSide = rightSide.replace( match, value );                    
                        }
                    }
                    
                    if( leftSide && rightSide ){                        
                        var op = null;
                        switch( vr.operator ){
                            case 'equal_to':
                                op = '==';
                                break;
                            case 'not_equal_to':
                                op = '!=';
                                break;
                            case 'greater_than':
                                op = '>';
                                break;
                            case 'greater_than_or_equal_to':
                                op = '>=';
                                break;
                            case 'less_than':
                                op = '<';
                                break;
                            case 'less_than_or_equal_to':
                                op = '>=';
                                break;
                            default:
                                op = null;
                                break;
                        }
                        if( op !== null ){                            
                            var res = eval( leftSide + op + rightSide);
                            if( !res ){
                                vrs.push(vr);
                                if( failedValidationRules.indexOf( vr.id) === -1 ){
                                    failedValidationRules.push( vr.id );
                                }                                
                            }
                            else{
                                var idx = failedValidationRules.indexOf( vr.id );
                                if( idx !== -1 ){
                                    failedValidationRules.splice(idx, 1);
                                }                                
                            }
                        }
                    }                    
                });
            }
            return {vrs: vrs, failed: failedValidationRules};
        },
        getIndicatorResult: function( ind, dataValues ){
            var denVal = 1, numVal = 0;
            
            if( ind.numerator ) {
                
                ind.numExpression = angular.copy( ind.numerator );
                var matcher = ind.numExpression.match( dhis2.metadata.formulaRegex );
                
                for ( var k in matcher )
                {
                    var match = matcher[k];

                    // Remove brackets from expression to simplify extraction of identifiers

                    var operand = match.replace( dhis2.metadata.operatorRegex, '' );

                    var isTotal = !!( operand.indexOf( dhis2.metadata.cstSeparator ) == -1 );

                    var value = '0';

                    if ( isTotal )
                    {
                        if( dataValues && dataValues[operand] && dataValues[operand].total ){
                            value = dataValues[operand].total;
                        }
                    }
                    else
                    {
                        var de = operand.substring( 0, operand.indexOf( dhis2.metadata.cstSeparator ) );
                        var coc = operand.substring( operand.indexOf( dhis2.metadata.cstSeparator ) + 1, operand.length );
                        
                        if( dataValues && 
                                dataValues[de] && 
                                dataValues[de][coc] &&
                                dataValues[de][coc].value){
                            value = dataValues[de][coc].value;
                        }
                    }
                    ind.numExpression = ind.numExpression.replace( match, value );                    
                }
            }
            
            
            if( ind.denominator ) {
                
                ind.denExpression = angular.copy( ind.denominator );
                var matcher = ind.denExpression.match( dhis2.metadata.formulaRegex );
                
                for ( var k in matcher )
                {
                    var match = matcher[k];

                    // Remove brackets from expression to simplify extraction of identifiers

                    var operand = match.replace( dhis2.metadata.operatorRegex, '' );

                    var isTotal = !!( operand.indexOf( dhis2.metadata.cstSeparator ) == -1 );

                    var value = '0';

                    if ( isTotal )
                    {
                        if( dataValues[operand] && dataValues[operand].total ){
                            value = dataValues[operand].total;
                        }
                    }
                    else
                    {
                        var de = operand.substring( 0, operand.indexOf( dhis2.metadata.cstSeparator ) );
                        var coc = operand.substring( operand.indexOf( dhis2.metadata.cstSeparator ) + 1, operand.length );
                        
                        if( dataValues && 
                                dataValues[de] && 
                                dataValues[de][coc] &&
                                dataValues[de][coc].value){
                            value = dataValues[de][coc].value;
                        }
                    }
                    ind.denExpression = ind.denExpression.replace( match, value );
                }
            }
            
            if( ind.numExpression ){
                numVal = eval( ind.numExpression );
                numVal = isNaN( numVal ) ? '-' : roundTo( numVal, 1 );
            }
            
            if( ind.denExpression ){
                denVal = eval( ind.denExpression );
                denVal = isNaN( denVal ) ? '-' : roundTo( denVal, 1 );
            }
            
            return numVal / denVal;
        },
        getCartesianProduct: function() {
            return _.reduce(arguments, function(a, b) {
                return _.flatten(_.map(a, function(x) {
                    return _.map(b, function(y) {
                        return x.concat([y]);
                    });
                }), true);
            }, [ [] ]);
        }
    };
})

/*Orgunit service for local db */
.service('IndexDBService', function($window, $q){
    
    var indexedDB = $window.indexedDB;
    var db = null;
    
    var open = function( dbName ){
        var deferred = $q.defer();
        
        var request = indexedDB.open( dbName );
        
        request.onsuccess = function(e) {
          db = e.target.result;
          deferred.resolve();
        };

        request.onerror = function(){
          deferred.reject();
        };

        return deferred.promise;
    };
    
    var get = function(storeName, uid){
        
        var deferred = $q.defer();
        
        if( db === null){
            deferred.reject("DB not opened");
        }
        else{
            var tx = db.transaction([storeName]);
            var store = tx.objectStore(storeName);
            var query = store.get(uid);
                
            query.onsuccess = function(e){
                deferred.resolve(e.target.result);           
            };
        }
        return deferred.promise;
    };
    
    return {
        open: open,
        get: get
    };
})