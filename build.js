// build.js
import { build } from "@dtrlanz/gas-bundler";

await build({
	entryPoints: [
		"sheetContext.js",
		"tasksContext.js",
		"utilities.js",
		"namedRangeHyperlinks.js",
		"longTerm.js",
		"holidayPrep.js",
		"main.js",
	], // Order matters here
	outdir: "dist",
});
