var holidayPrep = new ToDoList("Holiday Prep", 1);
holidayPrep.checkboxColumn = "Imported";
holidayPrep.nameColumnName = "Task";
holidayPrep.projectColumnName = "Occasion";
holidayPrep.dueDateColumnName = "Due Date";
holidayPrep.importMonthColumnName = "Import Month";
holidayPrep.annualResetRowTaskName = "Annual Reset";

function updateHolidayPrep() {
	// Get today's date in month format
	var today = new Date();
	let thisMonth = Utilities.formatDate(
		today,
		Session.getScriptTimeZone(),
		"MMMMM"
	);

	// Check if the annual reset has been completed this year
	var annualResetDone = isImported(holidayPrep.annualResetRowTaskName);

	// Run the annual reset if it's currently January
	if (thisMonth == "January" && !annualResetDone) annualReset();

	// Set Annual Reset Checkbox to False
	if (thisMonth != "January" && annualResetDone) {
		var importRow = holidayPrep.getRowNumber(
			holidayPrep.nameColumnName,
			holidayPrep.annualResetRowTaskName
		);
		holidayPrep.setValue(holidayPrep.checkboxColumn, importRow, false);
	}
}

function migrateHolidayPrepToTasks() {
	var importMonthColumn = holidayPrep.getColumnNumber(
		holidayPrep.importMonthColumnName
	);
	var importTaskColumn = holidayPrep.getColumnNumber(
		holidayPrep.nameColumnName
	);
	var importMonth;
	var taskName;
	for (var i = holidayPrep.titleRow + 1; i <= holidayPrep.lastRow; i++) {
		importMonth = holidayPrep.getValue(importMonthColumn, i);
		taskName = holidayPrep.getValue(importTaskColumn, i);
		if (importMonth == thisMonth && !isImported(taskName))
			migrateHolidayToTask(i);
	}
}

function migrateHolidayToTask(i) {
	holidayPrep.exportRow(projectTasks, i);
}

function isImported(taskName) {
	var taskRow = holidayPrep.getRowNumber(holidayPrep.nameColumnName, taskName);
	return holidayPrep.getValue(holidayPrep.checkboxColumn, taskRow);
}

function annualReset() {
	resetAllImported();
	updateDueDates();
	var annualResetRow = holidayPrep.getRowNumber(
		holidayPrep.nameColumnName,
		holidayPrep.annualResetRowTaskName
	);
	holidayPrep.setValue(holidayPrep.checkboxColumn, annualResetRow, true);
}

function resetAllImported() {
	var importedColumn = holidayPrep.getColumnNumber(holidayPrep.checkboxColumn);
	holidayPrep.sheet
		.getRange(2, importedColumn, holidayPrep.lastRow, 1)
		.setValue(false);
}

function updateDueDates() {
	var year = new Date().getFullYear();

	// Get Holidays
	var hanukkah = getHanukkahStartDate(year);
	var fathersDay = getFathersDay(year);
	var mothersDay = getMothersDay(year);
	var thanksgiving = getThanksgiving(year);

	var occasionColumn = holidayPrep.getColumnNumber(
		holidayPrep.projectColumnName
	);
	var dueDateColumn = holidayPrep.getColumnNumber(
		holidayPrep.dueDateColumnName
	);

	var lastRow = holidayPrep.sheet.getLastRow();

	var occasion;
	for (var i = holidayPrep.titleRow + 1; i <= lastRow; i++) {
		occasion = holidayPrep.getValue(occasionColumn, i);
		if (occasion == "Mother's Day")
			holidayPrep.setValue(dueDateColumn, i, mothersDay);
		else if (occasion == "Father's Day")
			holidayPrep.setValue(dueDateColumn, i, fathersDay);
		else if (occasion == "Hanukah")
			holidayPrep.setValue(dueDateColumn, i, hanukkah);
		else if (occasion == "Thanksgiving")
			holidayPrep.setValue(dueDateColumn, i, thanksgiving);
		else updateDueDateYear(i);
	}
}

function updateDueDateYear(row) {
	var dueDateColumn = holidayPrep.getColumnNumber(
		holidayPrep.dueDateColumnName
	);

	var currentYear = new Date().getFullYear();

	var originalDate = holidayPrep.getValue(dueDateColumn, row);

	if (originalDate == null || originalDate == "") {
		console.log("Original Date not found");
		return;
	}

	var newDate = new Date(
		currentYear,
		originalDate.getMonth(),
		originalDate.getDate()
	);

	holidayPrep.setValue(dueDateColumn, row, newDate);
}

