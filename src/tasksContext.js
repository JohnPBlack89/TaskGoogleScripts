var taskSheetNames = ["Tasks", "To-Do"];
var columns = ["name", "project", "genre", "due", "done", "notes"]

class tasksContext extends sheetContext {
	constructor(sheetName, titleRow) {
		super(sheetName, titleRow);

		columns.forEach(base => {
      this.createLazyColumn(base);
    });
	}

  createLazyColumn(baseName) {
    const getterName = `${baseName}ColumnNumber`;
    const cacheKey = `${baseName}CacheKey`;
    const columnName = `${baseName}ColumnName`;

    Object.defineProperty(this, getterName, {
      get: function () {
        if (this[cacheKey] != null) return this[cacheKey];

        this[cacheKey] = this.getColumnNumber(this[columnName]);
        return this[cacheKey];
      },
      configurable: true,
      enumerable: true,
    });
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

	/***
	 * Organizes THIS task sheet by its due date column
	 */
	sortTasks() {
		var tasksTable = this.sheet.getRange(
			this.titleRow + 1,
			1,
			this.lastRow - this.titleRow + 1,
			this.lastColumn
		);
		var dueDateColumn = this.getColumnNumber(this.dueDateColumnName);
		tasksTable.sort(dueDateColumn);
	}

	getGenreNamedRangeHyperLinks() {
		var totalRows = this.lastRow - this.titleRow;
		var genreColumnNumber = this.getColumnNumber(this.genreColumnName);
		for (var i = 1; i < totalRows; i++) {
			getNamedRangeHyperlinksForCell(
				this.Sheet.getName(),
				i,
				genreColumnNumber,
				genreNamedRangeName
			);
		}
	}

	/***
	 * Highlights the due date column cells
	 * Based on TODAY'S DATE AND this.nearDateDaysAhead
	 */
	highlightDates() {
		var dueDateColumn = this.getColumnNumber(this.dueDateColumnName);
		var totalRows = this.lastRow - this.titleRow;
		var range = this.sheet.getRange(
			this.titleRow + 1,
			dueDateColumn,
			totalRows,
			1
		);
		var values = range.getValues();
		var today = new Date();
		var todayDate = getDateAsNumber(today);

		for (var i = 0; i < totalRows; i++) {
			var t = values[i][0];
			var cellDate = getDateAsNumber(values[i][0]);
			if (cellDate == null || cellDate == 0) {
				this.sheet
					.getRange(i + 1 + this.titleRow, 1, 1, this.lastColumn)
					.setBackground("#434343");
				continue;
			}

			var diffDays = cellDate - todayDate;
			var cell = range.getCell(i + 1, 1);

			var addition = (i % 2) + 1;

			if (diffDays < 0) {
				cell.setBackground(
					this["pastDateBackgroundColor" + addition.toString()]
				); // Red for past dates
			} else if (diffDays === 0) {
				cell.setBackground(this["todayBackgroundColor" + addition.toString()]); // Yellow for today
			} else if (diffDays <= nearDateDaysAhead) {
				cell.setBackground(
					this["nearDateBackgroundColor" + addition.toString()]
				); // Green for dates within a week
			} else {
				cell.setBackground(null); // Clear for future dates
			}
		}
	}

  setGenreHyperlinks() {
    var cell;
    for(let i = this.titleRow + 1; i <= this.lastRow; i++) {
      var gcn = this.genreColumnNumber();
      cell = this.sheet.getRange(i, this.genreColumnNumber);
      setCellHyperlinksFromNamedRange(cell, "ProjectGenres");
    }
  }
}
