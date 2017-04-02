var app = angular.module("myApp", []);

app.controller("dashboardController", ["$http", function($http) {
    var vm = this;
    vm.startDate = new Date();
    vm.endDate = new Date();
    vm.generateReport = function() {
        $http.get("http://localhost:3000/getFormattedData/" + vm.project + "/" + vm.repo + "/" + vm.startDate.getTime() + "/" + vm.endDate.getTime()).then(function(res) {
            vm.formattedData = res.data;
        });
    }
}]);