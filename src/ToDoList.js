var taskSheetNames = ["Tasks", "To-Do"];
var columns = ["name", "project", "genre", "due", "done", "notes", "id", "updated"]

class ToDoList extends sheetContext {
	constructor(sheetName, titleRow) {
		super(sheetName, titleRow);

		columns.forEach(base => {
      this.createLazyColumnProperty(base);
    });

    this.pastDateBackgroundColor1 = "#990000";
    this.pastDateBackgroundColor2 = "#660000";
    this.todayBackgroundColor1 = "#bf9000";
    this.todayBackgroundColor2 = "#7f6000";
    this.nearDateBackgroundColor1 = "#38761d";
    this.nearDateBackgroundColor2 = "#274e13";
    this.finishedBackgroundColor = "#434343";
	}

  createLazyColumnProperty(baseName) {
    const numberGetterName = `${baseName}ColumnNumber`;
    const cacheKey = `${baseName}CacheKey`;
    const columnName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`;
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

	importSpreadsheet(spreadsheet) {
		if (Object.prototype.toString.call(spreadsheet) === "[object Spreadsheet]")
			throw new Error(
				"Must pass a Spreadsheet object to function importSpreadsheetToTask"
			);

		const existingNames = spreadsheet
			.getSheets()
			.map((sheet) => sheet.getName());
		const taskSheetName = taskSheetNames.filter((name) =>
			existingNames.includes(name)
		);

		if (taskSheetName != null) {
			var taskSheet = new tasksContext(taskSheetName[0], 1, spreadsheet);
			this.importSheet(taskSheet);
		}
	}

	importSheet(sheet) {
		if (typeof sheet == "string") sheet = new tasksContext(sheet, 1);

		if (!(sheet instanceof tasksContext))
			throw new Error(
				"Must pass either a string or tasksContext object to function importSheet(sheet)"
			);

		for (var i = sheet.titleRow + 1; i < sheet.lastRow; i++) {
			var dueDate = sheet.getValue(sheet.dueDateColumnName, i);
			var today = new Date();
			var checkboxField = sheet.checkboxColumnName;
			if (
				checkboxField != false &&
				dueDate - today > sheet.projectPrepDaysNeeded
			)
				sheet.importRow(sheet, i);
		}
	}

	importGoogleDoc(url) {
		var table = getGoogleDocTable(url, tableNumberInTab, tableTabName);
	}

	importRow(sheet, externalSheetRowNumber) {
		if (!(sheet instanceof sheetContext))
			throw new Error(
				"Must pass a sheetContext object to function importRow(sheet)"
			);

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

	importColumn(sheetContext, externalRowNumber, internalRowNumber, columnName) {
		var internalColumnNumber = this.getColumnNumber(this[columnName]);
		var externalColumnNumber = sheetContext.getColumnNumber(
			sheetContext[columnName]
		);
		if (internalColumnNumber == null || externalColumnNumber == null) return;
		migrateCell(
			sheetContext,
			externalColumnNumber,
			externalRowNumber,
			this.sheet,
			internalColumnNumber,
			internalRowNumber
		);
	}

  organize() {
    this.dueSort();
	  this.highlightDates();
  }

	/***
	 * Highlights the due date column cells
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
					this["pastDateBackgroundColor" + addition.toString()]
				); // Red for past dates
			} else if (daysAhead === 0) {
				cell.setBackground(this["todayBackgroundColor" + addition.toString()]); // Yellow for today
			} else if (daysAhead <= warningDateDaysAhead) {
				cell.setBackground(
					this["nearDateBackgroundColor" + addition.toString()]
				); // Green for dates within a week
			} else {
				cell.setBackground(null); // Clear for future dates
			}
		}
	}
}
