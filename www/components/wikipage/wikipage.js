angular.module('component.wikipage', [])        
.directive('wikipage', function ($compile, $sce, $timeout, $location, $ionicSideMenuDelegate ) {
    return {
        restrict: 'E',
        scope: {
                pagename: '@'
        },
        templateUrl: 'components/wikipage/wikipage.html',
        controller: function($log, $location, $storage, $page, $scope, $ionicSideMenuDelegate) {        	
            var page = this;
            page.location = $location;
            page.storage=$storage;
            page.$ionicSideMenuDelegate=$ionicSideMenuDelegate;
            
            page.storage.getPage(page.pagename);
            $scope.$watch(function(data) {
                if ($storage.cachedPages['root']===undefined)return;
                return $storage.cachedPages['root'][page.pagename];
            }, function(newValue, oldValue) {
                page.current=newValue;
            });
        },
        controllerAs: 'page', 
        bindToController: true
    };
})
;
