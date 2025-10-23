(function() {
    'use strict';

    angular.module('categoriesModule')
        .factory('CategoryService', ['$http', '$q', function($http, $q) {
            const BASE_URL = 'http://laravel.local/api/v1';

            return {
                getAllCategories: () => $http.get(BASE_URL + '/categories').catch(err => $q.reject(err)),
                getCategoryById: id => $http.get(BASE_URL + '/categories/' + id).catch(err => $q.reject(err)),
                createCategory: categoryData => $http.post(BASE_URL + '/categories', categoryData).catch(err => $q.reject(err)),
                updateCategory: (id, categoryData) => $http.put(BASE_URL + '/categories/' + id, categoryData).catch(err => $q.reject(err)),
                deleteCategory: id => $http.delete(BASE_URL + '/categories/' + id).catch(err => $q.reject(err))
            };
        }]);
})();