export * from "./core";
import * as SQF from "./sequenceFiles";

const mainTest = async () => {
	const mockGB = "./example/genbank/proteinase-db.gp";

	const genbankFile = new SQF.GenbankSequencesFile(mockGB);
	await genbankFile.process();
	console.log("took: " + genbankFile.tookMs + "ms");
	console.log(genbankFile.sequences.length);
};

mainTest();
