angular.module('component.wikipage', [])        
.directive('wikipage', function ($compile, $sce, $timeout, $location, $ionicSideMenuDelegate ) {
    return {
        restrict: 'E',
        scope: {
                pagename: '@'
        },
        templateUrl: 'components/wikipage/wikipage.html',
        controller: function($log, $location, $storage, $page, $scope) {        	
            var page = this;
            page.page = $page;
            page.location = $location;
            page.storage=$storage;
            
            page.storage.getPage('pages');
            $scope.$watch(function(data) {
                return $storage.cachedPages['root'];
            }, function(newValue, oldValue) {
                page.current=newValue;
            });
        },
        controllerAs: 'page', 
        bindToController: true
    };
})
;
