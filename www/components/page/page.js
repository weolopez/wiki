angular.module('component.page', ['storage', 'textAngular'])        
.factory('$page', function ($log, $timeout, $storage, $state) {
    var page = this;
    page.pages=$storage.pages;
    
    page.init = function() {
        page.current=page.getDefault();
    }
    page.setSource = function(key) {
        $storage.preferedSources=key;        
        if ( ($storage.cachedPages[key] !== undefined) &&
             ($storage.cachedPages[key][$state.params.name] !== undefined) )  
                page.current=$storage.cachedPages[key][$state.params.name];
        else  
            page.current=page.getDefault();
    }
    page.save = function() {
        $storage.setPage(page.current);
    };
    page.updatePage = function() {
        $storage.getPage($state.params.name);
        $timeout(function() {
            if (page.current.title !== $state.params.name) page.current=page.getDefault();
        }, 1000);
    };
    page.getDefault = function() {
        return {
            title: $state.params.name,
            story: [page.getDefaultStory()],
            source: $storage.persistance.sources.local
        }
    };
    page.getDefaultStory = function() {
        return {
            name: "Default Story Name",
            text: '<div><h1 contenteditable ng-keyup="page.page.save();" ng-model="s.name"></h1><p>Page Name: {{page.page.current.title}}</p><p>Page Source: {{page.page.current.source.name}}</p></div>'
        }
    }  
    page.getKeys = function(o) {
        if (o === undefined) return;
        return Object.keys(o);
    };
    page.init();
    return page;
})
.controller('PageCtrl', function ($log, $state, $window, $scope, $location, 
                            $timeout, $app, $page, $storage, $http, 
                            $ionicSideMenuDelegate, $user ) {        	
    var page = this;
    page.scope = $scope;
    page.page = $page;
    page.app=$app;
    page.user=$user;
    page.storage = $storage;
    page.location = $location;
    page.$ionicSideMenuDelegate=$ionicSideMenuDelegate;
    var url='https://webtest.csp.att.com/ocetest/oce/rest/api/orders/queue/count/?searchString={%22view%22:[%22CDE-HS%22],%22partners%22:[{%22partnerName%22:%22STI%22},{%22partnerName%22:%22SGS%22}]}';
    page.getContent=function(s){
    $http({method: 'GET', url: s.name}).
          then(function(response) {
            page.status = response.status;
            s.result = response.data;
          }, function(response) {
            page.data = response.data || "Request failed";
            page.status = response.status;
        });
    }    
    $scope.$watch(function(data) {
        if ($storage.cachedPages[$storage.preferedSources]===undefined)return;
        return $storage.cachedPages[$storage.preferedSources][$state.params.name];
    }, function(newValue, oldValue) {    
        if (newValue===undefined) return;    
        if ($state.params.name===newValue.title)
             $page.current=newValue;
    });
    
    $scope.$on( "$stateChangeSuccess", function() { 
        page.page.updatePage($state);
    });     
    page.componentClicked = function(component, index) {
        if (index === component) {
            return undefined;
        } else {
            return index;
        }
    }
    page.addMessage = function(arr, message) {
        arr.push(message);
    };
    page.edit = function(index) {
        page.$storage.setObject('edit',page.page.current.story[page.page.storyIndex]);page.gotoPage('edit');
    };
    page.deleteKey = function(s, key) { 
       delete s[key];
    };
    page.onDropComplete = function (index, obj, evt) {
        var otherObj = $page.current.story[index];
        var otherIndex = page.touchedIndex;
        $page.current.story[index] = obj;
        $page.current.story[otherIndex] = otherObj;
        $page.save();
    };
    page.processSelector = function(s) {
        if ( 	(s === undefined) ||
		 		(s.url === undefined) ||
		 		(s.selector === undefined)
  			)		
		return;
        if ((s.html===undefined) || (s.html==='')) {    
        var url = 'http://allow-any-origin.appspot.com/'+s.url;
            $http.get(url).
              success(function(data, status, headers, config) {
                s.html = data;  
                data = $(data).find(s.selector);
                if (data.length === 0) {
                    alert('not found');
               //    $window.open(s.url, '_blank');
                    return;
                }
                s.data = data;	
               var html = data.html();
               if (html!=='') s.html = html;
                s.jsondata = JsonML.fromHTMLText(s.html);

                    if (s.jsonpath.length > 0) {
                        s.jsondata = jsonPath(s.jsondata, s.jsonpath);
                }

                $page.save();
                callback();
              })
          }
          else {
              $('#htmlcontent').append(s.html);
              var data = $('#htmlcontent').find(s.selector);
                
                if (data.length === 0) {
                    alert('not found in cache');
                    //$window.open(s.url, '_blank');
                    return;
                }
                console.dir(s)
                s.data = data;		    
                var html = data.html();
                if (html!=='') s.html = html;
                s.jsondata = JsonML.fromHTMLText(s.html);

                    if (s.jsonpath.length > 0) {
                        s.jsondata = jsonPath(s.jsondata, s.jsonpath);
                }

                $page.save();
                callback();
          }
    };
    page.test = function() {
        alert("TEST SUCCESS");
    }
});
