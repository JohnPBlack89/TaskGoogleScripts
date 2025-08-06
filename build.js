import { build } from "@dtrlanz/gas-bundler";

await build({
	entryPoints: ["./src/main.js"],
	outfile: "dist/code.js",
	banner: {
		js: "(() => {",
	},
	footer: {
		js: "})();\n" + "Object.assign(this, globalThis);",
	},
});
