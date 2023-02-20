export declare enum FileExtension {
    Fasta = "Fasta",
    Fastq = "Fastq",
    Genbank = "Genbank"
}
export declare class FileExtensionHandler {
    /**
     * @returns {string[]} The list of file extensions for FASTA files.
     */
    static Fasta(): string[];
    /**
     * @returns {string[]} The list of file extensions for FASTQ files.
     */
    static Fastq(): string[];
    /**
     * @returns {string[]} The list of file extensions for Genbank files.
     */
    static Genbank(): string[];
    /**
     * Converts a file extension to a FileExtension enum.
     *
     * @param extension: The file extension to convert.
     * @returns {FileExtensionHandler} The FileExtension enum.
     */
    static fileExtensionToEnum(extension: string): FileExtension;
}
