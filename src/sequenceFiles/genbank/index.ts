import { ProcessingStatus, SequenceFile } from "../../core";
import { GenbankSequence } from "./sequence";
import { createReadStream, ReadStream } from "fs";

export class GenbankSequenceFile extends SequenceFile {
	sequence: GenbankSequence;
	stream: ReadStream;
	processingStatus: ProcessingStatus;
	tookMs: number;
	previousChunk: string;

	constructor(path: string) {
		super(path);
		this.processingStatus = ProcessingStatus.NotStarted;
	}

	/**
	 * Processes the file and returns a promise that resolves when the file is processed
	 *
	 * @returns Promise<void> - resolves when the file is processed
	 */
	public async process(): Promise<void> {
		const start = Date.now();
		this.processingStatus = ProcessingStatus.InProgress;
		return new Promise((resolve, reject) => {
			this.stream = createReadStream(this.originalPath, {
				encoding: "utf8",
			});

			this.stream.on("data", (chunk: string) => {
				this.onData(chunk);
			});
			this.stream.on("error", (error: Error) => {
				this.onError(error);
				this.tookMs = Date.now() - start;
				return reject(error);
			});
			this.stream.on("end", () => {
				this.onEnd();
				this.tookMs = Date.now() - start;
				return resolve();
			});
		});
	}

	private onData(chunk: string): void {
		// TODO: implement
		// if end of the chunk `//` then we should wait for the next chunk
		this.previousChunk = chunk;
	}

	private onError(error: Error): void {
		this.processingStatus = ProcessingStatus.FailedFinished;
	}

	private onEnd(): void {
		this.processingStatus = ProcessingStatus.SuccessFinished;
	}
}
