var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var toDoBoard = new tasksContext("Tasks", 2);

var genreNamedRangeName = "ProjectGenres";
var warningDateDaysAhead = 7;
var daysToImportTask = 45;

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function organizeTasks() {
	toDoBoard.sortTasks();
	toDoBoard.highlightDates();
}

function onEditToDoBoard() {
	if (projectSpreadsheet.getActiveSheet().getName() == projectTasks.SheetName)
		organizeTasks();
}

function onEditTask() {}

function midnightRun() {
	organizeTasks();
}
