import path from "path";
import { GenbankSequencesFile } from "./GenbankSequencesFile";
import { ProcessingStatus } from "../../core";
// import { readFile } from "fs/promises";

const mediumGenbankFile = path.join(__dirname, "./__test__/medium.gb");
const ONE_SECOND = 1000;

describe("GenbankSequencesFile", () => {
	test("processing status should be SuccessFinished", async () => {
		const file = new GenbankSequencesFile(mediumGenbankFile);
		await file.process();

		expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
	});

	test("there should be correct number of sequences", async () => {
		const file = new GenbankSequencesFile(mediumGenbankFile);
		await file.process();

		expect(file.sequences.length).toBe(100);
	});

	test("the processing should be fast", async () => {
		const file = new GenbankSequencesFile(mediumGenbankFile);
		await file.process();

		expect(file.tookMs).toBeLessThan(ONE_SECOND);
	});

	// test("toString should return the original content - begginings", async () => {
	// 	const file = new GenbankSequencesFile(mediumGenbankFile);
	// 	await file.process();

	// 	const content = await readFile(mediumGenbankFile, "utf-8");
	// 	const beginning1 = content.substring(0, 1000);
	// 	const beginning2 = file.toString().substring(0, 1000);
	// 	expect(beginning1).toBe(beginning2);
	// });

	// test("toString should return the original content - ends", async () => {
	// 	const file = new GenbankSequencesFile(mediumGenbankFile);
	// 	await file.process();

	// 	const content = await readFile(mediumGenbankFile, "utf-8");
	// 	const end1 = content.substring(content.length - 1000);
	// 	const end2 = file.toString().substring(file.toString().length - 1000);
	// 	expect(end1).toBe(end2);
	// });

	// test("saving the file and reading it should have the same content", async () => {
	// 	const file = new GenbankSequencesFile(mediumGenbankFile);
	// 	await file.process();

	// 	const savedPath = path.join(__dirname, "./__test__/saved.gb");
	// 	await file.save(savedPath);

	// 	const newFile = new GenbankSequencesFile(savedPath);
	// 	await newFile.process();
	// 	expect(file.sequences.length).toBe(newFile.sequences.length);
	// });
});
