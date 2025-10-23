(function() {
    'use strict';

    angular.module('postsModule')
        .controller('PostController', ['$scope', '$timeout', 'ApiService', 'AuthService', 'PostService', '$location', '$routeParams', '$sce', 
        function($scope, $timeout, ApiService, AuthService, PostService, $location, $routeParams, $sce) {

            $scope.posts = [];
            $scope.displayedBlogs = [];
            $scope.blogsPerPage = 6;
            $scope.nextIndex = 0;
            $scope.categories = [];
            $scope.post = {};
            $scope.isEdit = !!$routeParams.id;
            $scope.selectedCategory = '';
            $scope.BASE_STORAGE_URL = 'http://laravel.local/storage/';

            // -------------------------
            // Authentication & Navigation
            // -------------------------
            $scope.isLoggedIn = () => AuthService.isLoggedIn();
            $scope.login = () => new bootstrap.Modal(document.getElementById('loginModal')).show();
            $scope.writeBlog = () => $location.path('/posts/new');

            // -------------------------
            // Utilities
            // -------------------------
            function truncateHtml(html, length) {
                const div = document.createElement('div');
                div.innerHTML = html;
                let text = div.textContent || div.innerText || '';
                return text.length > length ? $sce.trustAsHtml(text.substr(0, length) + '...') : $sce.trustAsHtml(text);
            }

            $scope.togglePublish = function(post) {
                post.is_published = !post.is_published;
                PostService.postTogglePublish(post.id)
                    .then(() => {
                        alert('Post ' + (post.is_published ? 'published' : 'unpublished') + ' successfully!');
                    })
                    .catch(err => {
                        console.error('Error updating publish status:', err);
                        post.is_published = !post.is_published; // revert on error
                    });
            };
            
            // -------------------------
            // Load categories
            // -------------------------
            ApiService.getCategories().then(res => $scope.categories = res.data.data.slice(0, 4));

            // -------------------------
            // Load posts
            // -------------------------
            $scope.loadPosts = function() {
                PostService.getPosts()
                    .then(res => {
                        $scope.posts = res.data.data.map(blog => {
                            blog.contentTrusted = truncateHtml(blog.content, 150);
                            return blog;
                        });
                        $scope.displayedBlogs = [];
                        $scope.nextIndex = 0;
                        $scope.loadMoreBlogs();
                    })
                    .catch(err => console.error('Failed to load posts:', err));
            };

            $scope.openBlog = function(postId) {
                $location.path('/posts/' + postId);
            };
            
            $scope.deletePost = function(postId) {
                if (confirm('Are you sure you want to delete this post?')) {
                    PostService.deletePost(postId)
                        .then(() => {
                            alert('Post deleted successfully!');
                            $scope.posts = $scope.posts.filter(p => p.id !== postId);
                            $scope.displayedBlogs = $scope.displayedBlogs.filter(p => p.id !== postId);
                        })
                        .catch(err => console.error('Error deleting post:', err));
                }
            };
            
            $scope.loadMoreBlogs = function() {
                if ($scope.nextIndex >= $scope.posts.length) return;
                const nextSet = $scope.posts.slice($scope.nextIndex, $scope.nextIndex + $scope.blogsPerPage);
                $scope.displayedBlogs = $scope.displayedBlogs.concat(nextSet);
                $scope.nextIndex += $scope.blogsPerPage;
            };


            $scope.createPost = function() {
                const editor = document.querySelector('rich-text-editor .ql-editor');
                $scope.post.content = editor ? editor.innerHTML : '';

                const formData = new FormData();
                formData.append('title', $scope.post.title);
                formData.append('content', $scope.post.content);
                formData.append('category_id', $scope.post.category_id);
                formData.append('is_published', $scope.post.is_published ? 1 : 0);

                if ($scope.post.banner) formData.append('banner', $scope.post.banner);

                const action = $routeParams.id ? PostService.updatePost($routeParams.id, formData) : PostService.createPost(formData);

                action.then(() => {
                    alert($routeParams.id ? 'Post updated successfully!' : 'Post created successfully!');
                    $location.path('/posts');
                }).catch(err => console.error('Error saving post:', err));
            };

            // -------------------------
            // Filter posts by category
            // -------------------------
            $scope.filterByCategory = function(categoryId) {
                if (!categoryId) {
                    $scope.loadPosts();
                } else {
                    PostService.getPostsByCategory(categoryId)
                        .then(res => {
                            $scope.posts = res.data.data.map(blog => {
                                blog.contentTrusted = truncateHtml(blog.content, 150);
                                return blog;
                            });

                            // Reset lazy loading
                            $scope.displayedBlogs = [];
                            $scope.nextIndex = 0;
                            $scope.loadMoreBlogs();
                        })
                        .catch(err => console.error('Failed to filter posts:', err));
                }
            };

            // -------------------------
            // Comments
            // -------------------------
            $scope.comments = [];
            $scope.newComment = '';

            // Load comments for a post
            $scope.loadComments = function(postId) {
                if (!postId) return;

                PostService.getComments(postId)
                    .then(res => $scope.comments = res.data.data)
                    .catch(err => console.error('Failed to load comments:', err));
            };

            $scope.addComment = function(postId) {

                $scope.newComment = document.getElementById('newComment').value;

                if (!postId || !$scope.newComment.trim()) return;

                PostService.addComment(postId, $scope.newComment)
                    .then(res => {
                        $scope.comments.push(res.data.data);
                        $scope.post.comments = $scope.comments; // update post.comments for ng-repeat
                        $scope.newComment = '';
                    })
                    .catch(err => console.error('Failed to add comment:', err));
            };

            // Delete a comment
            $scope.deleteComment = function(commentId, index) {
                if (!commentId) return;

                PostService.deleteComment(commentId)
                    .then(() => $scope.comments.splice(index, 1))
                    .catch(err => console.error('Failed to delete comment:', err));
            };

            // Automatically load comments if viewing a post
            if ($routeParams.id) {
                $scope.loadComments($routeParams.id);
            }

            // -------------------------
            // Initialization
            // -------------------------
            if ($location.path() === '/posts/new') {
                $scope.post = {};
            } else if ($location.path().startsWith('/posts/edit/')) {
                if ($routeParams.id) {
                    PostService.getPostById($routeParams.id)
                        .then(res => {
                            $scope.post = res.data.data;

                            // Ensure rich text editor is updated
                            $timeout(() => {
                                const editor = document.querySelector('rich-text-editor .ql-editor');
                                if (editor) editor.innerHTML = $scope.post.content;
                            }, 0);

                            // Convert published status to boolean
                            $scope.post.is_published = !!$scope.post.is_published;

                            // Category should already match the select ng-model
                            $scope.selectedCategory = $scope.post.category_id;
                        })
                        .catch(err => console.error('Failed to load post:', err));
                }
            } 
            else if( $location.path() === '/posts/myposts') {
                PostService.getMyPosts()
                    .then(res => {
                        $scope.posts = res.data.data.map(blog => {
                            blog.contentTrusted = truncateHtml(blog.content, 150);
                            return blog;
                        });
                        $scope.displayedBlogs = [];
                        $scope.nextIndex = 0;
                        $scope.loadMoreBlogs();
                    })
                    .catch(err => console.error('Failed to load my posts:', err));
            }   
            else if ($routeParams.id) {
                PostService.getPostById($routeParams.id)
                .then(res => {
                    $scope.post = res.data.data;

                    // Ensure rich text editor is updated
                    // $timeout(() => {
                    //     const editor = document.querySelector('rich-text-editor .ql-editor');
                    //     if (editor) editor.innerHTML = $scope.post.content;
                    // }, 0);

                    $scope.post.contentTrusted = $sce.trustAsHtml($scope.post.content);

                    // Convert published status to boolean
                    $scope.post.is_published = !!$scope.post.is_published;

                    // Category should already match the select ng-model
                    $scope.selectedCategory = $scope.post.category_id;

                    // -------------------------
                    // Load comments for this post
                    // -------------------------
                    if (!$scope.post.comments) $scope.post.comments = [];
                    PostService.getComments($scope.post.id)
                        .then(res => {
                            $scope.post.comments = res.data.data;
                        })
                        .catch(err => console.error('Failed to load comments:', err));
                })
                .catch(err => console.error('Failed to load post:', err));
                    
            } else {
                $scope.loadPosts();
                window.onscroll = () => {
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                        $scope.$apply($scope.loadMoreBlogs);
                    }
                };
            }

        }]);
})();
