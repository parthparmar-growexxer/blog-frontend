angular.module('blogApp', [
    'ngRoute',
    'ngSanitize',
    'schemaForm',
    'authModule',
    'postsModule',
    'categoriesModule',
    'homeModule',
    'usersModule',
]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('ApiInterceptor');
}]);
