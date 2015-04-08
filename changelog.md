# Scheduler <small>Changelog</small>

### todo:
* add: buttons to add/subtract time from elapsed time
* add: readout for tags
* change: tags to object, with property for total lapsed time and method for recalc

### finished:

version 0.9
* added: tag system
* changed: streamlined UI interface

version 0.8.2
* added: font-awesome css, bootstrap & jquery js dependencies
* changed: navbar UI streamlined

version 0.8.1
* fixed: app will load saved data from older versions > 0.6

version 0.8
* have new tasks placed at beginning of arrays
* added: $scope.startToDoTask() to move tasks from taskStore.toDoTasks[] to taskStore.activeTasks[]

version 0.7
* add: bootstrap columns for active and 'to do' tasks
* refactor taskStore as an object, with separate arrays for activeTasks & toDoTasks
* separate view for 'to do' tasks

version 0.6
* add: active tasks now auto-save every x (currently 20) seconds
* change: no longer discard saved tasks with cumulativeTime==0 as these might be 'To Do' tasks

version 0.5
* change: there are now separate buttons: 1) 'Start New Task'; & 2) 'To Do Later'
* fix: discarding of saved tasks with cumulativeTime==0 didn't work because constructors must return objects, now fixed
* migrate to bootstrap.css

version 0.4.1
* caveat: if a task has never been stopped, it will be discarded

version 0.4
* copy taskStore to local storage
* app will auto-save the entire task store to local storage on any stop or delete operation

version 0.3
* add ability to pause and resume task
* add ability to edit task name

version 0.2
* Instead of assigning task as an object literal, version 0.2 will define a task object constructor, instances of which will then be .push()'d into an array $scope.taskStore.

version 0.1
* first working version
