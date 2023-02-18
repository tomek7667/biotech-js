export enum FileExtension {
	Fasta = "Fasta",
	Fastq = "Fastq",
	Genbank = "Genbank",
}

export class FileExtensionHandler {
	/**
	 * @returns {string[]} The list of file extensions for FASTA files.
	 */
	static Fasta(): string[] {
		return [".fasta", ".fna", ".ffn", ".faa", ".frn", ".fa"];
	}

	/**
	 * @returns {string[]} The list of file extensions for FASTQ files.
	 */
	static Fastq(): string[] {
		return [".fastq", ".fq"];
	}

	/**
	 * @returns {string[]} The list of file extensions for Genbank files.
	 */
	static Genbank(): string[] {
		return [".gb", ".gbk", ".genbank", ".gp", ".genpep", ".genpept"];
	}

	/**
	 * Converts a file extension to a FileExtension enum.
	 *
	 * @param extension: The file extension to convert.
	 * @returns {FileExtensionHandler} The FileExtension enum.
	 */
	static fileExtensionToEnum(extension: string): FileExtension {
		if (FileExtensionHandler.Fasta().includes(extension)) {
			return FileExtension.Fasta;
		}
		if (FileExtensionHandler.Fastq().includes(extension)) {
			return FileExtension.Fastq;
		}
		if (FileExtensionHandler.Genbank().includes(extension)) {
			return FileExtension.Genbank;
		}
		throw new Error("Unknown file extension");
	}
}
