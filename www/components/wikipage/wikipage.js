angular.module('component.wikipage', [])        
.directive('wikipage', function ($compile, $sce, $timeout, $location, $ionicSideMenuDelegate ) {
    return {
        restrict: 'E',
        scope: {
                pagename: '@'
        },
        templateUrl: 'components/wikipage/wikipage.html',
        controller: function($log, $location, $storage, $page) {        	
            var page = this;
            page.page = $page;
            page.location = $location;
            $storage.getPage(page.pagename, function(p) {		
            if (!p) p = page.getDefault(page.pagename);
            page.current=p;
        });
        },
        controllerAs: 'page', 
        bindToController: true
    };
})
;
