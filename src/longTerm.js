function importLongTerm() {
 var genres = longTerm.sheet.getRangeByName(genreNamedRangeName);

  for (var i = 1; i <= numRows; i++) {
    var cell = genres.getCell(i, j);
    var hyperlinkUrl = getHyperlinkFromCell(longTerm.SheetName, cell.getRow(), cell.getColumn());
    importFromUrl(hyperlinkUrl);
  }
}

function importFromUrl(url) {
  if(url == null)
        return;

  // Check if cell is a link to another sheet
  if(isInternalSheetReference(url)) {
    var gid = url.slice(5)
    var name = getSheetNameByGid(longTerm.Spreadsheet,gid);
    longTerm.importSheet(name);
  }

  if(isGoogleSheetReference(url)) {
    var importedSpreadsheet = getSpreadsheetFromUrl(url);
    longTerm.importSpreadsheet(importedSpreadsheet  )
  }

  if(isGoogleDocReference(url))
   longTerm.importGoogleDoc(url);
}
