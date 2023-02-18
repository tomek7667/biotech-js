export * from "./core";
import * as SQF from "./sequenceFiles";

const mainTest = async () => {
	const genbankFile = new SQF.GenbankSequenceFile(
		"./example/genbank/proteinase-db.gp"
	);
	await genbankFile.process();
	console.log("took: " + genbankFile.tookMs + "ms");
};

mainTest();
