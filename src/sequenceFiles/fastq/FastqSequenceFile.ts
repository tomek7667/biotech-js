import { SequenceFile } from "../../core";
import { FastqSequence } from "./FastqSequence";

interface ProcessingParams {
	preChunk: string;
	currentSequence: FastqSequence;
	currentLine: number;
	gatheredFastqData: string;
}

export class FastqSequenceFile extends SequenceFile {
	public sequences: FastqSequence[] = [];

	private processingParams: ProcessingParams = {
		preChunk: "",
		currentSequence: {
			quality: [],
			rawQuality: "",
			sequence: "",
			sequenceIdentifier1: "",
			sequenceIdentifier2: "",
		},
		currentLine: 0,
		gatheredFastqData: "",
	};
	private lowestQuality = "!".charCodeAt(0);

	constructor(path: string) {
		super(path);
	}

	public toString(): string {
		const content = this.sequences
			.map(
				({
					sequenceIdentifier1,
					sequence,
					sequenceIdentifier2,
					rawQuality,
				}) => {
					return `@${sequenceIdentifier1}\n${sequence}\n+${sequenceIdentifier2}\n${rawQuality}\n`;
				}
			)
			.join("");
		return content;
	}

	public onData(chunk: string): void {
		this.processingParams.gatheredFastqData += chunk;
	}

	public onEndCallback(): void {
		const lines = this.processingParams.gatheredFastqData.split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			switch (this.processingParams.currentLine) {
				case 0: {
					if (
						this.processingParams.currentSequence.sequence !== "" &&
						this.processingParams.currentSequence.rawQuality !== ""
					) {
						this.sequences.push(
							this.processingParams.currentSequence
						);
					}
					this.resetProcessingParams();
					this.processingParams.currentSequence.sequenceIdentifier1 =
						line.substring(1);
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
		this.sequences.push(this.processingParams.currentSequence);
		this.removeEmptySequences();
	}

	public resetProcessingParams(): void {
		this.processingParams = {
			preChunk: "",
			currentSequence: {
				quality: [],
				rawQuality: "",
				sequence: "",
				sequenceIdentifier1: "",
				sequenceIdentifier2: "",
			},
			currentLine: 0,
			gatheredFastqData: "",
		};
	}

	private removeEmptySequences(): void {
		this.sequences = this.sequences.filter(
			({ sequence }) => sequence.length > 0
		);
	}
}
