angular.module('storage', ['firebase'])
.factory('storageRef', function () {
    this.FB = 'https://weo-wiki.firebaseio.com';
    return this;
})
.factory('$storage', function ($window, $http, $cacheFactory, $firebaseObject, $timeout, storageRef) {
    var storage = this;
    storage.key='/wiki/pages';
    storage.firebasesPagesObject=[];
    storage.cache=$cacheFactory('instanceCache');
    storage.pages=JSON.parse($window.localStorage[storage.key]) || '{}';
    storage.cache.put('local',storage.pages);
    
    /**
     * saves Object to local storage
     * @param {type} key
     * @param {type} value
     * @returns {undefined}
     */
    storage.setObject = function (key, value) {
      //  var copy = $window.localStorage[key];
        var updatedObject
        if ($window.localStorage[storage.key]===undefined) updatedObject={};
        else updatedObject = JSON.parse($window.localStorage[storage.key]);
        updatedObject[value.title] = value;
      //  copy[value.title]=value;
        $window.localStorage[storage.key]=JSON.stringify(updatedObject);
        
        if (value.$save === undefined) {
            var pageRef = new Firebase(storageRef.FB+key);
            var page = $firebaseObject(pageRef);
            for(var k in value) page[k]=value[k];
            value = page;
        }
        value.$save();
    };
    
    /**
     * getPage in order checks local > configured user->general firebase > home user->general firebase > webserver
     * @param {string} name
     * @param {function} callback
     * @returns {Page}
     */
    storage.getPage = function (name, callback) {
        var returnValue = storage.cache.get('local')[name];   
        if ( returnValue=== undefined) {
            $firebaseObject(new Firebase(storageRef.FB+storage.key+'/'+name)).$loaded(function(pagesObject) {
                returnValue=pagesObject;
                callback(returnValue);
            })
        }
        
        if (returnValue === undefined) {
            $http.get(storage.key+'/'+name).then(
                function(data, status, headers, config) {
                    returnValue = data.data;
                    returnValue=JSON.parse('{'+returnValue+'}');
                    callback(returnValue);
                },    
                function(data, status, headers, config) {
                    callback(data.data);
                }
            )
        }
        else callback( returnValue );
    }
 /*   storage.getPage('persistance', function(p) {
        angular.forEach(p.story[0].list, function(value, key){
            $firebaseObject(new Firebase(value.name+storage.key)).$loaded(function(pagesObject) {
                storage.firebasesPagesObject.push(pagesObject);
            })
        })
    });*/
    
    return storage;
})
;