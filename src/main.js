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
  var toDoBoard = new ToDoList("Tasks", 2);
	toDoBoard.organize()
}

function importLongTerm() {
  // Import from Long Term Projects list

  // Import from Project Genres Task Boards
  /* var genres = longTerm.sheet.getRangeByName(genreNamedRangeName);
  for (var i = 1; i <= genres.length(); i++) {
    var cell = genres.getCell(i, j);
    var hyperlinkUrl = getHyperlinkFromCell(longTerm.SheetName, cell.getRow(), cell.getColumn());
    toDoBoard.importFromUrl(hyperlinkUrl);
  } */
}

/***
 * To Do
 * - GUID
 * - Export/Import
 * - NDW
 * - Holiday Prep
 */