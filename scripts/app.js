var app = angular.module('scheduler',[]); // requires angularJS version >= 1.4

app.controller('main', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.version = '0.3.0';
  $scope.nameBool = false; // name is clicked?
  $scope.taskStore = [];
  $scope.newTask = function(name) {
    this.taskStore.push(new Task(name));
  };

  function Task(name) {
    this.name = name; // arg coming from text input box
    this.isPaused = false; // begin task unpaused, this bool used for ngSwitch
    this.nameBool = false;
    this.toggleName = function() { if (this.nameBool) this.nameBool = false; else this.nameBool = true; }

    this.cumulativeTime = 0; // time lapsed prior to a pause, integer
    this.initTime = this.endTime = new Date(); // initialize both times to now
    this.date = this.initTime.toDateString();
    this.lapsedTimeString = '';

    function increment(task) {
      task.endTime = new Date();
      task.setLapsedTime();
      task.timeoutHandler = $timeout(increment, 1000, true, task);
    }
    this.timeoutHandler = $timeout(increment, 1000, true, this); // 3rd arg is def, 4th is arg to pass to increment

    this.setLapsedTime = function() {
      var lapsedTime = Math.floor((this.cumulativeTime + new Date().getTime() - this.initTime.getTime())/1000);

      var seconds = lapsedTime % 60;
      if(seconds < 10) seconds = '0' + seconds;
      lapsedTime = (lapsedTime - seconds)/60;

      var minutes = lapsedTime % 60;
      if (minutes < 10) minutes = '0' + minutes;
      lapsedTime = (lapsedTime - minutes)/60;

      var hours = lapsedTime % 24;
      if(hours < 10) hours = '0' + hours;

      this.lapsedTimeString = hours + ':' + minutes + ':' + seconds;
    }; this.setLapsedTime(); // and now immediately call this function to initialize lapsedTimeString

    this.pause = function() {
      if(this.isPaused) {
        this.initTime = new Date();
        this.timeoutHandler = $timeout(increment, 1000, true, this); // 3rd arg is def, 4th is arg to pass to increment
        this.isPaused = false;
      }
      else {
        this.cumulativeTime += new Date().getTime() - this.initTime.getTime();
        $timeout.cancel(this.timeoutHandler);
        this.isPaused = true;
      }
    };
    this.remove = function(index) {
      $scope.taskStore.splice(index,1);
    };
  };

}]);
