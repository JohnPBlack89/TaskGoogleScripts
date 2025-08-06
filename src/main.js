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

globalThis.test = test;
globalThis.organizeTasks = organizeTasks;
globalThis.onEditTask = onEditTask;
globalThis.onEditToDoBoard = onEditToDoBoard;
globalThis.midnightRun = midnightRun;
