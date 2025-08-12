var TableContext = class TableContext {
	constructor(sheetName, spreadsheet = SpreadsheetApp.getActiveSpreadsheet(), titleRowNumber = 1) {
		this.SheetName = sheetName;
		this.titleRow = titleRowNumber;
		this.Spreadsheet = spreadsheet;

    
		for(var header in this.headerMap)
      this.createColumnProperty(header);
	}

  /** Creates a number getter, sort function, and a function to add all hyperlinks for a passed column
   */
  createColumnProperty(columnName) {
    const baseName = `${columnName.charAt(0).toLowerCase() + columnName.slice(1)}`;
    const numberGetterName = `${baseName}ColumnNumber`;
    const numberCacheKey = `${baseName}NumberCacheKey`;
    const sortFunctionName = `${baseName}Sort`;
    const hyperlinkFunctionName = `${baseName}SetHyperlinks`;
    const namedRangeName = `${columnName}NamedRange`;
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
		    this.sheetRange.sort(this[numberGetterName]);
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

  getHeaderMap() {
    if (this.headerCache != null) return this.headerCache;

    this.headerCache = getHeaderMap(this.sheet, this.titleRow, this.lastColumn);
    return this.headerCache;
  }

  get headerMap() {
    return this.getHeaderMap();
  }


  getSheetRange() {
    if (this.sheetRangeCache != null) return this.sheetRangeCache;

    this.sheetRangeCache = this.sheet.getRange(
        this.titleRow + 1,
        1,
        this.lastRow - this.titleRow + 1,
        this.lastColumn
    );

    return this.sheetRangeCache;
  }

  get sheetRange() {
    return this.getSheetRange();
  }

	/**
	 * Returns the GoogleAppsScript.Spreadsheet.Sheet object that this TableContext represents
	 * if none is present, it will retrieve, set, and return the property
	 *
	 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} The Sheet object if found, otherwise null
	 */
	getSheet() {
		if (this.Sheet != null) return this.Sheet;

    if(this.Spreadsheet == null)
      throw new Error("No Spreadsheet found");

		this.Sheet = this.Spreadsheet.getSheetByName(this.SheetName);
		return this.Sheet;
	}

	get sheet() {
		return this.getSheet();
	}

	/**
	 * Returns the last row property
	 * if none is present, it will retrieve, set, and return the property
	 *
	 * @returns {number|null} The last row if found, otherwise null
	 */
	getLastRow() {
		if (this.LRow != null) return this.LRow;

		if (this.Sheet == null) this.getSheet();

		this.LRow = this.Sheet.getLastRow();
		return this.LRow;
	}

	get lastRow() {
		return this.getLastRow();
	}

	/**
	 * Returns the last column property
	 * if none is present, it will retrieve, set, and return the property
	 *
	 * @returns {number|null} The last column if found, otherwise null
	 */
	getLastColumn() {
		if (this.LColumn != null) return this.LColumn;

		this.LColumn = this.sheet.getLastColumn();
		return this.LColumn;
	}

	get lastColumn() {
		return this.getLastColumn();
	}

	/**
	 * Returns a column number based on a title passed to the function
	 *
	 * @param {string} columnTitle The title of a column
	 * @returns {number} The number the column with that title
	 */
	getColumnNumber(columnTitle) {
		if (this.headerCache[columnTitle] != null) return this.headerCache[columnTitle];

		var titles = this.sheet
			.getRange(this.titleRow, 1, 1, this.lastColumn)
			.getValues();

		for (let i = 0; i < titles[0].length; i++) {
			if (titles[0][i] === columnTitle) {
				this.headerCache[columnTitle] = ++i;
				return this.headerCache[columnTitle]
			}
		}

		return null;
	}

  /**
   * Return values for the column
   */
  getColumnValues(columnTitle){
    return this.sheet
			.getRange(this.titleRow + 1, this.getColumnNumber(columnTitle), this.lastRow - this.titleRow, 1)
			.getValues();
  }

	/**
	 * Returns a row number based on a value passed to the function
	 *
	 * @params {string/number} column The title OR number of a column
	 * @param {string}
	 * @returns {number} The number the column with that title
	 */
	getRowNumber(column, cellValue) {
		if (typeof column == "string") column = this.getColumnNumber(column);

		var rowValues = this.sheet.getRange(1, column, this.lastRow, 1).getValues();

		for (let i = this.titleRow; i < rowValues.length; i++) {
			if (rowValues[i][0] == cellValue) {
				return i + 1;
			}
		}

		return null;
	}

	/***
	 * Hides or Unhides all rows in a table
	 *
	 * if the checkbox is CHECKED the row is SHOWN
	 * if UNCHECK the row is HIDDEN
	 */
	showHideRows(checkboxColumnName) {
		var checkboxColumnNumber = this.getColumnNumber(checkboxColumnName);

		for (var i = this.titleRow + 1; i <= this.lastRow; i++) {
			var checkboxCell = this.sheet.getRange(i, checkboxColumnNumber);

			// Check if the checkbox is checked
			if (checkboxCell.isChecked()) this.sheet.showRows(i);
			else this.sheet.hideRows(i);
		}
	}

	/***
	 * Hides or Unhides all columns in a table
	 *
	 * if the checkbox is CHECKED the column is SHOWN
	 * if UNCHECK the column is HIDDEN
	 */
	showHideColumns(checkboxRow) {
		if (typeof column == "string")
			checkboxRow = this.getRowNumber(1, checkboxRowName);

		for (var i = 1; i <= this.lastColumn; i++) {
			var checkboxCell = this.sheet.getRange(checkboxRow, i);

			// Check if the checkbox is checked
			if (checkboxCell.isChecked()) this.sheet.hideColumns(i);
			else this.sheet.showColumns(i);
		}
	}

	// Gets a value from a cell
	getValue(column, rowNumber) {
		if (typeof column == "string") column = this.getColumnNumber(column);

		if (column == null || rowNumber == null) return null;

		var range = this.sheet.getRange(rowNumber, column).getValue();
		return range;
	}

	// Sets a cell value
	setValue(column, rowNumber, value) {
		if (typeof column == "string") column = this.getColumnNumber(column);

		this.sheet.getRange(rowNumber, column).setValue(value);
	}
}
