(function() {
    'use strict';

    angular
        .module('categoriesModule')
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider
                .when('/categories', {
                    templateUrl: 'app/modules/categories/views/list-categories.html',
                    controller: 'CategoryController'
                })
                .when('/categories/new', {
                    templateUrl: 'app/modules/categories/views/create-category.html',
                    controller: 'CategoryController'
                })
                .when('/categories/edit/:id', {
                    templateUrl: 'app/modules/categories/views/create-category.html',
                    controller: 'CategoryController'
                });
        }]);
})();
