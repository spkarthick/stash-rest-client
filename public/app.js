var app = angular.module("myApp", []);

app.controller("dashboardController", ["$http", function($http) {
    var vm = this;
    vm.startDate = new Date();
    vm.endDate = new Date();
    vm.repos = [];
    vm.projects = [];
    vm.project = {};
    vm.repo = {};

    vm.generateReport = function() {
        if(vm.project && vm.repo && vm.project.key && vm.repo.name ) {
             $http.get("http://localhost:3000/getFormattedData/" + vm.project.key + "/" + vm.repo.name + "/" + vm.startDate.getTime() + "/" + vm.endDate.getTime()).then(function(res) {
                vm.formattedData = res.data;
            });
        } else {
            alert('Invalid input');
        }
    }

    function fetchRepo(projKey) {
         $http.get("http://localhost:3000/getRepo/"+ projKey).then(function(resp){
            vm.repos = resp.data;
        });
    };

    vm.projectChanged = function() {
        //console.log(vm.project.name);
        vm.repos = [];
        if(vm.project &&  vm.project.key) {
            fetchRepo(vm.project.key);
        }
    }

    vm.repoChanged = function() {
       // console.log(vm.repo.name);
    }

    function init(){
        //fetch all projects
        $http.get("http://localhost:3000/getProjects/").then(function(resp){
            vm.projects = resp.data;
        });
    }

    init();
}]);