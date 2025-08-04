var projectSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

var genreNamedRangeName = "ProjectGenres";
var emptyRichText = SpreadsheetApp.newRichTextValue().setText("").build();
var nearDateDaysAhead = 7;
var projectPrepDaysNeeded = 45;