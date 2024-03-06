"use strict";
exports.__esModule = true;
exports.FileExtensionHandler = exports.FileExtension = void 0;
var FileExtension;
(function (FileExtension) {
    FileExtension["Fasta"] = "Fasta";
    FileExtension["Fastq"] = "Fastq";
    FileExtension["Genbank"] = "Genbank";
})(FileExtension = exports.FileExtension || (exports.FileExtension = {}));
var FileExtensionHandler = /** @class */ (function () {
    function FileExtensionHandler() {
    }
    /**
     * @returns {string[]} The list of file extensions for FASTA files.
     */
    FileExtensionHandler.Fasta = function () {
        return [
            ".fasta",
            ".fna",
            ".ffn",
            ".faa",
            ".frn",
            ".fa",
            "fasta",
            "fna",
            "ffn",
            "faa",
            "frn",
            "fa",
        ];
    };
    /**
     * @returns {string[]} The list of file extensions for FASTQ files.
     */
    FileExtensionHandler.Fastq = function () {
        return [".fastq", ".fq", "fastq", "fq"];
    };
    /**
     * @returns {string[]} The list of file extensions for Genbank files.
     */
    FileExtensionHandler.Genbank = function () {
        return [
            ".gb",
            ".gbk",
            ".genbank",
            ".gp",
            ".genpep",
            ".genpept",
            "gb",
            "gbk",
            "genbank",
            "gp",
            "genpep",
            "genpept",
        ];
    };
    /**
     * Converts a file extension to a FileExtension enum.
     *
     * @param extension: The file extension to convert.
     * @returns {FileExtensionHandler} The FileExtension enum.
     */
    FileExtensionHandler.fileExtensionToEnum = function (extension) {
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
    };
    return FileExtensionHandler;
}());
exports.FileExtensionHandler = FileExtensionHandler;
