/**
 * Sets the hyperlinks of a cell, if any of its contents match what's in a given named range
 *
 * @param {Range} cell the name of the sheet containing the cell
 * @param {string} namedRangeName the name of the named range to check
 */
function setCellHyperlinksFromNamedRange(cell, namedRangeName) {
	assertSingleCell(cell);

	// Gets the RichText
	var richText = getNamedRangeRichText(cell, namedRangeName);

	cell.setRichTextValue(richText);
}

/**
 * Gets the complete RichTextValue for any of its contents that
 * match what's in a given named range
 *
 * @param {Range} cell
 * @param {string} namedRangeName
 * @returns {RichTextValue}
 */
function getNamedRangeRichText(cell, namedRangeName) {
	assertSingleCell(cell);
	var richText;
  var cellValue =  cell.getValue();

	var cellSelections =cellValue.replaceAll(", ", ",").split(",");
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

/**
 * Adds a hyperlink to a url on to an already existing RichTextValue
 *
 * @param {Range} cell
 * @param {RichTextValue} sourceRichTextValue
 * @returns {RichTextValue}
 */
function addRichTextURL(cell, sourceRichTextValue) {
	assertSingleCell(cell);

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
		newRichTextValue = addHyperlinkToRichTextValue(
			sourceRichTextValue,
			linkText
		);
	}

	return newRichTextValue
		.setLinkUrl(linkStart, linkText.length, linkUrl)
		.build();
}

/**
 * Adds a hyperlink on to an already existing RichTextValue
 *
 * @param {RichTextValue} originalRichTextValue
 * @param {string} linkText
 * @returns
 */
function addHyperlinkToRichTextValue(originalRichTextValue, linkText) {
	var runs = originalRichTextValue.getRuns();
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
