import { SequenceFile } from "../../core";
import { FastaSequence } from "./FastaSequence";

interface ProcessingParams {
	currentSequence: FastaSequence;
	gatheredFastaData: string;
}

export class FastaSequenceFile extends SequenceFile {
	public sequences: FastaSequence[] = [];

	private processingParams: ProcessingParams = {
		currentSequence: {
			description: "",
			sequence: "",
		},
		gatheredFastaData: "",
	};

	constructor(path: string) {
		super(path);
	}

	public toString(): string {
		const content = this.sequences
			.map(({ description, sequence }) => {
				// additionally remove all newlines
				let sequenceText = `>${description
					.replace(/\n/g, "")
					.replace(/\r/g, "")}\n`;
				for (let i = 0; i < sequence.length; i += 60) {
					sequenceText += sequence.slice(i, i + 60) + "\n";
				}
				return sequenceText;
			})
			.join("");
		return content;
	}

	public onData(chunk: string): void {
		this.processingParams.gatheredFastaData += chunk;
	}

	public onEndCallback(): void {
		const lines = this.processingParams.gatheredFastaData.split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith(">")) {
				if (
					this.processingParams.currentSequence.sequence !== "" &&
					this.processingParams.currentSequence.description !== ""
				) {
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
		this.sequences.push(this.processingParams.currentSequence);
		this.removeEmptySequences();
	}

	public resetProcessingParams(): void {
		this.processingParams = {
			currentSequence: {
				description: "",
				sequence: "",
			},
			gatheredFastaData: "",
		};
	}

	private removeEmptySequences(): void {
		this.sequences = this.sequences.filter(
			({ sequence, description }) =>
				sequence.length > 0 && description.length > 0
		);
	}
}
