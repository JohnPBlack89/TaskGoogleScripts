var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var longTerm = new ToDoList("Long-Term", 1);
var toDoBoard = new ToDoList("Tasks", 2);

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
  var toDoBoard = new ToDoList("Tasks", 2);
	toDoBoard.organize()
}

function importLongTerm() {
 var genres = longTerm.sheet.getRangeByName(genreNamedRangeName);

  for (var i = 1; i <= numRows; i++) {
    var cell = genres.getCell(i, j);
    var hyperlinkUrl = getHyperlinkFromCell(longTerm.SheetName, cell.getRow(), cell.getColumn());
    importFromUrl(hyperlinkUrl);
  }
}

/***
 * To Do
 * - GUID
 * - Export/Import
 * - NDW
 */