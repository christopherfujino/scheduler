'use strict';

var app = angular.module('scheduler',[]); // requires angularJS version >= 1.4

app.controller('main', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.version = '0.9a';
  $scope.nameBool = false; // name is clicked?

  $scope.taskStore = {
    version : $scope.version,
    activeTasks : [],
    toDoTasks : []
  };

  var temp = localStorage.getItem('taskStore'); // read taskStore from localStorage
  if(temp) { // load saved taskStore if it exists
    var obj = JSON.parse(temp);

    if (!obj.version) { // from version < 0.7, where taskStore was a literal array of Tasks
      obj.forEach(function(x) {
        var temp = new Task(x); // temp created to check if Task() returns error object
        if(temp.error !== true) $scope.taskStore.activeTasks.push(temp); // don't push if Task() returns error object
      });

      console.log('Migrating taskStore from version <= 0.6');

//      throw new Error("Migrating taskStore from version 0.6");
    }
    else if (obj.version !== $scope.version) { // saved taskStore from an earlier version
      console.log(obj);
      console.log('Warning! Saved data from an earlier version!');
      console.log('Current app version is: ' + $scope.version);
      console.log('Saved data version is: ' + obj.version);
//      throw new Error("Something went badly wrong!");   // only throw error if saved data API broken
    }
    // if saved data from same version, process
    obj.activeTasks.forEach(function(x) {
      var temp = new Task(x); // temp created to check if Task() returns error object
      if(temp.error !== true) $scope.taskStore.activeTasks.push(temp); // don't push if Task() returns error object
    });
    obj.toDoTasks.forEach(function(x) {
      var temp = new Task(x); // temp created to check if Task() returns error object
      if(temp.error !== true) $scope.taskStore.toDoTasks.push(temp); // don't push if Task() returns error object
    });
  }
  console.log($scope.taskStore);

  $scope.updateStorage = function() {
    console.log('local storage updated!');
    localStorage.setItem('taskStore', JSON.stringify($scope.taskStore));
  };

  $scope.newTask = function(name, startNow) {
    var temp = new Task(name, startNow);
    if(temp.error !== true) {
      if(startNow === true) {
        this.taskStore.activeTasks.unshift(temp);
      }
      else {
        this.taskStore.toDoTasks.push(temp); // keep oldest to-do's at top, so push
      }
      this.updateStorage();
    }
  };

  $scope.addTag = function(tag, task) {
    if(task.addTag(tag)) {
      $scope.updateStorage();
    };
  };

  $scope.removeTag = function(tag, task) {
    if(task.removeTag(tag)){
      $scope.updateStorage();
    };
  }

  $scope.startToDoTask = function(index) {
    var activatedTask = $scope.taskStore.toDoTasks.splice(index, 1)[0];
    $scope.taskStore.activeTasks.unshift(activatedTask);
    activatedTask.pause();
  };

  function Task(arg, startNow) { // 1st arg is string for new obj, obj for loaded obj; 2nd arg is bool
    this.tags = [];
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
      this.tags = arg.tags.slice(0);
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
    this.remove = function(type, index) {
      if(type === 'active') $scope.taskStore.activeTasks.splice(index,1);
      else if(type === 'toDo') $scope.taskStore.toDoTasks.splice(index,1);
      else {
        throw new Error('unknown type "' + type + '" in Task.remove()');
      }
      $scope.updateStorage();
    };
    this.addTag = function(tag) {
      var isRepeat = false;
      this.tags.forEach(function(x) {
        if (x==tag) isRepeat = true;
      });
      if(!isRepeat) {
        this.tags.push(tag);
        return true;
      }
      else return false;
    };
    this.removeTag = function(tag) {
      var tagToRemove = null;
      this.tags.forEach(function(x, index) {
        if (x==tag) tagToRemove = index;
      });
      if(tagToRemove !== null) {
        this.tags.splice(tagToRemove, 1);
        return true;
      }
      else {
        return false;
      }
    };
    this.save = function() { //
      var now = new Date();
      this.cumulativeTime += now.getTime() - this.initTime.getTime();
      this.initTime = now;
      $scope.updateStorage();
    };
  };

}]);
