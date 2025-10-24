(function() {
    'use strict';

    angular
        .module('postsModule')
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider
                .when('/posts', {
                    templateUrl: 'app/modules/posts/views/all-posts.html',
                    controller: 'PostController'
                })
                .when('/posts/new', {
                    templateUrl: 'app/modules/posts/views/create-post.html',
                    controller: 'PostController'
                })
                .when('/posts/edit/:id', {
                    templateUrl: 'app/modules/posts/views/create-post.html',
                    controller: 'PostController'
                })
                .when('/posts/myposts', {
                    templateUrl: 'app/modules/posts/views/list-posts.html',
                    controller: 'PostController'
                })
                .when('/posts/:id', {
                    templateUrl: 'app/modules/posts/views/view-post.html',
                    controller: 'PostController'
                });
        }]);
})();
