"use strict";
exports.__esModule = true;
exports.strToGenbankDivision = exports.GenbankDivision = void 0;
/**
 * The GenBank division to which a record belongs is indicated with a three letter abbreviation - [documentaiton](https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#GenBankDivisionB)
 */
var GenbankDivision;
(function (GenbankDivision) {
    /**
     * primate sequences
     */
    GenbankDivision["PRI"] = "PRI";
    /**
     * rodent sequences
     */
    GenbankDivision["ROD"] = "ROD";
    /**
     * other mammalian sequences
     */
    GenbankDivision["MAM"] = "MAM";
    /**
     * other vertebrate sequences
     */
    GenbankDivision["VRT"] = "VRT";
    /**
     * invertebrate sequences
     */
    GenbankDivision["INV"] = "INV";
    /**
     * plant, fungal, and algal sequences
     */
    GenbankDivision["PLN"] = "PLN";
    /**
     * bacterial sequences
     */
    GenbankDivision["BCT"] = "BCT";
    /**
     * viral sequences
     */
    GenbankDivision["VRL"] = "VRL";
    /**
     * bacteriophage sequences
     */
    GenbankDivision["PHG"] = "PHG";
    /**
     * synthetic sequences
     */
    GenbankDivision["SYN"] = "SYN";
    /**
     * unannotated sequences
     */
    GenbankDivision["UNA"] = "UNA";
    /**
     * EST sequences (expressed sequence tags)
     */
    GenbankDivision["EST"] = "EST";
    /**
     * patent sequences
     */
    GenbankDivision["PAT"] = "PAT";
    /**
     * STS sequences (sequence tagged sites)
     */
    GenbankDivision["STS"] = "STS";
    /**
     * GSS sequences (genome survey sequences)
     */
    GenbankDivision["GSS"] = "GSS";
    /**
     * HTG sequences (high-throughput genomic sequences)
     */
    GenbankDivision["HTG"] = "HTG";
    /**
     * unfinished high-throughput cDNA sequencing
     */
    GenbankDivision["HTC"] = "HTC";
    /**
     * environmental sampling sequences
     */
    GenbankDivision["ENV"] = "ENV";
    /**
     * Not official genbank division
     */
    GenbankDivision["Unknown"] = "Unknown";
})(GenbankDivision = exports.GenbankDivision || (exports.GenbankDivision = {}));
var strToGenbankDivision = function (str) {
    var _a;
    return (_a = GenbankDivision[str]) !== null && _a !== void 0 ? _a : GenbankDivision.Unknown;
};
exports.strToGenbankDivision = strToGenbankDivision;
