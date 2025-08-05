/**
 * Gets the URL of a hyperlink from a specified cell
 *
 * @param {string} sheetName The name of the sheet (e.g., "Sheet1").
 * @param {string} cellReference The A1 notation of the cell (e.g., "A1", "B5").
 * @returns {string|null} The URL of the hyperlink, or null if no hyperlink is found.
 */
function getHyperlinkFromCell(sheetName, columnNumber, rowNumber) {
	try {
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		const sheet = spreadsheet.getSheetByName(sheetName);

		if (!sheet) {
			console.error(`Error: Sheet '${sheetName}' not found.`);
			return null;
		}

		const range = sheet.getRange(rowNumber, columnNumber);
		const richTextValue = range.getRichTextValue();

		if (richTextValue) {
			// Get the URL from the first text segment (assuming the whole cell is one hyperlink)
			const url = richTextValue.getLinkUrl();
			if (url) {
				return url;
			}
		}

		console.log(`No hyperlink found in cell on sheet ${sheetName}.`);
		return null;
	} catch (e) {
		console.error(`An error occurred: ${e.message}`);
		return null;
	}
}

/** Generates a Task Id */
function createTaskGuid() {
	return Utilities.getUuid();
}

/**
 * Checks if a given URL is a reference to another sheet within the same document
 * An internal sheet reference typically contains the spreadsheet ID and a "#gid=" parameter.
 *
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL is an internal sheet reference, false otherwise.
 */
function isInternalSheetReference(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	return url.startsWith("#gid=");
}

/**
 * Checks if a given URL is a reference to any Google Sheet document
 *
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL is a Google Sheet reference, false otherwise.
 */
function isGoogleSheetReference(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	// Regular expression to match Google Sheets URLs (aka "https://docs.google.com/spreadsheets/d/)
	const googleSheetRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\//;

	try {
		return googleSheetRegex.test(url);
	} catch (e) {
		console.error(`Error checking Google Sheet reference: ${e.message}`);
		return false;
	}
}

/**
 * Checks if a given URL is a reference to any Google Doc document
 *
 * @param {string} url The URL to check.
 * @returns {boolean} True if the URL is a Google Doc reference, false otherwise.
 */
function isGoogleDocReference(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	const googleDocRegex = /^https:\/\/docs\.google\.com\/document\/d\//;

	try {
		return googleDocRegex.test(url);
	} catch (e) {
		console.error(`Error checking Google Doc reference: ${e.message}`);
		return false;
	}
}

/**
 * Retrieves a Sheet object based on its URL.
 * This function can open a spreadsheet and, if a GID is present in the URL,
 * it will also attempt to return the specific sheet within that spreadsheet.
 *
 * @param {string} sheetUrl The full URL of the Google Sheet or a specific sheet within it.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} The Sheet object if found, otherwise null.
 */
