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
            page.page = $page;
            page.location = $location;
            page.storage=$storage;
            page.$ionicSideMenuDelegate=$ionicSideMenuDelegate;
            
            page.storage.getPage('pages');
            $scope.$watch(function(data) {
                if ($storage.cachedPages['site']===undefined)return;
                return $storage.cachedPages['site']['pages'];
            }, function(newValue, oldValue) {
                page.current=newValue;
            });
        },
        controllerAs: 'page', 
        bindToController: true
    };
})
;
