# Scheduler <small>Changelog</small>

version 0.5
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
