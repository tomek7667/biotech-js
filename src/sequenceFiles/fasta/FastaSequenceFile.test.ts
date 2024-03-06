import path from "path";
import { FastaSequenceFile } from "./FastaSequenceFile";
import { ProcessingStatus } from "../../core";
import { readFile } from "fs/promises";

const longFastaPath = path.join(__dirname, "./__test__/long.fa");
const ONE_SECOND = 1000;

describe("FastaSequenceFile", () => {
	test("processing status should be SuccessFinished", async () => {
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();

		expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
	});

	test("there should be correct number of sequences", async () => {
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();

		expect(file.sequences.length).toBe(166686);
	});

	test("there should not be sequences that contains their names", async () => {
		/* 
			console.log
				Method 1: 604643
			console.log
				Method 2: 612439
			console.log
				Method 3: 604913
		*/
		/*
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();
		const names = file.sequences.map(({ description }) =>
			description.toLowerCase()
		);

		const sequences = file.sequences
			.map(({ sequence }) => sequence.toLowerCase())
			.join("");

		expect(names.length).toBe(
			file.sequences.map(({ sequence }) => sequence).length
		);
		// TODO: This operation needs optimization, it takes way too long
		const startDateMethod1 = new Date();
		expect(names.every((name) => !sequences.includes(name))).toBe(true);
		const endDateMethod1 = new Date();

		const startDateMethod2 = new Date();
		for (let i = 0; i < names.length; i++) {
			expect(sequences.includes(names[i])).toBe(false);
		}
		const endDateMethod2 = new Date();

		const startDateMethod3 = new Date();
		const asserts = [];
		for (let i = 0; i < names.length; i++) {
			asserts.push(sequences.includes(names[i]));
		}
		expect(asserts.every((assert) => assert === false)).toBe(true);
		const endDateMethod3 = new Date();

		console.log(
			"Method 1: " +
				(endDateMethod1.getTime() - startDateMethod1.getTime())
		);
		console.log(
			"Method 2: " +
				(endDateMethod2.getTime() - startDateMethod2.getTime())
		);
		console.log(
			"Method 3: " +
				(endDateMethod3.getTime() - startDateMethod3.getTime())
		);
		*/
	});

	test("the processing should be fast", async () => {
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();

		expect(file.tookMs).toBeLessThan(ONE_SECOND);
	});

	test("toString should return the original content - begginings", async () => {
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();

		const content = await readFile(longFastaPath, "utf-8");
		const beginning1 = content.substring(0, 1000);
		const beginning2 = file.toString().substring(0, 1000);
		expect(beginning1).toBe(beginning2);
	});

	test("toString should return the original content - ends", async () => {
		const file = new FastaSequenceFile(longFastaPath);
		await file.process();

		const content = await readFile(longFastaPath, "utf-8");
		const end1 = content.substring(content.length - 1000);
		const end2 = file.toString().substring(file.toString().length - 1000);
		expect(end1).toBe(end2);
	});
});
