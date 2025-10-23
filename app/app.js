angular.module('blogApp', [
    'ngRoute',
    'authModule',
    'postsModule',
    'categoriesModule',
    'homeModule',
    'usersModule'
]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('ApiInterceptor');
}]);
