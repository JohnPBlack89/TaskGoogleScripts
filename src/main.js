var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var longTerm = new ToDoList("Long-Term", projectSpreadsheet, 1);
var toDoBoard = new ToDoList("Tasks", projectSpreadsheet, 2);

var warningDateDaysAhead = 7;
var daysToImportTask = 45;

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function onEdit() {
  // To-Do Board edits
	if (projectSpreadsheet.getActiveSheet().getName() == toDoBoard.sheet.getName())
		toDoBoard.organize();
  
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
  var taskToDo = new ToDoList("Copy of Tasks", projectSpreadsheet, 2);
  const trSpreadsheet = SpreadsheetApp.openById("1KItq6qKszyOR0MUW0LqSVZ4yuDyf7XDHYBPZCtuAaEk");
  taskToDo.importSpreadsheet(trSpreadsheet);
}

/***
 * To Do
 * - Automatically update Updated Time
 * - Push the most recent to the least recent in importRows()
 * - Fix Magic Number in importRows()
 * - Import Google Doc
 * - NDW
 * - Holiday Prep
 */