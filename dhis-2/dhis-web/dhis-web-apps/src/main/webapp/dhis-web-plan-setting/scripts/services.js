/* global angular, moment, dhis2, parseFloat */

'use strict';

/* Services */

var planSettingServices = angular.module('planSettingServices', ['ngResource'])

.factory('StorageService', function(){
    var store = new dhis2.storage.Store({
        name: "dhis2rd",
        adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
        objectStores: ['dataSets', 'optionSets', 'categoryCombos', 'programs', 'ouLevels', 'indicatorTypes', 'validationRules','dataElementGroups']
    });
    return{
        currentStore: store
    };
})

/* Factory to fetch optionSets */
.factory('OptionSetService', function($q, $rootScope, StorageService) { 
    return {
        getAll: function(){
            
            var def = $q.defer();
            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.getAll('optionSets').done(function(optionSets){
                    $rootScope.$apply(function(){
                        def.resolve(optionSets);
                    });                    
                });
            });            
            
            return def.promise;            
        },
        get: function(uid){            
            var def = $q.defer();
            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.get('optionSets', uid).done(function(optionSet){                    
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

/* Factory to fetch data sets */
.factory('DataSetFactory', function($q, $rootScope, SessionStorageService, StorageService, orderByFilter, DataEntryUtils) { 
  
    return {        
        get: function(uid){
            
            var def = $q.defer();
            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.get('dataSets', uid).done(function(ds){
                    ds = DataEntryUtils.processDataSet( ds );
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
            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.getAll('dataSets').done(function(dss){
                    var dataSets = [];
                    angular.forEach(dss, function(ds){                            
                        if(ds.organisationUnits.hasOwnProperty( ou.id ) && DataEntryUtils.userHasValidRole(ds,'dataSets', userRoles)){
                            ds = DataEntryUtils.processDataSet( ds );
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
        },
        getByOuAndProperty: function(ou, selectedDataSet,propertyName,propertyValue){
            var roles = SessionStorageService.get('USER_ROLES');
            var userRoles = roles && roles.userCredentials && roles.userCredentials.userRoles ? roles.userCredentials.userRoles : [];
            var def = $q.defer();
            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.getAll('dataSets').done(function(dss){
                    var dataSets = [];
                    angular.forEach(dss, function(ds){                            
                        if(ds.organisationUnits.hasOwnProperty( ou.id ) && DataEntryUtils.userHasValidRole(ds,'dataSets', userRoles) && ds[propertyName] && ds[propertyName]===propertyValue){
                            ds = DataEntryUtils.processDataSet( ds );
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
.factory('MetaDataFactory', function($q, $rootScope, StorageService, orderByFilter) {  
    
    return {        
        get: function(store, uid){            
            var def = $q.defer();            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.get(store, uid).done(function(obj){                    
                    $rootScope.$apply(function(){
                        def.resolve(obj);
                    });
                });
            });                        
            return def.promise;
        },
        set: function(store, obj){            
            var def = $q.defer();            
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.set(store, obj).done(function(obj){                    
                    $rootScope.$apply(function(){
                        def.resolve(obj);
                    });
                });
            });                        
            return def.promise;
        },
        getAll: function(store){
            var def = $q.defer();
            StorageService.currentStore.open().done(function(){
                StorageService.currentStore.getAll(store).done(function(objs){                    
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

.service('DataValueService', function($http, DataEntryUtils,$q) {   
    
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
            var def = $q.defer();            
            var promises = [], toBeSaved = [];
            
            angular.forEach(dvs.dataValues, function(dv){                
                if( dv.value === "" || dv.value === null ){
                    //deleting...                    
                    var url = '?de='+dv.dataElement + '&ou='+dvs.orgUnit + '&pe='+dvs.period + '&co='+dv.categoryOptionCombo;
                    
                    if( dv.cc && dv.cp ){
                        url += '&cc='+cc + '&cp='+cp;
                    }                    
                    promises.push( $http.delete('../api/dataValues.json' + url) );
                }
                else{
                    //saving...
                    toBeSaved.push( dv );
                }                
            });
            
            if( toBeSaved.length > 0 ){
                dvs.dataValues = toBeSaved;
                promises.push( $http.post('../api/dataValueSets.json', dvs) );
            }
            
            $q.all(promises).then(function(){                
                def.resolve();
            });
            
            return def.promise;
        },
        getDataValueSet: function( params ){            
            var promise = $http.get('../api/dataValueSets.json?' + params ).then(function(response){               
                return response.data;
            }, function(response){
                DataEntryUtils.errorNotifier(response);
            });            
            return promise;
        }
    };    
})

.service('CompletenessService', function($http, DataEntryUtils) {   
    
    return {        
        get: function( ds, ou, period, children ){
            var promise = $http.get('../api/completeDataSetRegistrations.json?dataSet='+ds+'&orgUnit='+ou+'&period='+period+'&children='+children).then(function(response){
                return response.data;
            }, function(response){                
                DataEntryUtils.errorNotifier(response);
                return response.data;
            });
            return promise;
        },
        save: function( dsr ){
            var promise = $http.post('../api/completeDataSetRegistrations.json', dsr ).then(function(response){
                return response.data;
            }, function(response){                
                DataEntryUtils.errorNotifier(response);
                return response.data;
            });
            return promise;
        },
        delete: function( ds, pe, ou, cc, cp, multiOu){
            var promise = $http.delete('../api/completeDataSetRegistrations?ds='+ ds + '&pe=' + pe + '&ou=' + ou + '&cc=' + cc + '&cp=' + cp + '&multiOu=' + multiOu ).then(function(response){
                return response.data;
            }, function(response){                
                DataEntryUtils.errorNotifier(response);
                return response.data;
            });
            return promise;
        }
    };
});