function getSheetFromUrl(sheetUrl) {
	if (!isGoogleSheetReference(sheetUrl)) {
		console.error(
			`Error: The provided URL '${sheetUrl}' is not a valid Google Sheet URL.`
		);
		return null;
	}

	try {
		// Extract spreadsheet ID from the URL
		const spreadsheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (!spreadsheetIdMatch || spreadsheetIdMatch.length < 2) {
			console.error(
				`Error: Could not extract spreadsheet ID from URL: ${sheetUrl}`
			);
			return null;
		}
		const spreadsheetId = spreadsheetIdMatch[1];

		// Open the spreadsheet
		const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
		if (!spreadsheet) {
			console.error(
				`Error: Could not open spreadsheet with ID: ${spreadsheetId}`
			);
			return null;
		}

		// Extract GID (sheet ID) from the URL if present
		const gidMatch = sheetUrl.match(/#gid=([0-9]+)/);
		if (gidMatch && gidMatch.length >= 2) {
			const gid = parseInt(gidMatch[1], 10);
			const sheet = spreadsheet.getSheetById(gid);
			if (!sheet) {
				console.warn(
					`Warning: Sheet with GID '${gid}' not found in spreadsheet '${spreadsheet.getName()}'. Returning the first sheet.`
				);
				return spreadsheet.getSheets()[0]; // Fallback to the first sheet
			}
			return sheet;
		} else {
			// If no GID is specified, return the first sheet in the spreadsheet
			return spreadsheet.getSheets()[0];
		}
	} catch (e) {
		console.error(
			`An error occurred while getting sheet from URL: ${e.message}`
		);
		return null;
	}
}

/**
 * Retrieves a Spreadsheet object based on its URL.
 *
 * @param {string} sheetUrl The full URL of the Google Sheet.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null} The Spreadsheet object if found, otherwise null.
 */
function getSpreadsheetFromUrl(sheetUrl) {
	if (!isGoogleSheetReference(sheetUrl)) {
		console.error(
			`Error: The provided URL '${sheetUrl}' is not a valid Google Sheet URL.`
		);
		return null;
	}

	try {
		const spreadsheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (!spreadsheetIdMatch || spreadsheetIdMatch.length < 2) {
			console.error(
				`Error: Could not extract spreadsheet ID from URL: ${sheetUrl}`
			);
			return null;
		}

		const spreadsheetId = spreadsheetIdMatch[1];
		const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

		if (!spreadsheet) {
			console.error(
				`Error: Could not open spreadsheet with ID: ${spreadsheetId}`
			);
			return null;
		}

		return spreadsheet;
	} catch (e) {
		console.error(
			`An error occurred while getting spreadsheet from URL: ${e.message}`
		);
		return null;
	}
}

/**
 * Retrieves a Sheet object based on its GiD.
 *
 * @param {string} gid The full gid of the Google Sheet.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null} The Sheet object if found, otherwise null.
 */
function getSheetNameByGid(spreadsheet, gid) {
	gid = Number(gid); // Ensure it's a number
	var sheets = spreadsheet.getSheets();
	for (var i = 0; i < sheets.length; i++) {
		if (sheets[i].getSheetId() === gid) {
			return sheets[i].getName(); // Return the sheet name
		}
	}
	return null; // Not found
}

/**
 * Moves the value from one cell to another
 *
 * @param {Sheet} exportSheet The sheet to take values from
 * @param {number} exportRow The row to take values from
 * @param {number} exportColumn The row to take values from
 * @param {Sheet} importSheet The sheet to give values to
 * @param {number} importRow The row to give values to
 * @param {number} importColumn The row to give values to
 */
function migrateCell(
	exportSheet,
	exportColumn,
	exportRow,
	importSheet,
	importColumn,
	importRow
) {
	if (
		!(exportSheet instanceof sheetContext) ||
		!(importSheet instanceof sheetContext)
	)
		throw new Error("Must pass sheetContext objects to function");
	var migrationValue = exportSheet.getRange(exportRow, exportColumn).getValue();
	importSheet.getRange(importRow, importColumn).setValue(migrationValue);
}

/**
 * Returns the whole number value of a date, when passed a date value (in milliseconds)
 *
 * @param {number} date A date given in milliseconds
 * @returns {number} day The whole number value of a day
 */
function getDateAsNumber(date) {
	return Math.trunc(date / (1000 * 60 * 60 * 24));
}

/**
 * Returns T/F whether a given string is the name of a weekend OR today is a day off
 * based on whether or not the workday checkbox is checked (in Daily Routine)
 * (not checked means it IS a day off)
 *
 * @param {string} day The name of a day
 * @returns {True|False}
 */
function isDayOff(day) {
	var workdayCheckboxChecked = dailyRoutine.sheet
		.getRange(dailyRoutine.workdayCheckbox)
		.getValues()[0][0];
	return isWeekend(day) || !workdayCheckboxChecked;
}

/**
 * Returns T/F whether a given string is the name of a weekend
 *
 * @param {string} day The name of a day
 * @returns {True|False}
 */
function isWeekend(day) {
	return day == "Saturday" || day == "Sunday";
}

/**
 * Returns a table from a supplied Google Doc url
 *
 * @param {string} sheetUrl - The full url to the google sheet
 * @param {string} tableNumber
 * @param {string}
 * @returns {table}
 */
function getGoogleDocTable(sheetUrl, tableNumber = 0, tabName = null) {
	var doc = DocumentApp.openByUrl(sheetUrl);

	for (const tab of doc.getTabs()) {
		if (tabName == null) break;

		const tabBody = tab.asDocumentTab().getBody();
		const text = tabBody.getText();
		if (text.includes(tabName)) {
			doc = tab;
			break;
		}
	}

	const tables = doc.getBody().getTables();

	if (tables.length === 0) {
		Logger.log("No tables found in the document.");
		return;
	}

	return tables[tableNumber];
}

/***
 * Blends two colors together
 *
 * @param {string} hex1 - color as a hex
 * @param {string} hex3 - color as a hex
 */
function blendHexColors(hex1, hex2) {
	// Helper to convert hex to RGB
	function hexToRgb(hex) {
		const cleanHex = hex.replace("#", "");
		return {
			r: parseInt(cleanHex.substring(0, 2), 16),
			g: parseInt(cleanHex.substring(2, 4), 16),
			b: parseInt(cleanHex.substring(4, 6), 16),
		};
	}

	function rgbToHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}

	const rgb1 = hexToRgb(hex1);
	const rgb2 = hexToRgb(hex2);

	const blended = {
		r: Math.round((rgb1.r + rgb2.r) / 2),
		g: Math.round((rgb1.g + rgb2.g) / 2),
		b: Math.round((rgb1.b + rgb2.b) / 2),
	};

	return rgbToHex(blended.r, blended.g, blended.b);
}

