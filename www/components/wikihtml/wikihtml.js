angular.module('component.wikihtml', [])        
.directive('wikihtml', function ($compile, $sce, $timeout ) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function(v){
                    if (v.$parent.s === undefined)
                            return v.$parent.s;
                    else
                            return v.$parent.s.text;
            }, function(n,v){
                    if (scope.s === undefined) return;

                    var delay = 1000;
                    if (scope.s.delay !== undefined) delay = Number(scope.s.delay);

                    $timeout(function() {
                            element.empty();
                            element.append($compile(scope.s.text)(scope));	
                    }, delay);
            })	
        }
    }
})
.directive('contenteditable', function ($timeout) {
    return {
        restrict: 'A',
        require: "ngModel",
        link: function (scope, element, attr, ngModel) {
            function read() {
                ngModel.$setViewValue(element.html());
            }
            ngModel.$render = function() {
                element.html(ngModel.$viewValue || "");
            };
            element.bind("blur keyup change", function() {
                scope.$apply(read);
            });
        }
    }
})      	
.directive('action', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            'returnClose': '=',
            'onReturn': '&',
            'onFocus': '&',
            'onBlur': '&'
        },
        link: function (scope, element, attr, ngModel) {
            element.bind('focus', function (e) {
                if (scope.onFocus) {
                    $timeout(function () {
                        scope.onFocus();
                    });
                }
            });
            element.bind('blur', function (e) {
                if (scope.onBlur) {
                    $timeout(function () {
                        scope.onBlur();
                    });
                }
            });
            element.bind('keydown', function (e) {
                if (e.which == 13) {
                    if (scope.returnClose)
                        element[0].blur();
                    if (scope.onReturn) {
                        $timeout(function () {
                            scope.onReturn();
                        });
                    }
                }
            });
        }
    }
})      	
;

