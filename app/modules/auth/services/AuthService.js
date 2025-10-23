angular.module('blogApp')
.factory('AuthService', ['$http', '$q', function($http, $q) {
    const BASE_URL = 'http://laravel.local/api/v1';
    let user = null;

    return {
        login: function(credentials) {
            return $http.post(BASE_URL + '/login', credentials)
                .then(response => {
                    // Adjust according to your API response
                    const data = response.data.data || response.data;
                    if (!data || !data.access_token) {
                        return $q.reject('Invalid login response');
                    }

                    localStorage.setItem('token', data.access_token);
                    user = data.user;
                    localStorage.setItem('user', JSON.stringify(user));
                    return data;
                })
                .catch(err => $q.reject(err));
        },

        register: function(userData) {
            return $http.post(BASE_URL + '/register', userData)
                .then(response => response.data)
                .catch(err => $q.reject(err));
        },

        logout: function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            user = null;
        },

        isLoggedIn: function() {
            return !!localStorage.getItem('token');
        },

        getUser: function() {
            if (!user) {
                user = JSON.parse(localStorage.getItem('user'));
            }
            return user;
        },

        getInitials: function() {
            const u = this.getUser();
            return u ? u.name.split(' ').map(n => n[0]).join('') : '';
        }
    };
}]);
