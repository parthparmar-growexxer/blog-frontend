(function () {
  'use strict';

  angular
    .module('categoriesModule')
    .controller('CategoryController', ['$scope','$timeout','ApiService','AuthService','CategoryService','$location','$routeParams','$sce',
      function ($scope,$timeout,ApiService,AuthService,CategoryService,$location,$routeParams,$sce) {
        $scope.categories = [];
        $scope.category = {};
        $scope.isEdit = !!$routeParams.id;
        $scope.isSubmitting = false;

        // -------------------------
        // Authentication & Navigation
        // -------------------------
        $scope.isLoggedIn = () => AuthService.isLoggedIn();

        if(!$scope.isLoggedIn() || AuthService.getUserRole() !== 'admin') {
            $location.path('/');
        }

        $scope.userRole = () => AuthService.getUserRole();


        // -------------------------
        // Auto-generate slug
        // -------------------------
        $scope.generateSlug = function () {
          if ($scope.category && $scope.category.name) {
            $scope.category.slug = $scope.category.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
              .replace(/\s+/g, '-') // spaces to dashes
              .replace(/-+/g, '-'); // collapse multiple dashes
          }
        };

        // -------------------------
        // Create / Update Handler
        // -------------------------
        $scope.saveCategory = function () {
          if (!$scope.category.name || !$scope.category.slug) {
            alert('Please fill in all required fields.');
            return;
          }

          $scope.isSubmitting = true;

          if ($scope.isEdit) {
            // Update category
            CategoryService.updateCategory($routeParams.id, $scope.category)
              .then(() => {
                alert('Category updated successfully!');
                $location.path('/categories');
              })
              .catch((err) => {
                console.error('Error updating category:', err);
                alert(err.data.message??'Failed to update category.');
              })
              .finally(() => ($scope.isSubmitting = false));
          } else {
            // Create new category
            CategoryService.createCategory($scope.category)
              .then(() => {
                alert('Category created successfully!');
                $location.path('/categories');
              })
              .catch((err) => {
                console.error('Error creating category:', err);
                alert(err.data.message??'Failed to create category.');
              })
              .finally(() => ($scope.isSubmitting = false));
          }
        };

        // -------------------------
        // Delete Category
        // -------------------------
        $scope.deleteCategory = function (categoryId) {
          if (confirm('Are you sure you want to delete this category?')) {
            CategoryService.deleteCategory(categoryId)
              .then(() => {
                alert('Category deleted successfully!');
                $scope.categories = $scope.categories.filter(
                  (c) => c.id !== categoryId
                );
              })
              .catch((err) =>
                console.error('Error deleting category:', err)
              );
          }
        };

        // -------------------------
        // Load all categories (list)
        // -------------------------
        $scope.loadCategories = function () {
          CategoryService.getAllCategories()
            .then((res) => ($scope.categories = res.data.data))
            .catch((err) =>
              console.error('Failed to load categories:', err)
            );
        };

        // -------------------------
        // Load category for editing
        // -------------------------
        if ($scope.isEdit) {
          CategoryService.getCategoryById($routeParams.id)
            .then((res) => ($scope.category = res.data.data))
            .catch((err) =>
              console.error('Failed to load category details:', err)
            );
        } else {
          $scope.loadCategories();
        }
      },
    ]);
})();
