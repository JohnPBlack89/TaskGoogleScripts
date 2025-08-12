var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
// var longTerm = new ToDoList("Long-Term", projectSpreadsheet, 1);
var toDoBoard = new ToDoList("Tasks", projectSpreadsheet, 2);

var warningDateDaysAhead = 7;
var daysToImportTask = 45;

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function onEdit(e) {
  // To-Do Board edits
	if (projectSpreadsheet.getActiveSheet().getName() == toDoBoard.sheet.getName()) {
		toDoBoard.organize(e);
    toDoBoard.genreSetHyperlinks();
  }
  
  // Long term edits
  if (projectSpreadsheet.getActiveSheet().getName() == longTerm.sheet.getName())
		longTerm.genreSetHyperlinks();
}

function midnightRun() {
  importLongTerm();
	toDoBoard.organize()
}

function importLongTerm() {
}

function test() {
  // toDoBoard.organize();
  var c = toDoBoard.getLastColumn();
  debugger;
}

/***
 * To Do
 * - Push the most recent to the least recent in importToDoListRow()
 * - Fix Magic Numbers in importToDoListRow()
 * - Import Google Doc
 * - Cascade Imports (Might need isTask)
 * - Holiday Prep
 */