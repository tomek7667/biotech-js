import { SequenceFile } from "../../core";
import { FastqSequence } from "./sequence";

export class FastqSequenceFile extends SequenceFile {
	public sequences: FastqSequence[] = [];

	private processingParams = {
		preChunk: "",
		currentSequence: {} as FastqSequence,
		currentLine: 0,
	};
	private lowestQuality = "!".charCodeAt(0);

	constructor(path: string) {
		super(path);
	}

	onData(chunk: string): void {
		const lines = chunk.split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			switch (this.processingParams.currentLine) {
				case 0: {
					if (
						this.processingParams.currentSequence.sequence &&
						this.processingParams.currentSequence.rawQuality
					) {
						this.sequences.push(
							this.processingParams.currentSequence
						);
					}
					this.processingParams.currentSequence = {
						sequenceIdentifier1: line.substring(1),
						sequence: "",
						sequenceIdentifier2: "",
						rawQuality: "",
						quality: [] as number[],
					};
					break;
				}
				case 1: {
					this.processingParams.currentSequence.sequence += line
						.replace(/\s/g, "")
						.toUpperCase();
					break;
				}
				case 2: {
					this.processingParams.currentSequence.sequenceIdentifier2 =
						line.substring(1);
					break;
				}
				case 3: {
					this.processingParams.currentSequence.rawQuality += line;
					this.processingParams.currentSequence.quality =
						this.processingParams.currentSequence.rawQuality
							.split("")
							.map(
								(char) =>
									char.charCodeAt(0) - this.lowestQuality
							);
					break;
				}
			}

			this.processingParams.currentLine =
				(this.processingParams.currentLine + 1) % 4;
		}
	}

	resetProcessingParams(): void {
		this.processingParams = {
			preChunk: "",
			currentSequence: {} as FastqSequence,
			currentLine: 0,
		};
	}
}
