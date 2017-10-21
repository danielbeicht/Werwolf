(function () {
    'use strict';
    angular.module('werwolf').config(['ChartJsProvider', function (ChartJsProvider) {
      ChartJsProvider.setOptions({
        scale : {
          ticks : {
            beginAtZero : true,
            userCallback: function(label, index, labels) {
              // when the floored value is the same as the value we have a whole number
              console.log(typeof label)
              if (Math.floor(label) === label) {
                return label;
              } else if (typeof label === 'string' || label instanceof String)
                return label;
            },
          },
          xAxes: [{
            ticks: {
              fontSize: 30,
              fontColor: "red"
            }
          }]
        },
        global:{
          defaultFontColor: '#FFFFFF',
          defaultFontSize: 13
        }

      });
    }]);


})();

