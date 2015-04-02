'use strict';

var app = angular.module('scheduler',[]); // requires angularJS version >= 1.4

app.controller('main', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.version = '0.5';
  $scope.nameBool = false; // name is clicked?

  // check for local storage
  $scope.taskStore = [];
  var temp = localStorage.getItem('taskStore');
  if(temp) { // load saved taskStore if it exists
    var arr = JSON.parse(temp);
    arr.forEach(function(x) {
      var temp = new Task(x); // temp created to check if Task() returns error object
      if(temp.error !== true) $scope.taskStore.push(temp); // don't push if Task() returns error object
    });
  };
  console.log($scope.taskStore);

  $scope.updateStorage = function() {
    console.log('local storage updated!');
    localStorage.setItem('taskStore', JSON.stringify($scope.taskStore));
  };

  $scope.newTask = function(name, startNow) {
    var temp = new Task(name, startNow);
    if(temp.error !== true) {
      this.taskStore.push(temp);
      this.updateStorage();
    }
  };

  function Task(arg, startNow) { // 2nd arg is bool
    this.initTime = new Date();
    if(typeof arg === 'string') { // create new task with arg being name
      this.name = arg; // arg coming from text input box
      this.cumulativeTime = 0; // time lapsed prior to a pause, integer
      this.date = this.initTime.toDateString();
      this.lapsedTimeString = '';
      if(startNow === true) {
        this.isPaused = false;
        this.timeoutHandler = $timeout(increment, 1000, true, this); // 3rd arg is def, 4th is arg to pass to increment
      }
      else { this.isPaused = true; }
    }
    else if (typeof arg === 'object') { // recreating saved task from local storage
//      if(arg.cumulativeTime === 0) return {error : true};
      this.name = arg.name;
      this.cumulativeTime = arg.cumulativeTime;
      this.date = arg.date;
      this.isPaused = true;
    }
    this.nameBool = false;  // don't start in name edit mode
    this.toggleName = function() { if (this.nameBool) this.nameBool = false; else this.nameBool = true; }

    function increment(task) {
      task.timeoutHandler = $timeout(increment, 1000, true, task);  // immediately restart timer
      var now = new Date();
      task.setLapsedTime();
      if((now - task.initTime) > 20000) { // save every 20 seconds
        task.save();
      }
    }

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
      else {  // task still running, let's pause
        $timeout.cancel(this.timeoutHandler);
        this.isPaused = true;
        this.save();
        this.initTime = undefined;
      }
    };
    this.remove = function(index) {
      $scope.taskStore.splice(index,1);
      $scope.updateStorage();
    };
    this.save = function() { //
      var now = new Date();
      this.cumulativeTime += now.getTime() - this.initTime.getTime();
      this.initTime = now;
      $scope.updateStorage();
    };
  };

}]);
