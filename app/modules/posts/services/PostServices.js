(function() {
    'use strict';

    angular.module('postsModule')
        .factory('PostService', ['$http', '$q', function($http, $q) {
            const BASE_URL = 'http://laravel.local/api/v1';

            return {
                getPosts: () => $http.get(BASE_URL + '/posts').catch(err => $q.reject(err)),
                getMyPosts: () => $http.get(BASE_URL + '/user/posts').catch(err => $q.reject(err)),
                getPostById: id => $http.get(BASE_URL + '/posts/' + id).catch(err => $q.reject(err)),
                getPostsByCategory: categoryId => $http.get(BASE_URL + '/categories/' + categoryId + '/posts').catch(err => $q.reject(err)),
                createPost: postData => $http.post(BASE_URL + '/user/posts', postData, {
                    
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).catch(err => $q.reject(err)),
                updatePost: (id, postData) => {
                    postData.append('_method', 'PUT'); // simulate PUT
                    return $http.post(BASE_URL + '/user/posts/' + id, postData, {
                        transformRequest: angular.identity,
                        headers: { 'Content-Type': undefined }
                    }).catch(err => $q.reject(err));
                },
                postTogglePublish: id => $http.patch(BASE_URL + '/user/posts/' + id + '/toggle-publish').catch(err => $q.reject(err)),
                deletePost: id => $http.delete(BASE_URL + '/user/posts/' + id).catch(err => $q.reject(err))
            };
        }]);
})();
