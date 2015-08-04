angular.module('storage', ['firebase'])
.factory('persistance', function ($window, $cacheFactory, $http, $firebaseObject) {
    var persistance=this;
    
    persistance.cache=$cacheFactory('persistanceCache');
    if ((persistance.pages=$window.localStorage['/wiki/pages']) === undefined) persistance.pages="{}";
    persistance.pages=JSON.parse(persistance.pages);
    
    persistance.sources={};
    persistance.types={};
    persistance.sources.local = {
            name: 'local',
            color: 'pink',
            path: '/wiki/pages',
            type: 'local',
            loadPages: true
        };
    persistance.sources.site = {
            name: 'site',
            color: 'none',
            path: '/wiki/pages',
            src: 'https://weo-wiki.firebaseio.com',
            type: 'site',
            loadPages: false
        };
    persistance.sources.home = {
            name: 'home',
            color: 'green',
            path: '/wiki/pages',
            src: 'https://weo.firebaseio.com',
            type: 'firebase',
            loadPages: false
        };
    persistance.sources.root = {
            name: 'root',
            color: 'grey',
            path: '/wiki/pages',
            src: 'https://weo-wiki.firebaseio.com',
            type: 'firebase',
            loadPages: true
        };
    persistance.types.local={};    
    persistance.types.local.getPages = function(source, callback) {
        var pages=[];
        angular.forEach(persistance.pages, function(value, key) {
            var page = {source:source, pageName:key};
            pages.push(page);
        });
        callback(pages);        
    }; 
    persistance.types.local.get = function(pageName, source, callback) {
        var page = persistance.pages[pageName];
        if (page !== undefined) {
            page.source = source;
            callback(page);
            return true;
        }
    };    
    persistance.types.local.set = function(page, source, callback) {   
        var updatedObject={};
        if ($window.localStorage[source.path]===undefined) updatedObject={};
        else updatedObject = JSON.parse($window.localStorage[source.path]);
        updatedObject[page.title] = page;
        
        var cache = [];
        $window.localStorage[source.path]=JSON.stringify(updatedObject, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                cache.push(value);
            }
            return value;
        });cache=null;
        
        callback(true);
        return true;
    };    
    persistance.types.firebase={};
    persistance.types.firebase.getPages = function(source, callback) {
        var pages=[];
        $firebaseObject(new Firebase(source.src+source.path)).$loaded(function(page) {
            angular.forEach(Object.keys(page), function(value, key) {
                if (value.charAt(0)!=='$') {
                    var page = {source:source, pageName:value};
                    pages.push(page);
                }
            });
            callback(pages);          
        });
    }
    persistance.types.firebase.get = function(pageName, source, callback) {
        $firebaseObject(new Firebase(source.src+source.path+'/'+pageName)).$loaded(function(page) {
            if (page.title !== undefined) {
                page.source = source;
                //persistance.types.local.set(page, persistance.sources.local, function(result){})
                callback(page);
            return true;
            }
        })
    };
    persistance.types.firebase.set = function(page, source, callback) {
     /*   console.dir(page);
        if (page.$save !== undefined) {
            page.$save();
        }
        else {
        */    
       $firebaseObject(new Firebase(source.src+source.path+'/'+page.title)).$loaded(function(remotePage) {
                    for(var k in page) remotePage[k]=page[k];
                    remotePage.$save();
                    callback(true);
                    return true;
            });
       // }
        return false;
    };
    persistance.types.site={};
    persistance.types.site.getPages = function(source, callback) {
        var pages=[];
        callback(pages) ;        
    }
    persistance.types.site.get = function(pageName, source, callback) {
         $http.get(source.path+'/'+pageName).then(
            function(data, status, headers, config) {
                var page = data.data;
                if (page !== undefined) {
                    page=JSON.parse('{'+page+'}');
                    page.source = source;
                    callback(page);
                    return true;
                }
            }
        )
    };    
    persistance.types.site.set = function(page, source, callback) { 
        callback(false);
        return false;
    } 
    return persistance;
})
.factory('$storage', function ($window, $cacheFactory, persistance) {
    var storage = this;
    storage.persistance=persistance;
    storage.pages=[];
    storage.cachedPages={};
    storage.preferedSources='root';
    storage.init = function() {
    };
    storage.copy= function(updatedObject){
        $window.localStorage['copy']=JSON.stringify(updatedObject);
    };
    storage.paste = function(){
        return JSON.parse($window.localStorage['copy']);
    };
    /**
     * saves Object to local storage
     * @param {type} key
     * @param {type} value
     * @returns {undefined}
     */    
    storage.setPage = function (p) {
        //cleanPage: 'remove all $'  TODO make configurable fixed Page Attributes
        var page = {
                title:p.title,
                story:p.story,
                source:p.source
                
        }
       
        var source = persistance.sources[page.source.name];
        persistance.types[source.type].set(page, source, function(result) {
            if (!result) {
                page.source=persistance.sources.local;
                storage.setPage(page);
            };
            page.source=source;
        });
    }
    
    /**
     * getPage in order checks local > configured user->general firebase > home user->general firebase > webserver
     * @param {string} name
     * @param {function} callback
     * @returns {Page}
     */
    storage.getPageFromSource = function (pageName, persistanceName) {
        return storage.cachedPages[persistanceName][pageName];
    }
    storage.getPage = function (pageName) {
        angular.forEach(Object.keys(persistance.sources), function(sourceName, key){
            var source = persistance.sources[sourceName];
            persistance.types[source.type].get(pageName, source, function(p) {
                if (p === undefined) return;
                if (storage.cachedPages[p.source.name] === undefined) storage.cachedPages[p.source.name]={};
                storage.cachedPages[p.source.name][p.title]=p;
            });
        });
    };
    storage.addToSourceList = function(source) {
        persistance.sources[source.name] = source;
    };
    /**
     * storage.loadPages populates storage.pages with structure of...
     * [
     *    {sourceName,pageName}
     * ]
     *  
     * @returns {undefined}
     */
    storage.loadPages = function() {
        angular.forEach(persistance.sources, function(source, key){
            if (source.loadPages) {
                storage.loadPagesBySource(source);
            }
        });
    }
    storage.loadPagesBySource = function(source) {
        if (!source.pagesLoaded) {
            persistance.types[source.type].getPages(source, function(pages) {
                storage.pages=storage.pages.concat(pages);
            })
            source.pagesLoaded=true;
        }
    }
  //  storage.init();
    return storage;
})
; 