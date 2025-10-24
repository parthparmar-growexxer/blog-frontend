angular.module('homeModule')
.controller('HomeController', ['$scope', '$sce', 'ApiService', 'AuthService', function($scope, $sce, ApiService, AuthService) {
    $scope.categories = [];
    $scope.blogs = [];
    $scope.BASE_STORAGE_URL = 'http://laravel.local/storage/';
    $scope.isLoggedIn = function () {
        return AuthService.isLoggedIn();
    }

    // Utility function: truncate HTML content
    function truncateHtml(html, length) {
        var div = document.createElement('div');
        div.innerHTML = html;
        var text = div.textContent || div.innerText || '';
        if (text.length > length) {
            text = text.substr(0, length) + '...';
        }
        return $sce.trustAsHtml(text);
    }

    // Load categories
    ApiService.getCategories().then(function(response) {
        $scope.categories = response.data.data.slice(0, 4);
    });

    // Load blogs
    ApiService.getPosts().then(function(response) {
        $scope.blogs = response.data.data.slice(0, 6).map(blog => {
            blog.contentTrusted = truncateHtml(blog.content, 150); // slice to 150 chars
            return blog;
        });
    });

    $scope.viewBlog = function(blogId) {
        window.location.href = '#/posts/' + blogId;
    };
    
    $scope.writeBlog = function() {
        window.location.href = '#/posts/new';
    }

    $scope.viewAllBlogs = function() {
        window.location.href = '#/posts';
    };

    // Filter blogs by category
    $scope.filterByCategory = function(categoryId) {
        if (!categoryId) {
            ApiService.getPosts().then(res => {
                $scope.blogs = res.data.data.map(blog => {
                    blog.contentTrusted = truncateHtml(blog.content, 150);
                    return blog;
                });
            });
        } else {
            ApiService.getPostsByCategory(categoryId).then(res => {
                $scope.blogs = res.data.data.map(blog => {
                    blog.contentTrusted = truncateHtml(blog.content, 150);
                    return blog;
                });
            });
        }
    };

    $scope.openBlog = function(blog) {
        window.location.href = '#/posts/' + blog.id;
    };
}]);
