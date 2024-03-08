import path from "path";
import { FastqSequenceFile } from "./FastqSequenceFile";
import { ProcessingStatus } from "../../core";
import { readFile } from "fs/promises";

const mediumFastaPath = path.join(__dirname, "./__test__/medium.fastq");
const ONE_SECOND = 1000;

describe("FastqSequenceFile", () => {
	test("processing status should be SuccessFinished", async () => {
		const file = new FastqSequenceFile(mediumFastaPath);
		await file.process();

		expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
	});

	test("there should be correct number of sequences", async () => {
		const file = new FastqSequenceFile(mediumFastaPath);
		await file.process();

		expect(file.sequences.length).toBe(4437);
	});

	test("the processing should be fast", async () => {
		const file = new FastqSequenceFile(mediumFastaPath);
		await file.process();

		expect(file.tookMs).toBeLessThan(ONE_SECOND);
	});

	test("toString should return the original content - begginings", async () => {
		const file = new FastqSequenceFile(mediumFastaPath);
		await file.process();

		const content = await readFile(mediumFastaPath, "utf-8");
		const beginning1 = content.substring(0, 1000);
		const beginning2 = file.toString().substring(0, 1000);
		expect(beginning1).toBe(beginning2);
	});

	test("toString should return the original content - ends", async () => {
		const file = new FastqSequenceFile(mediumFastaPath);
		await file.process();

		const content = await readFile(mediumFastaPath, "utf-8");
		const end1 = content.substring(content.length - 1000);
		const end2 = file.toString().substring(file.toString().length - 1000);
		expect(end1).toBe(end2);
	});
});
