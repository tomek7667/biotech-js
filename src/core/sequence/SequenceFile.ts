import { ProcessingStatus } from "..";
import { createReadStream, ReadStream } from "fs";
import { FileExtensionHandler, FileExtension } from "../file/FileExtension";

export abstract class SequenceFile {
	readonly originalPath: string;
	readonly created: Date;
	readonly format: FileExtension;
	public sequences: unknown[] = [];
	public processingStatus?: ProcessingStatus;
	public tookMs?: number;
	public sequencesNumber?: number;
	private stream?: ReadStream;

	constructor(path: string) {
		this.originalPath = path;
		this.created = new Date();
		const extension = path.substring(path.lastIndexOf("."));
		this.format = FileExtensionHandler.fileExtensionToEnum(extension);
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

	private onError(error: Error): void {
		this.processingStatus = ProcessingStatus.FailedFinished;
		console.error(error);
	}

	private onEnd(): void {
		this.onEndCallback?.();
		this.resetProcessingParams();
		this.sequencesNumber = this.sequences.length;
		this.processingStatus = ProcessingStatus.SuccessFinished;
	}

	abstract onData(chunk: string): void;
	abstract resetProcessingParams(): void;
	onEndCallback?(): void;
}
