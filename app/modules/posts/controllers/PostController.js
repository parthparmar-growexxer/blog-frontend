(function() {
    'use strict';

    angular.module('postsModule')
        .controller('PostController', [
            '$scope', '$timeout', 'ApiService', 'AuthService', 'PostService', '$location', '$routeParams', '$sce',
            function($scope, $timeout, ApiService, AuthService, PostService, $location, $routeParams, $sce) {

                $scope.posts = [];
                $scope.displayedBlogs = [];
                $scope.blogsPerPage = 6;
                $scope.nextIndex = 0;
                $scope.categories = [];
                $scope.post = {
                    is_published: false
                };
                $scope.isEdit = !!$routeParams.id;
                $scope.selectedCategory = '';
                $scope.BASE_STORAGE_URL = 'http://laravel.local/storage/';
                $scope.bannerFile = null;

                // Initialize schema and form as null first
                $scope.postSchema = null;
                $scope.postForm = null;

                // -------------------------
                // Auth & Navigation
                // -------------------------
                $scope.isLoggedIn = function() { 
                    return AuthService.isLoggedIn();
                };
                
                $scope.login = function() { 
                    new bootstrap.Modal(document.getElementById('loginModal')).show();
                };
                
                $scope.writeBlog = function() { 
                    $location.path('/posts/new');
                };

                // -------------------------
                // File Upload Handler
                // -------------------------
                $scope.onFileSelect = function(file) {
                    if (!file) return;
                    $scope.$apply(function() {
                        $scope.bannerFile = file;
                    });
                };

                // -------------------------
                // Utility: truncate content
                // -------------------------
                function truncateHtml(html, length) {
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    var text = div.textContent || div.innerText || '';
                    return text.length > length ? $sce.trustAsHtml(text.substr(0, length) + '...') : $sce.trustAsHtml(text);
                }

                // -------------------------
                // Initialize Schema Form with Categories
                // -------------------------
                function initializeSchemaForm(categories) {
                    // Build titleMap
                    var titleMap = [];
                    var enumValues = [];
                    
                    for (var i = 0; i < categories.length; i++) {
                        titleMap.push({
                            value: categories[i].id,
                            name: categories[i].name
                        });
                        enumValues.push(categories[i].id);
                    }
                    
                    // Define schema
                    $scope.postSchema = {
                        type: 'object',
                        properties: {
                            title: { 
                                type: 'string', 
                                title: 'Title', 
                                minLength: 3,
                                maxLength: 255
                            },
                            content: { 
                                type: 'string', 
                                title: 'Content',
                                minLength: 10
                            },
                            category_id: {
                                type: 'integer',
                                title: 'Category',
                                enum: enumValues
                            },
                            is_published: { 
                                type: 'boolean', 
                                title: 'Publish immediately',
                                default: false
                            }
                        },
                        required: ['title', 'content', 'category_id']
                    };

                    // Define form
                    $scope.postForm = [
                        {
                            key: 'title',
                            type: 'text',
                            placeholder: 'Enter post title',
                            feedback: false
                        },
                        {
                            key: 'content',
                            type: 'textarea',
                            placeholder: 'Write your blog content here...',
                            feedback: false
                        },
                        {
                            key: 'category_id',
                            type: 'select',
                            titleMap: titleMap,
                            feedback: false
                        },
                        {
                            key: 'is_published',
                            type: 'checkbox',
                            feedback: false
                        },
                        {
                            type: 'submit',
                            style: 'btn-primary',
                            title: $scope.isEdit ? 'Update Blog' : 'Create Blog'
                        }
                    ];

                }

                // -------------------------
                // Load Categories
                // -------------------------
                function loadCategories(callback) {
                    ApiService.getCategories()
                        .then(function(res) {
                            $scope.categories = res.data.data;
                            
                            // Initialize schema form with categories
                            initializeSchemaForm($scope.categories);
                            
                            if (callback) {
                                $timeout(callback, 100);
                            }
                        })
                        .catch(function(err) {
                            console.error('Error loading categories:', err);
                        });
                }

                // -------------------------
                // Filter Posts by Category
                // -------------------------
                $scope.filterPostsByCategory = function (categoryId) {
                    if (!categoryId) {
                        $scope.displayedBlogs = $scope.posts.slice(0, $scope.nextIndex);
                        return;
                    }
                    var filtered = $scope.posts.filter(function(post) {
                        return post.category && post.category.id === parseInt(categoryId);
                    });
                    $scope.displayedBlogs = filtered.slice(0, $scope.nextIndex);
                }

                // -------------------------
                // Publish toggle
                // -------------------------
                $scope.togglePublish = function(post) {
                    post.is_published = !post.is_published;
                    PostService.postTogglePublish(post.id)
                        .then(function() {
                            alert('Post ' + (post.is_published ? 'published' : 'unpublished') + ' successfully!');
                        })
                        .catch(function(err) {
                            console.error('Error updating publish status:', err);
                            post.is_published = !post.is_published;
                        });
                };

                // -------------------------
                // Load all posts
                // -------------------------
                $scope.loadPosts = function() {
                    PostService.getPosts()
                        .then(function(res) {
                            $scope.posts = res.data.data.map(function(blog) {
                                blog.contentTrusted = truncateHtml(blog.content, 150);
                                return blog;
                            });
                            $scope.displayedBlogs = [];
                            $scope.nextIndex = 0;
                            $scope.loadMoreBlogs();
                        })
                        .catch(function(err) {
                            console.error('Failed to load posts:', err);
                        });
                };

                $scope.openBlog = function(post) {
                    $location.path('/posts/' + post);
                };

                $scope.deletePost = function(postId) {
                    if (confirm('Are you sure you want to delete this post?')) {
                        PostService.deletePost(postId)
                            .then(function() {
                                alert('Post deleted successfully!');
                                $scope.posts = $scope.posts.filter(function(p) { 
                                    return p.id !== postId; 
                                });
                                $scope.displayedBlogs = $scope.displayedBlogs.filter(function(p) { 
                                    return p.id !== postId; 
                                });
                            })
                            .catch(function(err) {
                                console.error('Error deleting post:', err);
                            });
                    }
                };

                $scope.loadMoreBlogs = function() {
                    if ($scope.nextIndex >= $scope.posts.length) return;
                    var nextSet = $scope.posts.slice($scope.nextIndex, $scope.nextIndex + $scope.blogsPerPage);
                    $scope.displayedBlogs = $scope.displayedBlogs.concat(nextSet);
                    $scope.nextIndex += $scope.blogsPerPage;
                };

                // -------------------------
                // Create or Update Post
                // -------------------------
                $scope.onSubmit = function(form) {
                    $scope.$broadcast('schemaFormValidate');
                    
                    if (form.$invalid) {
                        alert('Please fill all required fields correctly');
                        return;
                    }

                    var formData = new FormData();
                    formData.append('title', $scope.post.title);
                    formData.append('content', $scope.post.content);
                    formData.append('category_id', $scope.post.category_id);
                    formData.append('is_published', $scope.post.is_published ? 1 : 0);
                    
                    if ($scope.bannerFile) {
                        formData.append('banner', $scope.bannerFile);
                    }

                    var action = $routeParams.id
                        ? PostService.updatePost($routeParams.id, formData)
                        : PostService.createPost(formData);

                    action
                        .then(function(res) {
                            alert($routeParams.id ? 'Post updated successfully!' : 'Post created successfully!');
                            $location.path('/posts');
                        })
                        .catch(function(err) {
                            console.error('Error saving post:', err);
                            var errorMsg = 'Failed to save post';
                            if (err.data && err.data.message) {
                                errorMsg = err.data.message;
                            }
                            alert('Error: ' + errorMsg);
                        });
                };

                // -------------------------
                // Comments
                // -------------------------
                $scope.comments = [];
                $scope.newComment = '';

                $scope.loadComments = function(postId) {
                    if (!postId) return;
                    PostService.getComments(postId)
                        .then(function(res) {
                            $scope.comments = res.data.data;
                        })
                        .catch(function(err) {
                            console.error('Failed to load comments:', err);
                        });
                };

                $scope.addComment = function(postId) {
                    $scope.newComment = document.getElementById('newComment').value;
                    if (!postId || !$scope.newComment.trim()) return;
                    PostService.addComment(postId, $scope.newComment)
                        .then(function(res) {
                            $scope.comments.push(res.data.data);
                            $scope.newComment = '';
                            document.getElementById('newComment').value = '';
                            $scope.loadComments(postId);
                        })
                        .catch(function(err) {
                            console.error('Failed to add comment:', err);
                        });
                };

                $scope.deleteComment = function(commentId, index) {
                    if (!commentId) return;
                    PostService.deleteComment(commentId)
                        .then(function() {
                            $scope.comments.splice(index, 1);
                        })
                        .catch(function(err) {
                            console.error('Failed to delete comment:', err);
                        });
                };

                // -------------------------
                // Initialization
                // -------------------------
                if ($location.path() === '/posts/new') {
                    $scope.post = {
                        is_published: false
                    };
                    loadCategories();
                } else if ($location.path().indexOf('/posts/edit/') === 0) {
                    if ($routeParams.id) {
                        loadCategories(function() {
                            PostService.getPostById($routeParams.id)
                                .then(function(res) {
                                    $scope.post = res.data.data;
                                    // Convert category object to category_id
                                    if ($scope.post.category) {
                                        $scope.post.category_id = parseInt($scope.post.category.id);
                                    }
                                    $scope.post.is_published = !!$scope.post.is_published;
                                })
                                .catch(function(err) {
                                    console.error('Failed to load post:', err);
                                });
                        });
                    }
                } else if ($location.path() === '/posts/myposts') {
                    PostService.getMyPosts()
                        .then(function(res) {
                            $scope.posts = res.data.data.map(function(blog) {
                                blog.contentTrusted = truncateHtml(blog.content, 150);
                                return blog;
                            });
                            $scope.displayedBlogs = [];
                            $scope.nextIndex = 0;
                            $scope.loadMoreBlogs();
                        })
                        .catch(function(err) {
                            console.error('Failed to load my posts:', err);
                        });
                } else if ($routeParams.id) {
                    PostService.getPostById($routeParams.id)
                        .then(function(res) {
                            $scope.post = res.data.data;
                            $scope.post.contentTrusted = $sce.trustAsHtml($scope.post.content);
                            $scope.post.is_published = !!$scope.post.is_published;
                            $scope.loadComments($scope.post.id);
                        })
                        .catch(function(err) {
                            console.error('Failed to load post:', err);
                        });
                } else {
                    $scope.loadPosts();
                    loadCategories();
                    
                    window.onscroll = function() {
                        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                            $scope.$apply(function() {
                                $scope.loadMoreBlogs();
                            });
                        }
                    };
                }

            }
        ]);
})();