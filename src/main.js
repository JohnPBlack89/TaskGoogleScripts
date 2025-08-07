var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var toDoBoard = new ToDoList("Tasks", 2);
var longTerm = new ToDoList("Long-Term", 1);

var warningDateDaysAhead = 7;
var daysToImportTask = 45;

var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();

function onEdit() {
	if (projectSpreadsheet.getActiveSheet().getName() == toDoBoard.sheet.getName())
		toDoBoard.organize();
  
  if (projectSpreadsheet.getActiveSheet().getName() == longTerm.sheet.getName())
		longTerm.genreSetHyperlinks();
}

function midnightRun() {
	toDoBoard.organize()
}

/***
 * To Do
 * - Modify Column Initialization to include custom sheets with custom columns (aka long-term)
 * - GUID
 * - Export/Import
 * - NDW
 */