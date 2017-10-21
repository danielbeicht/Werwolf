(function () {
    'use strict';
    angular
        .module('werwolf')
        .config(uiRouterConfig)

    uiRouterConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

    function uiRouterConfig($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'app/components/home/home.html',
                controller: 'homeCtrl'
            })
        ;
        $locationProvider.html5Mode(true);


    }
})();
