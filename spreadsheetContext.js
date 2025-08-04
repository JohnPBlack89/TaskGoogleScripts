/***
 * THIS IS NOT USED IN THIS PROJECTS
class spreadsheetContext {
  constructor() {
    this.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }

  // Orders all sheets in this spreadsheet ALPHABETICALLY
  sortSheets () {
    var sheetNameArray = [];
    var sheets = this.Spreadsheet.getSheets();
    
    for (var i = 0; i < sheets.length; i++) {
      sheetNameArray.push(sheets[i].getName());
    }
    
    sheetNameArray.sort();
      
    for( var j = 0; j < sheets.length; j++ ) {
      this.Spreadsheet.setActiveSheet(this.Spreadsheet.getSheetByName(sheetNameArray[j]));
      this.Spreadsheet.moveActiveSheet(j + 1);
    }
  }
}
*/