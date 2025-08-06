// import "./sheetContext.js";
// import "./tasksContext.js";
// import "./utilities.js";
// import "./namedRangeHyperlinks.js";
// import "./longTerm.js";
// import "./holidayPrep.js";

var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var toDoBoard = new tasksContext("Tasks", 2);
var longTerm = new tasksContext("Long-Term", 1);

// DueDateColors
var pastDateBackgroundColor1 = "#990000";
var pastDateBackgroundColor2 = "#660000";
var todayBackgroundColor1 = "#bf9000";
var todayBackgroundColor2 = "#7f6000";
var nearDateBackgroundColor1 = "#38761d";
var nearDateBackgroundColor2 = "#274e13";

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
  var copyLongTerm = new tasksContext("Copy of Tasks", 2);
  copyLongTerm.setGenreHyperlinks();
}
