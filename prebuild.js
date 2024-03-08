const { readFileSync, writeFileSync } = require("fs");
const { execSync } = require("child_process");

const DEBUG = false;

const packageJson = JSON.parse(readFileSync("./package.json"));

// input from user
const version = process.argv[2];
if (!version) {
	throw new Error("Version is required: yarn b <version>");
}

packageJson.version = version;

writeFileSync("./package.json", JSON.stringify(packageJson, null, "\t") + "\n");

const preCommands = [
	"yarn lint",
	"yarn lint:typecheck",
	"yarn lint:eslint",
	"yarn build",
	"yarn docs",
];

for (let preCommand of preCommands) {
	console.log(`Running '${preCommand}'`);
	const out = execSync(preCommand).toString().trim();
	if (DEBUG) {
		console.log(out);
	}
}

console.log("Done!");
console.log(`You can now publish the package with 'npm publish'`);
