import { build } from "@dtrlanz/gas-bundler";

await build({
	entryPoints: [
		"./src/sheetContext.js",
		"./src/tasksContext.js",
		"./src/utilities.js",
		"./src/namedRangeHyperlinks.js",
		"./src/longTerm.js",
		"./src/holidayPrep.js",
		"./src/main.js",
	], // Order matters here
	outdir: "dist",
});
