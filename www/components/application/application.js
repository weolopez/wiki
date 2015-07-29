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
.controller('AppCtrl', function ($log, $storage, $app, $page, $state, $window, $ionicActionSheet, $scope, $ionicPopup, $location, $timeout ) {        	
    var app = this;
    $app.scope = $scope;
    app.wide = ($window.innerWidth >735);

    // Triggered on a button click, or some other target
    app.open = function() {
        if ($page.edit !== true) {
            $page.edit = true;
            return;
        }
        var titleText='Page:'+$page.current.title;
        var lButtons=[
            {   text: '<b>Add</b> ',
                action: function() {
                    $page.current.story.push($page.getDefaultStory());
                    $page.save();
                }
            }
        ];

        if ($page.storyIndex>-1) {
            var pasteObject = JSON.parse($window.localStorage['copy']);
            if (pasteObject) {
                lButtons.push(
                    {text: '<b>Paste</b> ' + pasteObject.name,
                        action: function () {
                            $page.current.story.push(pasteObject);
                            $page.save();
                        }
                    }
                );
            }

            var destructText='Delete';
            titleText=titleText+' Story: '+$page.current.story[$page.storyIndex].name;
            lButtons.push({ 
                text: '<b>Copy</b> ',
                action: function() {
                    $storage.setObject('copy',$page.current.story[$page.storyIndex]);
                }
            });
        } 
       var hideSheet = $ionicActionSheet.show({
         buttons: lButtons,
         destructiveText: destructText,
         titleText: titleText,
         cancelText: 'Save Page',
         cancel: function() {
             $page.save();
             $page.storyIndex=undefined;
             $page.edit = false;
         },
         buttonClicked: function(index, button) {
           if (button.action !== undefined) button.action();
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
