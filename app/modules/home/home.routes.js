angular.module('homeModule')
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'app/modules/home/views/home.html',
        controller: 'HomeController'
    });
}]);
