angular.module('blogApp')
.directive('navbar', function() {
    return {
        restrict: 'E',
        scope: {},
        controller: ['$scope', 'AuthService', function($scope, AuthService) {
            console.log('Navbar controller loaded');
            $scope.isLoggedIn = function () {return AuthService.isLoggedIn(); };
            $scope.getInitials = function () { return AuthService.getInitials(); };

            $scope.login = function() {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            };

            $scope.logout = function() {
                AuthService.logout();
            };

            $scope.submitLogin = function(user) {
                AuthService.login(user).then(res => {
                    // Close modal after successful login
                    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
                    $scope.user = AuthService.getUser();
                    window.location.reload();
                }).catch(err => alert('Login failed'));
            };

            $scope.submitRegister = function(user) {
                AuthService.register(user).then(res => {
                    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                    alert('Registered successfully, please login');
                }).catch(err => alert('Registration failed'));
            };

        }],
        templateUrl: 'app/shared/views/navbar.html'
    };
});
