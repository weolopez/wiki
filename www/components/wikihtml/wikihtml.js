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
.directive('collapse', ['$compile', function($compile) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {

            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('collapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.collapseMaxLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart = String(text).substring(0, maxLength);
                    var secondPart = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                    var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                    var toggleButton = $compile('<span class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "less" : "more"}}</span>')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(moreIndicatorSpan);
                    element.append(lineBreak);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
}])
;

