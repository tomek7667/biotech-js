import { SequenceFile } from "../../core";
import { FastaSequence } from "./sequence";

export class FastaSequenceFile extends SequenceFile {
	public sequences: FastaSequence[] = [];

	private processingParams = {
		preChunk: "",
		currentSequence: {} as FastaSequence,
	};

	constructor(path: string) {
		super(path);
	}

	onData(chunk: string): void {
		const lines = chunk.split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith(">")) {
				if (this.processingParams.currentSequence.sequence) {
					this.sequences.push(this.processingParams.currentSequence);
				}
				this.processingParams.currentSequence = {
					description: line.substring(1),
					sequence: "",
				};
			} else {
				this.processingParams.currentSequence.sequence += line
					.replace(/\s/g, "")
					.toUpperCase();
			}
		}
	}

	resetProcessingParams(): void {
		this.processingParams = {
			preChunk: "",
			currentSequence: {} as FastaSequence,
		};
	}
}