/**
 * Calculates the date of Mother's Day for a given year.
 * Mother's Day is the second Sunday in May.
 * @param {number} year The year for which to calculate Mother's Day.
 * @returns {Date|null} A Date object representing Mother's Day, or null if the year is invalid.
 */
function getMothersDay(year) {
	const mayFirst = new Date(year, 4, 1); // Month is 0-indexed (0 = January, 4 = May)
	const dayOfWeek = mayFirst.getDay(); // 0 = Sunday, 6 = Saturday

	// Calculate the date of the first Sunday in May.
	const firstSunday = new Date(mayFirst);
	firstSunday.setDate(
		mayFirst.getDate() + (7 - (dayOfWeek === 0 ? 7 : dayOfWeek))
	); //Corrected to handle if May 1st is a Sunday

	// Mother's Day is the second Sunday, so add 7 days.
	const mothersDay = new Date(firstSunday);
	mothersDay.setDate(firstSunday.getDate() + 7);

	return mothersDay;
}

/**
 * Calculates the date of Father's Day for a given year.
 * Father's Day is the third Sunday in June.
 * @param {number} year The year for which to calculate Father's Day.
 * @returns {Date|null} A Date object representing Father's Day, or null if the year is invalid.
 */
function getFathersDay(year) {
	const today = new Date();
	var year = today.getFullYear();

	const juneFirst = new Date(year, 5, 1); // June is month 5 (0-indexed)
	const dayOfWeek = juneFirst.getDay();

	// Calculate the date of the first Sunday in June
	const firstSunday = new Date(juneFirst);
	firstSunday.setDate(
		juneFirst.getDate() + (7 - (dayOfWeek === 0 ? 7 : dayOfWeek))
	);

	// Father's Day is the third Sunday, add 14 days.
	const fathersDay = new Date(firstSunday);
	fathersDay.setDate(firstSunday.getDate() + 14);

	return fathersDay;
}

/**
 * Calculates the date of Thanksgiving for a given year.
 * Thanksgiving is the fourth Thursday in November.
 * @param {number} year The year for which to calculate Thanksgiving.
 * @returns {Date|null} A Date object representing Thanksgiving, or null if the year is invalid.
 */
function getThanksgiving(year) {
	if (typeof year !== "number" || year < 1) {
		return null;
	}

	const novemberFirst = new Date(year, 10, 1); // November is month 10 (0-indexed)
	const dayOfWeek = novemberFirst.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday

	// Calculate the date of the first Thursday.
	let firstThursday = new Date(novemberFirst);
	let daysToAdd = (4 - dayOfWeek + 7) % 7; //Use modulo to handle cases where Nov 1 is after Thursday
	firstThursday.setDate(novemberFirst.getDate() + daysToAdd);

	// Thanksgiving is the fourth Thursday, so add 3 weeks (21 days).
	const thanksgiving = new Date(firstThursday);
	thanksgiving.setDate(firstThursday.getDate() + 21);

	return thanksgiving;
}

const hanukkahStartDates = {
	2020: "2020-12-10",
	2021: "2021-11-28",
	2022: "2022-12-18",
	2023: "2023-12-07",
	2024: "2024-12-25",
	2025: "2025-12-14",
	2026: "2026-12-03",
	2027: "2027-12-23",
	2028: "2028-12-10",
	2029: "2029-11-29",
	2030: "2030-12-19",
	2031: "2031-12-08",
	2032: "2032-11-26",
	2033: "2033-12-15",
	2034: "2034-12-04",
	2035: "2035-12-24",
	2036: "2036-12-12",
	2037: "2037-12-01",
	2038: "2038-12-21",
	2039: "2039-12-09",
	2040: "2040-11-28",
	//Add more years as needed
};

/**
 * Calculates the start date of Hanukkah for a given year using pre-calculated data.
 * @param {number} year The year for which to calculate Hanukkah.
 * @returns {Date|null} A Date object representing the start of Hanukkah, or null if the year is not found.
 */
function getHanukkahStartDate(year) {
	if (typeof year !== "number") {
		return null;
	}

	const dateString = hanukkahStartDates[year];
	if (dateString) {
		return new Date(dateString);
	} else {
		return null; // Or handle the case where the year is not in the data
	}
}
