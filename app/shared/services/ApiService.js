angular.module('blogApp')
.factory('ApiService', ['$http', '$q', function($http, $q) {
    const BASE_URL = 'http://laravel.local/api/v1';

    return {
        getCategories: () => $http.get(BASE_URL + '/categories').catch(err => $q.reject(err)),
        getCategoryById: id => $http.get(BASE_URL + '/categories/' + id).catch(err => $q.reject(err)),
        getPosts: () => $http.get(BASE_URL + '/posts').catch(err => $q.reject(err)),
        getPostById: id => $http.get(BASE_URL + '/posts/' + id).catch(err => $q.reject(err)),
        getPostsByCategory: categoryId => $http.get(BASE_URL + '/categories/' + categoryId + '/posts').catch(err => $q.reject(err))
    };
}]);
