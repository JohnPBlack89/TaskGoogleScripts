var taskSheetNames = ["Tasks", "To-Do"];

class ToDoList extends SheetContext {
	constructor(sheetName, spreadsheet, titleRow) {
		super(sheetName, spreadsheet, titleRow);

		for(var header in this.headerMap)
      this.createColumnProperty(header);

    this.pastDateBackgroundColor1 = "#990000";
    this.pastDateBackgroundColor2 = "#660000";
    this.todayBackgroundColor1 = "#bf9000";
    this.todayBackgroundColor2 = "#7f6000";
    this.nearDateBackgroundColor1 = "#38761d";
    this.nearDateBackgroundColor2 = "#274e13";
    this.finishedBackgroundColor = "#434343";
	}

  /** Creates a number getter, sort function, and a function to add all hyperlinks for a passed column
   */
  createColumnProperty(columnName) {
    const baseName = `${columnName.charAt(0).toLowerCase() + columnName.slice(1)}`;
    const numberGetterName = `${baseName}ColumnNumber`;
    const numberCacheKey = `${baseName}NumberCacheKey`;
    const sortFunctionName = `${baseName}Sort`;
    const hyperlinkFunctionName = `${baseName}SetHyperlinks`;
    const namedRangeName = `Project${columnName}s`;
    const valueRangeGetterName = `${baseName}Values`;
    const valueRangeCacheKey = `${baseName}ValuesCacheKey`

    Object.defineProperty(this, numberGetterName, {
      get: function () {
        if (this[numberCacheKey] != null) return this[numberCacheKey];

        this[numberCacheKey] = this.getColumnNumber(columnName);
        return this[numberCacheKey];
      },
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(this, valueRangeGetterName, {
      get: function () {
        if (this[valueRangeCacheKey] != null) return this[valueRangeCacheKey];

        this[valueRangeCacheKey] = this.getColumnValues(columnName);
        return this[valueRangeCacheKey];
      },
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(this, sortFunctionName , { value: function() {
		    this.tasksTable.sort(this[numberGetterName]);
	    }, configurable: true, enumerable: true,
    })

    Object.defineProperty(this, hyperlinkFunctionName , { value: function() {
      var cell;
      for(let i = this.titleRow + 1; i <= this.lastRow; i++) {
        var gcn = this.genreColumnNumber;
        cell = this.sheet.getRange(i, this.genreColumnNumber);
        setCellHyperlinksFromNamedRange(cell, namedRangeName);
      }
      }, configurable: true, enumerable: true,
    })
  }

  getTasksTable() {
    if (this.tasksTableCache != null) return this.tasksTableCache;

    this.tasksTableCache = this.sheet.getRange(
        this.titleRow + 1,
        1,
        this.lastRow - this.titleRow + 1,
        this.lastColumn
    );

    return this.tasksTableCache;
  }

  get tasksTable() {
    return this.getTasksTable();
  }

  /** Organizes this list by its Due column
   */
  organize() {
    if(this.headerMap["Due"] == undefined) {
      console.log(`Unable to organize ${this.sheet.getName()} as it doesn't have a "Due" column`)
      return;
    }

    this.dueSort();
	  this.highlightDates();
  }

	/** Highlights the due date column cells
	 * Based on TODAY'S DATE AND this.nearDateDaysAhead
	 */
	highlightDates() {
		var totalRows = this.lastRow - this.titleRow;
		var dueDateColumnRange = this.sheet.getRange(
			this.titleRow + 1,
			this.dueColumnNumber,
			totalRows,
			1
		);
		var values = dueDateColumnRange.getValues();
		var today = new Date();
		var todayDate = getDateAsNumber(today);

		for (var i = 0; i < totalRows; i++) {
			var t = values[i][0];
			var cellDate = getDateAsNumber(values[i][0]);
			if (cellDate == null || cellDate == 0) {
				this.sheet
					.getRange(i + 1 + this.titleRow, 1, 1, this.lastColumn)
					.setBackground("#434343");
        /************* This is where to put the move row function to move finished tasks to the finished Tasks sheet */
				continue;
			}

			var daysAhead = cellDate - todayDate;
			var cell = dueDateColumnRange.getCell(i + 1, 1);

			var addition = (i % 2) + 1;

			if (daysAhead < 0) {
				cell.setBackground(
					this["pastDateBackgroundColor" + addition.toString()]);
			} else if (daysAhead === 0) {
				cell.setBackground(this["todayBackgroundColor" + addition.toString()]);
			} else if (daysAhead <= warningDateDaysAhead) {
				cell.setBackground(
					this["nearDateBackgroundColor" + addition.toString()]);
			} else {
				cell.setBackground(null); // Clear for future dates
			}
		}
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
    var importRowId = importToDoList.idValues[importListRowNumber - 2][0];
    if(importRowId == null || importRowId == "") {
        importRowId = createGuid();
        importToDoList.setValue(importToDoList.idColumnNumber,importListRowNumber,importRowId);
        thisRowNumber = this.lastRow + 1;
    } else if(this.idValues.flat().includes(importRowId)) {
      thisRowNumber = this.idValues.flat().indexOf(importRowId) + 3;
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
