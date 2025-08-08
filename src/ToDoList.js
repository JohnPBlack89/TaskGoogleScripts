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
    const cacheKey = `${baseName}CacheKey`;
    const sortFunctionName = `${baseName}Sort`;
    const hyperlinkFunctionName = `${baseName}SetHyperlinks`;
    const namedRangeName = `Project${columnName}s`

    Object.defineProperty(this, numberGetterName, {
      get: function () {
        if (this[cacheKey] != null) return this[cacheKey];

        this[cacheKey] = this.getColumnNumber(columnName);
        return this[cacheKey];
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
  importFromUrl(url) {
    if(url == null)
          return;

    // Check if cell is a link to another sheet
    if(isInternalSheetReference(url)) {
      var gid = url.slice(5)
      var name = getSheetNameByGid(this.Spreadsheet,gid);
      this.importSheet(name);
    }

    if(isGoogleSheetReference(url)) {
      this.importSpreadsheet(getSpreadsheetFromUrl(url))
    }

    if(isGoogleDocReference(url))
      this.importGoogleDoc(url);
  }

	importSpreadsheet(spreadsheet) {
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
		
    this.importSheet(new ToDoList(taskSheetName[0], 1, spreadsheet));
	}

	importSheet(sheet) {
		if (typeof sheet == "string") sheet = new ToDoList(sheet, 1);

		if (!(sheet instanceof ToDoList))
			throw new Error(
				"Must pass either a string or ToDoList object to function importSheet(sheet)"
			);
		
    for (var i = sheet.titleRow + 1; i < sheet.lastRow; i++)
				sheet.importRow(sheet, i);
	}

	importGoogleDoc(url) {
    console.log("import Google Doc not implemented yet");
		// var table = getGoogleDocTable(url, tableNumberInTab, tableTabName);
	}

	importRow(sheet, externalSheetRowNumber) {
		if (!(sheet instanceof SheetContext))
			throw new Error(
				"Must pass a SheetContext object to function importRow(sheet)"
			);
    
    var dueDate = sheet.getValue(sheet.dueDateColumnName, i);
    var today = new Date();
    var checkboxField = sheet.checkboxColumnName;
    if (
      checkboxField != false &&
      dueDate - today > sheet.projectPrepDaysNeeded
    )

		var internalRowNumber = this.lastRow + 1;

		// Migrate Task Name
		this.importColumn(
			sheet,
			externalSheetRowNumber,
			internalRowNumber,
			this.nameColumnName
		);
		this.importColumn(
			sheet,
			externalSheetRowNumber,
			internalRowNumber,
			this.dueDateColumnName
		);
		this.importColumn(
			sheet,
			externalSheetRowNumber,
			internalRowNumber,
			this.projectColumnName
		);
		this.importColumn(
			sheet,
			externalSheetRowNumber,
			internalRowNumber,
			this.genreColumnName
		);
		this.importColumn(
			sheet,
			externalSheetRowNumber,
			internalRowNumber,
			this.notesColumnName
		);

		// Mark column as imported
		if (this.checkboxColumnName == null) return;

		var checkboxColumnNumber = this.getColumnNumber(this.checkboxColumnName);
		this.sheet
			.getRange(externalSheetRowNumber, checkboxColumnNumber)
			.setValue(true);
	}
}
