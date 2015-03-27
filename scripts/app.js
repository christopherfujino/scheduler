var app = angular.module('scheduler',[]); // requires angularJS version >= 1.4

app.controller('main', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.version = '0.4.1';
  $scope.nameBool = false; // name is clicked?

  // check for local storage
  $scope.taskStore = [];
  var temp = localStorage.getItem('taskStore');
  if(temp) { // load saved taskStore if it exists
    var arr = JSON.parse(temp);
    arr.forEach(function(x) {
      var temp = new Task(x);
      if(temp.error !== true) $scope.taskStore.push(temp);
    });
  };
  console.log($scope.taskStore);

  $scope.newTask = function(name) {
    var temp = new Task(name);
    if(temp.error !== true) this.taskStore.push(temp); // don't push if Task() returns error object
  };

  $scope.updateStorage = function() {
    console.log('local storage updated!');
    localStorage.setItem('taskStore', JSON.stringify($scope.taskStore));
  };

  function Task(arg) {
    this.initTime = this.endTime = new Date(); // initialize both times to now
    if(typeof arg === 'string') { // create new task with arg being name
      this.name = arg; // arg coming from text input box
      this.cumulativeTime = 0; // time lapsed prior to a pause, integer
      this.date = this.initTime.toDateString();
      this.lapsedTimeString = '';
      this.isPaused = false; // begin task unpaused, this bool used for ngSwitch
    }
    else if (typeof arg === 'object') { // recreating saved task from local storage
      if(arg.cumulativeTime === 0) return {error : true};
      this.name = arg.name;
      this.cumulativeTime = arg.cumulativeTime;
      this.date = arg.date;
      this.isPaused = true; // saved tasks always load paused
    }
    this.nameBool = false; // don't start in name edit mode
    this.toggleName = function() { if (this.nameBool) this.nameBool = false; else this.nameBool = true; }

    function increment(task) {
      task.endTime = new Date();
      task.setLapsedTime();
      task.timeoutHandler = $timeout(increment, 1000, true, task);
    }

    if (!this.isPaused) this.timeoutHandler = $timeout(increment, 1000, true, this); // 3rd arg is def, 4th is arg to pass to increment

    this.setLapsedTime = function() {
      var x = Math.floor((this.cumulativeTime + new Date().getTime() - this.initTime.getTime())/1000);

      var seconds = x % 60;
      if(seconds < 10) seconds = '0' + seconds;
      x = (x - seconds)/60;

      var minutes = x % 60;
      if (minutes < 10) minutes = '0' + minutes;
      x = (x - minutes)/60;

      var hours = x % 24;
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

        $scope.updateStorage();
      }
    };
    this.remove = function(index) {
      $scope.taskStore.splice(index,1);
      $scope.updateStorage();
    };
  };

}]);
