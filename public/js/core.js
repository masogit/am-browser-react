var cms = angular.module('cmsDashboard', ['cmsController', 'cmsTopology', 'chart.js']);

cms.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
    }
});

cms.filter('range', function () {
    return function (input, total) {
        total = Math.ceil(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});

angular.module('cmsTopology', [])

    .factory('topology', ['$http', function ($http) {
        return {
            get: function (formData) {
                return $http.post('/cms/get', formData);
            },

            post: function (formData) {
                return $http.post('/cms/post', formData);
            }
        }
    }]);

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};
