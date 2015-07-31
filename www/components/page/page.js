angular.module('component.page', ['storage'])        
.factory('$page', function ($log, $storage) {
    var page = this;
    page.pages=$storage.pages;
    
    page.save = function() {
        if (page.current === undefined) return;
        $storage.setPage(page.current, function(success) {
            if (!success) alert('Auto Save Failed.');
        });
    };
    page.updatePage = function(state) {
        $storage.getPage(state.params.name, function(p) {		
            if (!p) p = page.getDefault(state.params.name);
            page.current=p;
        });
    };
    page.getDefault = function(name) {
        return {
            title: name,
            story: [page.getDefaultStory()],
            source: $storage.persistance.sources.local
        }
    };
    page.getDefaultStory = function() {
        return {
            name: "New Story",
            text: '<div><h1 contenteditable ng-keyup="page.page.save();" ng-model="s.name"></h1><p>Default Content</p></div>'
        }
    }  
    page.getKeys = function(o) {
        if (o === undefined) return;
        return Object.keys(o);
    };
    return page;
})
.controller('PageCtrl', function ($log, $state, $window, $scope, $location, $timeout, $app, $page, $storage ) {        	
    var page = this;
    page.scope = $scope;
    page.page = $page;
    page.app=$app;
    page.storage = $storage;
    page.location = $location;

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
    }
})
;