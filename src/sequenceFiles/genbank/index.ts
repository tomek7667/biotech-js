import { ProcessingStatus, SequenceFile } from "../../core";
import { GenbankError } from "./Errors";
import { Feature } from "./Feature";
import { strToGenbankDivision } from "./GenbankDivision";
import { GenbankSequence } from "./sequence";

export class GenbankSequencesFile extends SequenceFile {
	public sequences: GenbankSequence[] = [];

	private processingParams = {
		endOfLine: /\r?\n/,
		whitespace: /\s+/,
		whitespaceBeginning: /^\s+/,
		chunkNumber: 0,
		isOutOfChunk: true,
		currentSequence: {} as GenbankSequence,
		currentReference: {} as {
			text: string;
			Authors: string[];
			Title: string;
			Journal: string;
			PubMed: string;
			OtherFields: string[];
		},
		currentFeature: {} as Feature,
		previousFeatureName: "",
		preChunk: "",
		inFeature: "",
	};

	constructor(path: string) {
		super(path);
		this.processingStatus = ProcessingStatus.NotStarted;
	}

	onData(chunk: string): void {
		chunk = this.processingParams.preChunk + chunk;
		chunk = chunk.replace("\t", "    ");
		const lastDoubleSlash = chunk.lastIndexOf("//");
		if (lastDoubleSlash !== -1) {
			this.processingParams.preChunk = chunk.slice(lastDoubleSlash + 2);
			chunk = chunk.slice(0, lastDoubleSlash + 2);
		}

		const lines = chunk.split(this.processingParams.endOfLine);
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.startsWith("LOCUS")) {
				this.processingParams.chunkNumber++;
				this.processingParams.isOutOfChunk = false;
			} else if (line.startsWith("//")) {
				if (this.processingParams.currentFeature.name) {
					this.processingParams.currentSequence.Features.push(
						this.processingParams.currentFeature
					);
				}
				this.sequences.push(this.processingParams.currentSequence);
				this.processingParams.isOutOfChunk = true;
				this.processingParams.currentSequence = {} as GenbankSequence;
				this.processingParams.currentFeature = {} as Feature;
			}
			// We are inside of a sequence chunk
			if (!this.processingParams.isOutOfChunk) {
				if (line.startsWith("LOCUS")) {
					this.processingParams.inFeature = "LOCUS";
					const header = line.split(this.processingParams.whitespace);
					this.processingParams.currentSequence.Locus = {
						Name: header[1],
						SequenceLength: parseInt(header[2]),
						MoleculeType: header[4],
						GenbankDivision: strToGenbankDivision(header[5]),
						ModificationDate: new Date(header[6]),
					};
				}
				if (
					this.processingParams.inFeature === "DEFINITION" ||
					line.startsWith("DEFINITION")
				) {
					if (line.startsWith("DEFINITION")) {
						this.processingParams.currentSequence.Definition =
							this.getStringFeature(line, "DEFINITION");
					}
					this.processingParams.inFeature = "DEFINITION";
					if (i + 1 >= lines.length) {
						return;
					}
					while (lines[i + 1].startsWith(" ")) {
						i++;
						this.processingParams.currentSequence.Definition +=
							" " + lines[i];
						if (i + 1 >= lines.length) {
							return;
						}
					}
					if (i + 1 >= lines.length) {
						return;
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "ACCESSION" ||
					line.startsWith("ACCESSION")
				) {
					if (line.startsWith("ACCESSION")) {
						this.processingParams.currentSequence.Accession =
							this.getStringFeature(line, "ACCESSION");
					}
					this.processingParams.inFeature = "ACCESSION";
					if (i + 1 >= lines.length) {
						return;
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "VERSION" ||
					line.startsWith("VERSION")
				) {
					if (line.startsWith("VERSION")) {
						this.processingParams.inFeature = "VERSION";
						this.processingParams.currentSequence.Version =
							this.getStringFeature(line, "VERSION");
					}
					if (i + 1 >= lines.length) {
						return;
					}
					while (lines[i + 1].startsWith(" ")) {
						i++;
						this.processingParams.currentSequence.Version +=
							" " + lines[i].trim();
						if (i + 1 >= lines.length) {
							return;
						}
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "KEYWORDS" ||
					line.startsWith("KEYWORDS")
				) {
					this.processingParams.inFeature = "KEYWORDS";
					this.processingParams.currentSequence.Keywords =
						this.getStringFeature(line, "KEYWORDS")
							.split(";")
							.map((s) => {
								return s.trim().endsWith(".")
									? s.trim().slice(0, -1)
									: s.trim();
							})
							.filter((s) => s.length > 0);
					if (i + 1 >= lines.length) {
						return;
					}
					while (lines[i + 1].startsWith(" ")) {
						i++;
						this.processingParams.currentSequence.Keywords =
							this.processingParams.currentSequence.Keywords.concat(
								lines[i]
									.split(";")
									.map((s) => {
										return s.trim().endsWith(".")
											? s.trim().slice(0, -1)
											: s.trim();
									})
									.filter((s) => s.length > 0)
							);
						if (i + 1 >= lines.length) {
							return;
						}
					}
					if (i + 1 >= lines.length) {
						return;
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "SOURCE" ||
					line.startsWith("SOURCE")
				) {
					if (line.startsWith("SOURCE")) {
						this.processingParams.currentSequence.Source = {} as {
							text: string;
							Organism: string[];
						};
						this.processingParams.currentSequence.Source.text =
							this.getStringFeature(line, "SOURCE");
						this.processingParams.currentSequence.Source.Organism =
							[];
					}
					this.processingParams.inFeature = "SOURCE";
					if (i + 1 >= lines.length) {
						return;
					}
					while (lines[i + 1].startsWith(" ")) {
						if (i + 1 >= lines.length) {
							return;
						}
						i++;
						if (lines[i].includes("ORGANISM")) continue;
						this.processingParams.currentSequence.Source.Organism =
							[
								...this.processingParams.currentSequence.Source
									.Organism,
								lines[i]
									.trim()
									.split(";")
									.map((s) => {
										return s.trim().endsWith(".")
											? s.trim().slice(0, -1)
											: s.trim();
									})
									.filter((s) => s.length > 0),
							].flat();
						if (i + 1 >= lines.length) {
							return;
						}
					}
					if (i + 1 >= lines.length) {
						return;
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "REFERENCE" ||
					line.startsWith("REFERENCE")
				) {
					if (line.startsWith("REFERENCE")) {
						this.processingParams.currentSequence.References = [
							...(this.processingParams.currentSequence
								.References ?? []),
						];
						this.processingParams.currentReference = {} as {
							text: string;
							Authors: string[];
							Title: string;
							Journal: string;
							PubMed: string;
							OtherFields: string[];
						};
						this.processingParams.currentReference.text =
							this.getStringFeature(line, "REFERENCE");
					}
					this.processingParams.inFeature = "REFERENCE";
					if (i + 1 >= lines.length) {
						return;
					}
					while (
						i + 1 >= lines.length &&
						lines[i + 1].startsWith(" ")
					) {
						if (i + 1 >= lines.length) {
							return;
						}
						i++;
						if (lines[i].includes("AUTHORS")) {
							this.processingParams.currentReference.Authors =
								lines[i]
									.split("AUTHORS")[1]
									.trim()
									.split(",")
									.map((s) => {
										return s.trim().endsWith(".")
											? s.trim().slice(0, -1)
											: s.trim();
									})
									.filter((s) => s.length > 0);
							continue;
						}
						if (lines[i].includes("TITLE")) {
							this.processingParams.currentReference.Title =
								lines[i].split("TITLE")[1].trim();
							continue;
						}
						if (lines[i].includes("JOURNAL")) {
							this.processingParams.currentReference.Journal =
								lines[i].split("JOURNAL")[1].trim();
							continue;
						}
						if (lines[i].includes("PUBMED")) {
							this.processingParams.currentReference.PubMed =
								lines[i].split("PUBMED")[1].trim();
							continue;
						}
						this.processingParams.currentReference.OtherFields = [
							...(this.processingParams.currentReference
								.OtherFields ?? []),
							lines[i],
						];
					}

					this.processingParams.currentSequence.References.push(
						this.processingParams.currentReference
					);
					if (i + 1 >= lines.length) {
						return;
					}
					i++;
					line = lines[i];
				}
				if (
					this.processingParams.inFeature === "FEATURES" ||
					line.startsWith("FEATURES")
				) {
					if (line.startsWith("FEATURES")) {
						this.processingParams.currentSequence.Features =
							[] as Feature[];
						this.processingParams.inFeature = "FEATURES";
						continue;
					}
					if (line.startsWith("                     ")) {
						if (this.processingParams.currentFeature) {
							if (line.split("/").length > 1) {
								const name = line.split("/")[1].split("=")[0];
								const value = line
									.match(/"([^"]*)/gm)?.[0]
									.slice(1);
								this.processingParams.previousFeatureName =
									name;
								const previousValue =
									this.processingParams.currentFeature.slashFields.get(
										name
									);
								if (previousValue) {
									this.processingParams.currentFeature.slashFields.set(
										name,
										`${previousValue};${value}`
									);
								} else {
									this.processingParams.currentFeature.slashFields.set(
										name,
										value
									);
								}
							} else {
								const name =
									this.processingParams.previousFeatureName;
								const value =
									line.trim().match(/([^"]*)"/)?.[1] ??
									line.trim();
								const previousValue =
									this.processingParams.currentFeature.slashFields.get(
										name
									);
								this.processingParams.currentFeature.slashFields.set(
									name,
									`${previousValue} ${value}`
								);
							}
						} else {
							throw GenbankError.CurrentFeatureNotInitialized;
						}
					} else if (line.startsWith("     ")) {
						if (this.processingParams.currentFeature.name) {
							this.processingParams.currentSequence.Features.push(
								this.processingParams.currentFeature
							);
							this.processingParams.currentFeature =
								{} as Feature;
						}
						const [key, value] = line
							.split(" ")
							.filter((s) => s.length > 0);
						const numbers =
							value.match(/\d+\.\.\d+/) ?? value.match(/\d+/);

						if (!numbers) {
							throw GenbankError.CorruptedFeatureNumber;
						}
						const [start, end] = numbers[0].split("..");
						this.processingParams.currentFeature = {
							name: key,
							isComplementary: value.includes("complement"),
							isPartialOn5Prime: value.includes("<"),
							isPartialOn3Prime: value.includes(">"),
							from: parseInt(start),
							to: isNaN(parseInt(end))
								? parseInt(start)
								: parseInt(end),
							slashFields: new Map<string, string | undefined>(),
						} as Feature;
					}
				}
				if (
					this.processingParams.inFeature === "ORIGIN" ||
					line.startsWith("ORIGIN")
				) {
					if (line.startsWith("ORIGIN")) {
						this.processingParams.inFeature = "ORIGIN";
						this.processingParams.currentSequence.Origin = "";
						continue;
					}
					const sequence = line
						.match(/\d+\s(.*)/)?.[1]
						.toUpperCase()
						.replace(/\s/g, "");
					this.processingParams.currentSequence.Origin += sequence;
				}
			}
		}
	}

	resetProcessingParams(): void {
		this.processingParams = {
			endOfLine: /\r?\n/,
			whitespace: /\s+/,
			whitespaceBeginning: /^\s+/,
			chunkNumber: 0,
			isOutOfChunk: true,
			currentSequence: {} as GenbankSequence,
			currentReference: {} as {
				text: string;
				Authors: string[];
				Title: string;
				Journal: string;
				PubMed: string;
				OtherFields: string[];
			},
			currentFeature: {} as Feature,
			previousFeatureName: "",
			preChunk: "",
			inFeature: "",
		};
	}

	private getStringFeature(line: string, name: string): string {
		const value = line.split(name)[1].trim();
		return value;
	}
}
