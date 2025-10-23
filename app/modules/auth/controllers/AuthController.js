angular.module('authModule')
.controller('AuthController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
    
    // Initialize user object
    $scope.user = {
        email: '',
        password: ''
    };

    // Initialize messages
    $scope.errorMessage = '';
    $scope.successMessage = '';

    // Login function
    $scope.login = function() {
        if (!$scope.user.email || !$scope.user.password) {
            $scope.errorMessage = 'Email and password are required.';
            return;
        }

        AuthService.login($scope.user)
        .then(function(response) {
            // On success, redirect to home or posts page
            $scope.successMessage = 'Login successful!';
            $scope.errorMessage = '';
            $location.path('/'); // redirect to home
        })
        .catch(function(error) {
            // Handle login errors
            $scope.errorMessage = error.data && error.data.message 
                                  ? error.data.message 
                                  : 'Login failed. Please try again.';
            $scope.successMessage = '';
        });
    };

    // Optional: logout function
    $scope.logout = function() {
        AuthService.logout();
        $scope.user = {};
        $location.path('/login'); // redirect to login page
    };
}]);
