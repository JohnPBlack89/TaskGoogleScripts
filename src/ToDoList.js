var taskSheetNames = ["Tasks", "To-Do"];

class ToDoList extends TableContext {
	constructor(sheetName, spreadsheet, titleRow) {
		super(sheetName, spreadsheet, titleRow);

    this.pastDateBackgroundColor1 = "#990000";
    this.pastDateBackgroundColor2 = "#660000";
    this.todayBackgroundColor1 = "#bf9000";
    this.todayBackgroundColor2 = "#7f6000";
    this.nearDateBackgroundColor1 = "#38761d";
    this.nearDateBackgroundColor2 = "#274e13";
    this.finishedBackgroundColor = "#434343";
    this.ndwBackgroundColor1 = "#990000";
    this.ndwBackgroundColor2 = "#660000";
	}


  /** Organizes this list by its Due column
   */
  organize(e) {
    if(this.headerMap["Due"] == undefined) {
      console.log(`Unable to organize ${this.sheet.getName()} as it doesn't have a "Due" column`)
      return;
    }

    // this.sheet.getRange(this.titleRow, 1, this.lastRow - 1, this.lastColumn).setBackground(null);
    this.updatedRow(e);
    this.dueSort();
    this.highlightNDW();
	  this.highlightDates();
  }

	/** Highlights the due date column cells
	 * Based on TODAY'S DATE AND this.nearDateDaysAhead
	 */
	highlightDates() {
		var totalRows = this.lastRow - this.titleRow;
		var today = new Date();
		var todayDate = getDateAsNumber(today);

		for (var i = 0; i < totalRows; i++) {
			var cellDate = getDateAsNumber(this.dueValues[i][0]);
			if (cellDate == null || cellDate == 0) {
				this.sheet
					.getRange(i + 1 + this.titleRow, 1, 1, this.lastColumn)
					.setBackground("#434343");
        /************* This is where to put the move row function to move finished tasks to the finished Tasks sheet */
				continue;
			}

			var daysAhead = cellDate - todayDate;
			var cell = this.sheetRange.getCell(i + 1, this.dueColumnNumber);

			var addition = (i % 2) + 1;

			if (daysAhead < 0) {
				cell.setBackground(
					this["pastDateBackgroundColor" + addition.toString()]);
			} else if (daysAhead === 0) {
				cell.setBackground(this["todayBackgroundColor" + addition.toString()]);
			} else if (daysAhead <= warningDateDaysAhead) {
				cell.setBackground(
					this["nearDateBackgroundColor" + addition.toString()]);
			}
		}
	}

  /**
   * Highlight NDW Rows
   */
  highlightNDW() {
		for (var i = 0; i < this.lastRow - this.titleRow; i++) {
      var row = this.sheet.getRange(i + this.titleRow + 1,1,1, this.lastColumn);
			if (!this.nDWValues[i][0]) {
        row.setBackground(null);
        continue;
      }

			var addition = (i % 2) + 1;
      row.setBackground(this["ndwBackgroundColor" + addition.toString()]);
		}
  }

  /**
   * Update last edited time
   */
  updatedRow(e) {
    this.sheet.getRange(e.range.getRow(),this.updatedColumnNumber).setValue(new Date());
  }


  /*** Imports ***/
  importFromUrl(url, columnMap = {}) {
    if(url == null)
          return;

    // Check if cell is a link to another sheet
    if(isInternalSheetReference(url)) {
      var gid = url.slice(5)
      var name = getSheetNameByGid(this.Spreadsheet,gid);
      this.importToDoList(new ToDoList(name, this.Spreadsheet), columnMap)
    }

    if(isGoogleSheetReference(url)) {
      this.importSpreadsheet(getSpreadsheetFromUrl(url), columnMap)
    }

    if(isGoogleDocReference(url))
      this.importGoogleDoc(url, columnMap);
  }

	importSpreadsheet(spreadsheet, columnMap = {}) {
		if (Object.prototype.toString.call(spreadsheet) === "[object Spreadsheet]")
			throw new Error(
				"Must pass a Spreadsheet object to function importSpreadsheetToTask"
			);

		const spreadsheetSheetNames = spreadsheet
			.getSheets()
			.map((sheet) => sheet.getName());

		const taskSheetName = taskSheetNames.filter((name) =>
			spreadsheetSheetNames.includes(name)
		);

		if (taskSheetName == null) return;
		
    this.importToDoList(new ToDoList(taskSheetName[0], spreadsheet), columnMap);
	}

	importToDoList(toDoList, columnMap = {}) {
		if (typeof ToDoList == "string") toDoList = new ToDoList(toDoList, 1);

		if (!(toDoList instanceof ToDoList))
			throw new Error(
				"Must pass either a string or ToDoList object to function importSheet(toDoList)"
			);
		
    for (var i = toDoList.titleRow + 1; i <= toDoList.lastRow; i++)
				this.importToDoListRow(toDoList, i, columnMap);
	}

	importToDoListRow(importToDoList, importListRowNumber, columnMap = {}) {
    // Ensure a ToDoList was passed
		if (!(importToDoList instanceof ToDoList))
			throw new Error(
				"Must pass a ToDoList object to function importToDoListRow(importToDoList, importListRowNumber, columnMap = {})" 
			);

    var thisRowNumber;

    // Check if sheet has already imported a task with the same guid
    var importRowId = importToDoList.idValues[importListRowNumber - 2][0]; // Where does -2 come from?????
    if(importRowId == null || importRowId == "") {
        importRowId = createGuid();
        importToDoList.setValue(importToDoList.idColumnNumber,importListRowNumber,importRowId);
        thisRowNumber = this.lastRow + 1;
    } else if(this.idValues.flat().includes(importRowId)) {
      thisRowNumber = this.idValues.flat().indexOf(importRowId) + 3; // Where does +3 come from?????
    } else {
      thisRowNumber = this.lastRow + 1;
    }

    // Then check if the imported date is the same 
    var thisUpdatedDate = this.getValue(this.updatedColumnNumber,thisRowNumber);
    var importUpdatedDate = importToDoList.getValue(importToDoList.updatedColumnNumber,importListRowNumber);
    if(thisUpdatedDate != "" && thisUpdatedDate == importUpdatedDate) return;
    if(importUpdatedDate == "" || importUpdatedDate == null)
      importToDoList.setValue(importToDoList.updatedColumnNumber,importListRowNumber, new Date());
    
    // Check if due date is within import date;
    var dueDate = importToDoList.getValue(importToDoList.dueDateColumnName, i);
    if (
      dueDate - new Date() > daysToImportTask
    ) return;

    // Create and fill row
    var row = [];
    var headerMapCount = Object.keys(this.headerMap).length;

    for(var i = 1; i <= headerMapCount; i++) {
      var thisTitle = getHeaderKeyByValue(this.headerMap,i);

      if(columnMap.hasOwnProperty(thisTitle))
        thisTitle = columnMap[thisTitle];

      var importValue = importToDoList.getValue(thisTitle,importListRowNumber);
      row.push(importValue);
    }

    this.sheet.getRange(thisRowNumber,1,1,row.length).setValues([row]);
	}

  importGoogleDoc(url, columnMap = {}) {
    console.log("import Google Doc not implemented yet");
		// var table = getGoogleDocTable(url, tableNumberInTab, tableTabName);
	}
}
