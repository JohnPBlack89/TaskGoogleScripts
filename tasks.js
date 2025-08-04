var projectTasks = new tasksContext('Tasks', 2);

function organizeTasks() {
  projectTasks.sortTasks();
  projectTasks.highlightDates();
}

function tasksEditTrigger() {
  if(projectSpreadsheet.getActiveSheet().getName() == projectTasks.SheetName)
    organizeTasks();
}