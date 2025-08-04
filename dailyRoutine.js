/* Not really using this anymore either

var dailyRoutine = new sheetContext("Daily Routine", 1);
dailyRoutine.dayCellLocation = "A1";
dailyRoutine.workdayCheckbox = "B1";
dailyRoutine.workdayColumnName = "Workday";
dailyRoutine.dayOffColumnName = "Day Off";
dailyRoutine.hideRowName = "Hide";

function updateDailyRoutine() {
	addColumnForCurrentDate();
	todaysWork();
	hideDailyRoutineColumnsAndHideHideRow();
}

function todaysWork() {
	var today = dailyRoutine.sheet
		.getRange(dailyRoutine.dayCellLocation)
		.getValue();

	if (!isDayOff(today))
		dailyRoutine.showHideRows(dailyRoutine.workdayColumnName);

	if (isDayOff(today)) dailyRoutine.showHideRows(dailyRoutine.dayOffColumnName);
}

function hideDailyRoutineColumnsAndHideHideRow() {
	// Hide old date columns
	dailyRoutine.hideRowNumber = dailyRoutine.getRowNumber(
		1,
		dailyRoutine.hideRowName
	);
	dailyRoutine.showHideColumns(dailyRoutine.hideRowNumber);

	// Hide "Hide row" column
	dailyRoutine.sheet.hideRows(dailyRoutine.hideRowNumber);
}

function addColumnForCurrentDate() {
	var firstColumnAfterFrozenColumns = dailyRoutine.sheet.getFrozenColumns() + 1;
	var testDate = dailyRoutine.sheet
		.getRange(1, firstColumnAfterFrozenColumns)
		.getValue();
	var today = new Date();

	// Stop if today's column is already added
	if (testDate.getDate() == today.getDate()) return;

	// Check Hide="true" for old column
	dailyRoutine.hideRowNumber = dailyRoutine.getRowNumber(
		1,
		dailyRoutine.hideRowName
	);
	dailyRoutine.sheet
		.getRange(dailyRoutine.hideRowNumber, firstColumnAfterFrozenColumns)
		.setValue(true);

	// Insert new column with today's date AFTER frozen columns
	dailyRoutine.sheet.insertColumnsBefore(firstColumnAfterFrozenColumns, 1);
	dailyRoutine.sheet.getRange(1, firstColumnAfterFrozenColumns).setValue(today);
}
*/
