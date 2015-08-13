angular.module('component.application', ['storage'])    
.factory('CONST', function() {
    this.FB='https://weo-wiki.firebaseio.com';
    return this;
})
.factory('$app', function ($log, $storage, $ionicNavBarDelegate) {
    var app = this;
    app.storage = $storage;
    app.navBar = $ionicNavBarDelegate;
    return app;
})
.controller('AppCtrl', function ($log, $storage, $app, $page, $user, $window, $ionicActionSheet, $scope) {        	
    var app = this;
    $app.scope = $scope;
    app.page=$page;
    app.user=$user;
    app.wide = ($window.innerWidth >735);
    
    // Triggered on a button click, or some other target
    $app.open = function() {
        if ($page.edit !== true) {
            $page.edit = true;
            return;
        }
        var titleText='Page:'+$page.current.title;
        var lButtons=[
        ];

            var pasteObject = $window.localStorage['copy'];
                    
            if (pasteObject) {
                pasteObject=$storage.paste();
                lButtons.push(
                    {text: '<b>Paste</b> ' + pasteObject.name,
                        action: function () {
                            if ($page.current.story===undefined) $page.current.story=[];
                            $page.current.story.push(pasteObject);
                            $storage.setPage($page.current);
                        }
                    }
                );
            }

        if ($page.storyIndex>-1) {
            var destructText='Delete';
            titleText=titleText+' Story: '+$page.current.story[$page.storyIndex].name;
            lButtons.push({ 
                text: '<b>Copy</b> ',
                action: function() {
                    $storage.copy($page.current.story[$page.storyIndex]);
                }
            });
        }
       var hideSheet = $ionicActionSheet.show({
         buttons: lButtons,
         destructiveText: destructText,
         titleText: titleText,
         cancelText: 'Cancel',
         cancel: function() {
           $page.storyIndex=undefined;
           $page.edit = false;
         },
         buttonClicked: function(index, button) {
           if (button.action !== undefined) button.action();
           $page.storyIndex=undefined;
           $page.edit = false;
           return true;
         },
         destructiveButtonClicked: function() {
           $page.current.story.splice($page.storyIndex, 1);
           $page.storyIndex = undefined;
           $page.save();
           return true;
         }
       });         
    }
})
;
