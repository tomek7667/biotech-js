import { ProcessingStatus } from "..";
import { createReadStream, ReadStream } from "fs";
import { FileExtensionHandler, FileExtension } from "../file/FileExtension";
import { FastaSequence } from "../../sequenceFiles/fasta/FastaSequence";
import { FastqSequence } from "../../sequenceFiles/fastq/FastqSequence";
import { GenbankSequence } from "../../sequenceFiles/genbank/GenbankSequence";
import { writeFile } from "fs/promises";

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

	/**
	 * Saves the processed file to a new file and returns the path of the new file
	 *
	 * @param path - optional path to save the file to
	 */
	public save = async (path?: string): Promise<string> => {
		let outputPath = "";
		if (path) {
			outputPath = path;
		} else {
			const firstPart = this.originalPath.substring(
				0,
				this.originalPath.lastIndexOf(".")
			);
			const extension = this.originalPath.substring(
				this.originalPath.lastIndexOf(".")
			);
			outputPath = `${firstPart}_processed${extension}`;
		}
		const string = this.toString();
		await writeFile(outputPath, string);
		return outputPath;
	};

	abstract toString(): string;

	private onError(error: Error): void {
		this.processingStatus = ProcessingStatus.FailedFinished;
		console.error(error);
	}

	private onEnd(): void {
		this.onEndCallback?.();
		this.resetProcessingParams();
		this.sequencesNumber = this.sequences.length;
		this.processingStatus = ProcessingStatus.SuccessFinished;
		this.qualityCheck();
	}

	private qualityCheck = (): void => {
		let invalidSequences = 0;
		let isQualityOk = true;
		switch (this.format) {
			case FileExtension.Fasta: {
				const sequences = this.sequences as FastaSequence[];
				sequences.forEach((data) => {
					if (data.sequence === null || data.sequence === undefined) {
						invalidSequences++;
						isQualityOk = false;
					}
				});
				break;
			}
			case FileExtension.Fastq: {
				const sequences = this.sequences as FastqSequence[];
				sequences.forEach((data) => {
					if (
						data.sequence === null ||
						data.sequence === undefined ||
						data.quality === null ||
						data.quality === undefined
					) {
						invalidSequences++;
						isQualityOk = false;
					}
				});
				break;
			}
			case FileExtension.Genbank: {
				const sequences = this.sequences as GenbankSequence[];
				sequences.forEach((data) => {
					if (
						data.Origin === null ||
						data.Origin === undefined ||
						data.Locus === null ||
						data.Locus === undefined ||
						data.Locus.Name === null ||
						data.Locus.Name === undefined
					) {
						invalidSequences++;
						isQualityOk = false;
					}
				});

				break;
			}
			default: {
				this.warn("Unknown file extension. Skipping quality check.");
				break;
			}
		}
		if (!isQualityOk) {
			this.warn(
				`Quality check failed for ${this.format}:${this.originalPath}. Invalid sequences: ${invalidSequences}/${this.sequences.length}`
			);
			this.processingStatus =
				ProcessingStatus.SuccessFinishedWithWarnings;
		}
		if (
			invalidSequences === this.sequences.length ||
			invalidSequences === this.sequencesNumber
		) {
			this.processingStatus = ProcessingStatus.FailedFinished;
		}
	};

	private warn = (str: string): void => {
		console.log(`[WARNING] ${str}`);
	};

	abstract onData(chunk: string): void;
	abstract resetProcessingParams(): void;
	onEndCallback?(): void;
}
