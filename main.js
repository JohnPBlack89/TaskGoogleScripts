var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var toDoBoard = new tasksContext("Tasks", 2);
var longTerm = new tasksContext("Long-Term", 1);

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

function test() {
	var cell = projectSpreadsheet.getRange("B2");
	setCellHyperlinksFromNamedRange(cell, "ProjectGenres");
}
(function (global) {
	global.test = test;
	global.organizeTasks = organizeTasks;
	global.onEditTask = onEditTask;
	global.onEditToDoBoard = onEditToDoBoard;
	global.midnightRun = midnightRun;
})(typeof globalThis !== "undefined" ? globalThis : this);
