import { ProcessingStatus, SequenceFile } from "../../core";
import { GenbankError } from "./GenbankError";
import { Feature } from "./Feature";
import { strToGenbankDivision } from "./GenbankDivision";
import { GenbankSequence } from "./GenbankSequence";

const regexes = {
	sequence: /LOCUS(.*?)(\r?\n\/\/)/gs,
	whitespace: /\s+/,
	endline: /\r?\n/,
};

export class GenbankSequencesFile extends SequenceFile {
	public sequences: GenbankSequence[] = [];

	private processingParams = {
		chunkNumber: 0,
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
		prechunk: "",
		inFeature: "",
	};

	constructor(path: string) {
		super(path);
		this.processingStatus = ProcessingStatus.NotStarted;
	}

	public onData = (chunk: string): void | GenbankSequence => {
		chunk = this.processingParams.prechunk + chunk;
		this.processingParams.prechunk = "";
		const sequences = chunk.match(regexes.sequence);
		if (sequences === null) {
			this.processingParams.prechunk += chunk;
			return;
		}
		const endString = chunk.replace(regexes.sequence, "");
		this.processingParams.prechunk += endString.trim();
		const newSequences = sequences.map(this.processSequence);
		this.sequences.push(...newSequences);
		return newSequences[newSequences.length - 1];
	};

	public toString(): string {
		// TODO: Implement
		throw new Error("Method not implemented.");
	}

	private processSequence = (chunk: string): GenbankSequence => {
		this.processingParams.currentSequence = {} as GenbankSequence;
		this.processingParams.currentFeature = {} as Feature;
		const lines = chunk.split(regexes.endline);
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.startsWith("LOCUS")) {
				this.processingParams.chunkNumber++;
			} else if (line.startsWith("//")) {
				if (this.processingParams.currentFeature.name) {
					this.processingParams.currentSequence.Features.push(
						this.processingParams.currentFeature
					);
				}
				if (this.processingParams.currentSequence.References) {
					this.processingParams.currentSequence.References.push(
						this.processingParams.currentReference
					);
				}
				return this.processingParams.currentSequence;
			}

			// We are inside of a sequence chunk
			if (line.startsWith("LOCUS")) {
				this.processingParams.inFeature = "LOCUS";
				const header = line.split(regexes.whitespace);
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
				while (lines[i + 1].startsWith(" ")) {
					i++;
					this.processingParams.currentSequence.Definition +=
						" " + lines[i];
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
				while (lines[i + 1].startsWith(" ")) {
					i++;
					this.processingParams.currentSequence.Version +=
						" " + lines[i].trim();
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
					this.processingParams.currentSequence.Source.Organism = [];
				}
				this.processingParams.inFeature = "SOURCE";
				let isInSource = true;
				while (lines[i + 1].startsWith(" ")) {
					i++;
					if (lines[i].includes("ORGANISM")) {
						isInSource = false;
						continue;
					}

					if (isInSource) {
						this.processingParams.currentSequence.Source.text +=
							" " + lines[i].trim();
					} else {
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
					}
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
						...(this.processingParams.currentSequence.References ??
							[]),
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
					this.processingParams.inFeature = "REFERENCE";
				}
				if (lines[i].startsWith(" ")) {
					if (lines[i].includes("AUTHORS")) {
						this.processingParams.currentReference.Authors = lines[
							i
						]
							.split("AUTHORS")[1]
							.trim()
							.split(",")
							.map((s) => {
								return s.trim().endsWith(".")
									? s.trim().slice(0, -1)
									: s.trim();
							})
							.filter((s) => s.length > 0);
					} else if (lines[i].includes("TITLE")) {
						this.processingParams.currentReference.Title = lines[i]
							.split("TITLE")[1]
							.trim();
					} else if (lines[i].includes("JOURNAL")) {
						this.processingParams.currentReference.Journal = lines[
							i
						]
							.split("JOURNAL")[1]
							.trim();
					} else if (lines[i].includes("PUBMED")) {
						this.processingParams.currentReference.PubMed = lines[i]
							.split("PUBMED")[1]
							.trim();
					} else {
						this.processingParams.currentReference.OtherFields = [
							...(this.processingParams.currentReference
								.OtherFields ?? []),
							lines[i],
						];
					}
				}
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
							this.processingParams.previousFeatureName = name;
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
						this.processingParams.currentFeature = {} as Feature;
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
			if (
				this.processingParams.inFeature === "COMMENT" ||
				line.startsWith("COMMENT")
			) {
				if (line.startsWith("COMMENT")) {
					this.processingParams.inFeature = "COMMENT";
					this.processingParams.currentSequence.Comment = "";
				}
				let comment = line.split(/COMMENT\s+/)[1].trim();
				while (lines[i + 1].startsWith(" ")) {
					i++;
					comment += " " + lines[i].trim();
				}
				comment = comment.replace(/\s+/g, " ");
				this.processingParams.currentSequence.Comment = comment;
			}
		}
		throw GenbankError.InvalidSequence;
	};

	public resetProcessingParams = (): void => {
		this.processingParams = {
			chunkNumber: 0,
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
			prechunk: "",
			inFeature: "",
		};
	};

	private getStringFeature(line: string, name: string): string {
		const value = line.split(name)[1].trim();
		return value;
	}
}
