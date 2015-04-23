'use strict';

var isChromeApp = (function(){
  var theBool = chrome && chrome.app && chrome.app.runtime;

  return {
    get : function() {
      return theBool;
    }
  };
})();

var app = angular.module('scheduler',[]); // requires angularJS version >= 1.4

app.controller('main', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.version = '0.10.1';
  $scope.nameBool = false; // name is clicked?

  $scope.taskStore = {
    version : $scope.version,
    activeTasks : [],
    toDoTasks : [],
    tags : [] // of the form { 'tag' : 'my tag name', 'time' : 5500 }
  };

  var tagRefreshHandler = null;

  function tagRefresh() {
    $timeout.cancel(tagRefreshHandler); // cancel any other scheduled refresh
    tagRefreshHandler = $timeout(tagRefresh, 60000);  // schedule another refresh

    for(var k=0; k<$scope.taskStore.tags.length; k++) { // iterate through each tag of taskStore.tags[]
      var query = $scope.taskStore.tags[k];

      // for queryTag, sum up all cumulativeTime of tasks with this tag
      var ms = 0,
        active = $scope.taskStore.activeTasks;
      for(var i=0; i<active.length; i++) { // iterate through all active tasks
        for(var j=0; j<active[i].tags.length; j++) { // iterate through all tags of each task
          if(active[i].tags[j] === query.tag) {
            ms += active[i].cumulativeTime;
            break;
          }
        }
      }
      query.time = $scope.timeString(ms);
    }
  }

  $scope.timeString = function(x) {
    /*
      this takes a quantity of milliseconds x, and converts it to a string of the
      form Hs:Ms:Ss
    */
    x = Math.floor(x/1000);
    var seconds = x % 60;
    if(seconds < 10) seconds = '0' + seconds;
    x = (x - seconds)/60;

    var minutes = x % 60;
    if (minutes < 10) minutes = '0' + minutes;
    x = (x - minutes)/60;

    var hours = x % 24;
    if(hours < 10) hours = '0' + hours;

    return hours + ':' + minutes + ':' + seconds;
  };

  if (isChromeApp.get()) { // if we are in a chrome app, use chrome.storage.local
    console.log('reading from chrome.storage.local!');
    chrome.storage.local.get('taskStore', function(getObj) {
      var obj = getObj.taskStore;
      if(obj.version) { // if this is a valid taskStore
        if (obj.version !== $scope.version) { // saved taskStore from an earlier version
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
        if (typeof obj.tags === 'object') { // if tags[] exists from memory, copy it into $scope.taskStore.tags[]
          if (typeof obj.tags[0] === 'string') { // api <= 0.9a
            obj.tags.forEach(function(tag){
              $scope.taskStore.tags.push({
                'tag' : tag,
                'time' : null
              });
            });
          }
          else if (typeof obj.tags[0] === 'object') {
            $scope.taskStore.tags = obj.tags.slice(0);
          }
        }

      }
    } );
  }
  else {  // if not in a chrome app, use localStorage
    console.log('reading from localStorage');
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
      if (obj.tags) { // if tags[] exists from memory, copy it into $scope.taskStore.tags[]
        if (typeof obj.tags[0] === 'string') { // api <= 0.9a
          obj.tags.forEach(function(tag){
            $scope.taskStore.tags.push({
              'tag' : tag,
              'time' : null
            });
          });
        }
        else if (typeof obj.tags[0] === 'object') {
          $scope.taskStore.tags = obj.tags.slice(0);
        }
      }
    }

  }
/*
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
    if (obj.tags) { // if tags[] exists from memory, copy it into $scope.taskStore.tags[]
      if (typeof obj.tags[0] === 'string') { // api <= 0.9a
        obj.tags.forEach(function(tag){
          $scope.taskStore.tags.push({
            'tag' : tag,
            'time' : null
          });
        });
      }
      else if (typeof obj.tags[0] === 'object') {
        $scope.taskStore.tags = obj.tags.slice(0);
      }
    }
  }
//  console.log($scope.taskStore);
*/
  console.log($scope);
  tagRefresh();  // refresh tag times

  $scope.updateStorage = function() {
    if (isChromeApp.get()) { // if we are in a chrome app, use chrome.storage.local
      chrome.storage.local.set( { 'taskStore' : $scope.taskStore } );
      console.log('chrome.storage.local updated!');
      console.log($scope.taskStore);
    }
    else {  // if not in a chrome app, use localStorage
      localStorage.setItem('taskStore', JSON.stringify($scope.taskStore));
      console.log('local storage updated!');
    }
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
      var dupe = false; // is this tag already listed in taskStore.tags[]?
      $scope.taskStore.tags.forEach(function(x){
        if(x.tag===tag) dupe=true;
      });
      if(!dupe) {
        $scope.taskStore.tags.push({'tag': tag, 'time': null}); // only add this tag if it's unique
        tagRefresh();
      }
      $scope.updateStorage();
    };
  };

  $scope.removeTag = function(tag, task) {
    if(task.removeTag(tag)){
      var unique = true, // assume this tag was unique, unless another is found
        task = {},
        loopDone = false; // should we break the outer loop?
      // check if tags should be removed, implement
      for(var i=0; !loopDone && i<$scope.taskStore.activeTasks.length; i++) {
        task = $scope.taskStore.activeTasks[i];
        for(var j=0; j<task.tags.length; j++) {
          if (task.tags[j] === tag) {
            unique = false;
            loopDone = true; // done looping, tag not unique
            break;
          }
        }
      }

      for(var i=0; !loopDone && i<$scope.taskStore.toDoTasks.length; i++) {
        task = $scope.taskStore.toDoTasks[i];
        for(var j=0; j<task.tags.length; j++) {
          if (task.tags[j] === tag) {
            unique = false;
            loopDone = true; // done looping, tag not unique
            break;
          }
        }
      }
      console.log('unique = ' + unique);
      if (unique) { // tag was unique, remove it from $scope.taskStore.tags[]
        for(var i=0; i<$scope.taskStore.tags.length; i++) {
          if(tag === $scope.taskStore.tags[i].tag) {
            $scope.taskStore.tags.splice(i, 1);
            console.log('tag ' + tag + ' deleted!');
          }
        }
      }
//      else { console.log('not so unique.'); }
      $scope.updateStorage();
    }
  }

  $scope.startToDoTask = function(index) {
    var activatedTask = $scope.taskStore.toDoTasks.splice(index, 1)[0];
    $scope.taskStore.activeTasks.unshift(activatedTask);
    activatedTask.pause();
  };

  function Task(arg, startNow) { // 1st arg is string for new obj, obj for loaded obj; 2nd arg is bool
    this.tags = [];
    if(typeof arg === 'string') { // create new task with arg being name
      this.name = arg; // arg coming from text input box
      this.cumulativeTime = 0; // time lapsed prior to a pause, integer
      this.initTime = new Date();
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
      this.initTime = null;
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

    this.adjustTime = function(x) {
      if(typeof x === 'string') x=parseInt(x);
      this.cumulativeTime += x;
      if (this.cumulativeTime < 0) {
        this.cumulativeTime = 0;
      }
      this.setLapsedTime();
    };

    this.setLapsedTime = function() {
      var temp = this.cumulativeTime + (this.initTime ? (new Date().getTime() - this.initTime.getTime()) : 0);
      this.lapsedTimeString = $scope.timeString(temp);
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
        if (x===tag) isRepeat = true;
      });
      if(!isRepeat && tag !== '') {
        this.tags.push(tag);
        return true;
      }
      else return false;
    };
    this.removeTag = function(tag) {
      var tagToRemove = null;
      this.tags.forEach(function(x, index) {
        if (x===tag) tagToRemove = index;
      });
      if(tagToRemove !== null) {
        this.tags.splice(tagToRemove, 1);
        return true;
      }
      else {
        return false;
      }
    };
    this.save = function() {
      var now = new Date();
      this.cumulativeTime += now.getTime() - this.initTime.getTime();
      this.initTime = now;
      $scope.updateStorage();
    };
  };

}]);