/**
 * Validates that the provided Range object refers to exactly one cell.
 * Throws an error if the range spans more than one row or column.
 *
 * @param {Range} range - The Range object to validate.
 * @throws {Error} If the range is not a single cell.
 */
function assertSingleCell(range) {
	if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) {
		throw new Error(
			`Expected a single cell, but got a range of ${range.getNumRows()} rows and ${range.getNumColumns()} columns.`
		);
	}
}

function columnToLetter(column) {
	let letter = "";
	while (column > 0) {
		const temp = (column - 1) % 26;
		letter = String.fromCharCode(temp + 65) + letter;
		column = Math.floor((column - temp - 1) / 26);
	}
	return letter;
}

function getNamedRangeHyperlinksForCell(
	sheetName,
	checkedCellLocation,
	namedRangeName
) {
	var sheet = projectSpreadsheet.getSheetByName(sheetName);

	// Get selections from cell
	var range = sheet.getRange(checkedCellLocation);
	var richText = getNamedRangeHyperLinks(
		range.getCell().getValue(),
		namedRangeName
	);

	if (richText == undefined) richText = emptyRichText;

	range.setRichTextValue(richText);
}

function getNamedRangeHyperLinks(cellValue, namedRangeName) {
	var richText;

	var cellSelections = cellValue.replaceAll(", ", ",").split(",");
	if (!cellSelections | (cellSelections[0] == "")) return emptyRichText;

	// Get values from named range to compare against
	var namedRange = projectSpreadsheet.getRangeByName(namedRangeName);
	var namedRangeValues = namedRange.getValues().flat();

	// Cycle throught cellSelections
	for (let i = 0; i < cellSelections.length; i++) {
		// Cycle through named range values
		for (let j = 0; j < namedRange.getNumRows(); j++) {
			var namedRangeValue = namedRangeValues[j];

			if (namedRangeValue == cellSelections[i]) {
				// Get cell from named range
				var rangeCell = namedRange.getCell(j + 1, 1);
				richText = addRichTextURL(rangeCell, richText);
			}
		}
	}
	return richText;
}

function addRichTextURL(cell, sourceRichTextValue) {
	var newText = cell.getValue();
	var linkUrl = cell.getRichTextValue().getLinkUrl();
	var linkStart;
	var linkText;
	var newRichTextValue = SpreadsheetApp.newRichTextValue();

	if (sourceRichTextValue == undefined) {
		sourceRichTextValue = SpreadsheetApp.newRichTextValue();
		linkText = newText;
		linkStart = 0;
		newRichTextValue.setText(linkText);
	} else {
		var oldTextLength = sourceRichTextValue.getText().length;
		linkText = sourceRichTextValue.getText() + ", " + newText;
		linkStart = oldTextLength + 2;
		newRichTextValue = copyRichTextValueHyperlinks(
			sourceRichTextValue,
			linkText
		);
	}

	return newRichTextValue
		.setLinkUrl(linkStart, linkText.length, linkUrl)
		.build();
}

function copyRichTextValueHyperlinks(sourceRTV, linkText) {
	var runs = sourceRTV.getRuns();
	const builder = SpreadsheetApp.newRichTextValue().setText(linkText);

	runs.forEach((run) => {
		const url = run.getLinkUrl();
		if (url) {
			const start = run.getStartIndex();
			const end = run.getEndIndex();
			builder.setLinkUrl(start, end, url);
		}
	});

	return builder;
}
