angular.module('blogApp')
.factory('ApiInterceptor', ['$q', '$window', function($q, $window) {
    return {
        // Intercept each outgoing request
        request: function(config) {
            const token = $window.localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = 'Bearer ' + token;
            }
            return config;
        },

        // Handle response errors globally
        responseError: function(response) {
            if (response.status === 401) {
                // Optional: logout user on 401
                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('user');
                // You could also broadcast an event to redirect to login
            }
            return $q.reject(response);
        }
    };
}]);
