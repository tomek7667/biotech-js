"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.GenbankSequencesFile = void 0;
var core_1 = require("../../core");
var Errors_1 = require("./Errors");
var GenbankDivision_1 = require("./GenbankDivision");
var GenbankSequencesFile = /** @class */ (function (_super) {
    __extends(GenbankSequencesFile, _super);
    function GenbankSequencesFile(path) {
        var _this = _super.call(this, path) || this;
        _this.sequences = [];
        _this.processingParams = {
            endOfLine: /\r?\n/,
            whitespace: /\s+/,
            whitespaceBeginning: /^\s+/,
            chunkNumber: 0,
            isOutOfChunk: true,
            currentSequence: {},
            currentReference: {},
            currentFeature: {},
            previousFeatureName: "",
            preChunk: "",
            inFeature: ""
        };
        _this.processingStatus = core_1.ProcessingStatus.NotStarted;
        return _this;
    }
    GenbankSequencesFile.prototype.onData = function (chunk) {
        var _a, _b, _c, _d, _e, _f, _g;
        chunk = this.processingParams.preChunk + chunk;
        chunk = chunk.replace("\t", "    ");
        var lastDoubleSlash = chunk.lastIndexOf("//");
        if (lastDoubleSlash !== -1) {
            this.processingParams.preChunk = chunk.slice(lastDoubleSlash + 2);
            chunk = chunk.slice(0, lastDoubleSlash + 2);
        }
        var lines = chunk.split(this.processingParams.endOfLine);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.startsWith("LOCUS")) {
                this.processingParams.chunkNumber++;
                this.processingParams.isOutOfChunk = false;
            }
            else if (line.startsWith("//")) {
                if (this.processingParams.currentFeature.name) {
                    this.processingParams.currentSequence.Features.push(this.processingParams.currentFeature);
                }
                if (this.processingParams.currentSequence.References) {
                    this.processingParams.currentSequence.References.push(this.processingParams.currentReference);
                }
                this.sequences.push(this.processingParams.currentSequence);
                this.processingParams.isOutOfChunk = true;
                this.processingParams.currentSequence = {};
                this.processingParams.currentFeature = {};
            }
            // We are inside of a sequence chunk
            if (!this.processingParams.isOutOfChunk) {
                if (line.startsWith("LOCUS")) {
                    this.processingParams.inFeature = "LOCUS";
                    var header = line.split(this.processingParams.whitespace);
                    this.processingParams.currentSequence.Locus = {
                        Name: header[1],
                        SequenceLength: parseInt(header[2]),
                        MoleculeType: header[4],
                        GenbankDivision: (0, GenbankDivision_1.strToGenbankDivision)(header[5]),
                        ModificationDate: new Date(header[6])
                    };
                }
                if (this.processingParams.inFeature === "DEFINITION" ||
                    line.startsWith("DEFINITION")) {
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
                if (this.processingParams.inFeature === "ACCESSION" ||
                    line.startsWith("ACCESSION")) {
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
                if (this.processingParams.inFeature === "VERSION" ||
                    line.startsWith("VERSION")) {
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
                if (this.processingParams.inFeature === "KEYWORDS" ||
                    line.startsWith("KEYWORDS")) {
                    this.processingParams.inFeature = "KEYWORDS";
                    this.processingParams.currentSequence.Keywords =
                        this.getStringFeature(line, "KEYWORDS")
                            .split(";")
                            .map(function (s) {
                            return s.trim().endsWith(".")
                                ? s.trim().slice(0, -1)
                                : s.trim();
                        })
                            .filter(function (s) { return s.length > 0; });
                    if (i + 1 >= lines.length) {
                        return;
                    }
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        this.processingParams.currentSequence.Keywords =
                            this.processingParams.currentSequence.Keywords.concat(lines[i]
                                .split(";")
                                .map(function (s) {
                                return s.trim().endsWith(".")
                                    ? s.trim().slice(0, -1)
                                    : s.trim();
                            })
                                .filter(function (s) { return s.length > 0; }));
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
                if (this.processingParams.inFeature === "SOURCE" ||
                    line.startsWith("SOURCE")) {
                    if (line.startsWith("SOURCE")) {
                        this.processingParams.currentSequence.Source = {};
                        this.processingParams.currentSequence.Source.text =
                            this.getStringFeature(line, "SOURCE");
                        this.processingParams.currentSequence.Source.Organism =
                            [];
                    }
                    this.processingParams.inFeature = "SOURCE";
                    if (i + 1 >= lines.length) {
                        return;
                    }
                    var isInSource = true;
                    while (lines[i + 1].startsWith(" ")) {
                        if (i + 1 >= lines.length) {
                            return;
                        }
                        i++;
                        if (lines[i].includes("ORGANISM")) {
                            isInSource = false;
                            continue;
                        }
                        if (isInSource) {
                            this.processingParams.currentSequence.Source.text +=
                                " " + lines[i].trim();
                        }
                        else {
                            this.processingParams.currentSequence.Source.Organism =
                                __spreadArray(__spreadArray([], this.processingParams.currentSequence
                                    .Source.Organism, true), [
                                    lines[i]
                                        .trim()
                                        .split(";")
                                        .map(function (s) {
                                        return s.trim().endsWith(".")
                                            ? s.trim().slice(0, -1)
                                            : s.trim();
                                    })
                                        .filter(function (s) { return s.length > 0; }),
                                ], false).flat();
                        }
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
                if (this.processingParams.inFeature === "REFERENCE" ||
                    line.startsWith("REFERENCE")) {
                    if (line.startsWith("REFERENCE")) {
                        this.processingParams.currentSequence.References = __spreadArray([], ((_a = this.processingParams.currentSequence
                            .References) !== null && _a !== void 0 ? _a : []), true);
                        this.processingParams.currentReference = {};
                        this.processingParams.currentReference.text =
                            this.getStringFeature(line, "REFERENCE");
                        this.processingParams.inFeature = "REFERENCE";
                    }
                    if (lines[i].startsWith(" ")) {
                        if (lines[i].includes("AUTHORS")) {
                            this.processingParams.currentReference.Authors =
                                lines[i]
                                    .split("AUTHORS")[1]
                                    .trim()
                                    .split(",")
                                    .map(function (s) {
                                    return s.trim().endsWith(".")
                                        ? s.trim().slice(0, -1)
                                        : s.trim();
                                })
                                    .filter(function (s) { return s.length > 0; });
                        }
                        else if (lines[i].includes("TITLE")) {
                            this.processingParams.currentReference.Title =
                                lines[i].split("TITLE")[1].trim();
                        }
                        else if (lines[i].includes("JOURNAL")) {
                            this.processingParams.currentReference.Journal =
                                lines[i].split("JOURNAL")[1].trim();
                        }
                        else if (lines[i].includes("PUBMED")) {
                            this.processingParams.currentReference.PubMed =
                                lines[i].split("PUBMED")[1].trim();
                        }
                        else {
                            this.processingParams.currentReference.OtherFields = __spreadArray(__spreadArray([], ((_b = this.processingParams.currentReference
                                .OtherFields) !== null && _b !== void 0 ? _b : []), true), [
                                lines[i],
                            ], false);
                        }
                    }
                }
                if (this.processingParams.inFeature === "FEATURES" ||
                    line.startsWith("FEATURES")) {
                    if (line.startsWith("FEATURES")) {
                        this.processingParams.currentSequence.Features =
                            [];
                        this.processingParams.inFeature = "FEATURES";
                        continue;
                    }
                    if (line.startsWith("                     ")) {
                        if (this.processingParams.currentFeature) {
                            if (line.split("/").length > 1) {
                                var name_1 = line.split("/")[1].split("=")[0];
                                var value = (_c = line
                                    .match(/"([^"]*)/gm)) === null || _c === void 0 ? void 0 : _c[0].slice(1);
                                this.processingParams.previousFeatureName =
                                    name_1;
                                var previousValue = this.processingParams.currentFeature.slashFields.get(name_1);
                                if (previousValue) {
                                    this.processingParams.currentFeature.slashFields.set(name_1, "".concat(previousValue, ";").concat(value));
                                }
                                else {
                                    this.processingParams.currentFeature.slashFields.set(name_1, value);
                                }
                            }
                            else {
                                var name_2 = this.processingParams.previousFeatureName;
                                var value = (_e = (_d = line.trim().match(/([^"]*)"/)) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : line.trim();
                                var previousValue = this.processingParams.currentFeature.slashFields.get(name_2);
                                this.processingParams.currentFeature.slashFields.set(name_2, "".concat(previousValue, " ").concat(value));
                            }
                        }
                        else {
                            throw Errors_1.GenbankError.CurrentFeatureNotInitialized;
                        }
                    }
                    else if (line.startsWith("     ")) {
                        if (this.processingParams.currentFeature.name) {
                            this.processingParams.currentSequence.Features.push(this.processingParams.currentFeature);
                            this.processingParams.currentFeature =
                                {};
                        }
                        var _h = line
                            .split(" ")
                            .filter(function (s) { return s.length > 0; }), key = _h[0], value = _h[1];
                        var numbers = (_f = value.match(/\d+\.\.\d+/)) !== null && _f !== void 0 ? _f : value.match(/\d+/);
                        if (!numbers) {
                            throw Errors_1.GenbankError.CorruptedFeatureNumber;
                        }
                        var _j = numbers[0].split(".."), start = _j[0], end = _j[1];
                        this.processingParams.currentFeature = {
                            name: key,
                            isComplementary: value.includes("complement"),
                            isPartialOn5Prime: value.includes("<"),
                            isPartialOn3Prime: value.includes(">"),
                            from: parseInt(start),
                            to: isNaN(parseInt(end))
                                ? parseInt(start)
                                : parseInt(end),
                            slashFields: new Map()
                        };
                    }
                }
                if (this.processingParams.inFeature === "ORIGIN" ||
                    line.startsWith("ORIGIN")) {
                    if (line.startsWith("ORIGIN")) {
                        this.processingParams.inFeature = "ORIGIN";
                        this.processingParams.currentSequence.Origin = "";
                        continue;
                    }
                    var sequence = (_g = line
                        .match(/\d+\s(.*)/)) === null || _g === void 0 ? void 0 : _g[1].toUpperCase().replace(/\s/g, "");
                    this.processingParams.currentSequence.Origin += sequence;
                }
            }
        }
    };
    GenbankSequencesFile.prototype.resetProcessingParams = function () {
        this.processingParams = {
            endOfLine: /\r?\n/,
            whitespace: /\s+/,
            whitespaceBeginning: /^\s+/,
            chunkNumber: 0,
            isOutOfChunk: true,
            currentSequence: {},
            currentReference: {},
            currentFeature: {},
            previousFeatureName: "",
            preChunk: "",
            inFeature: ""
        };
    };
    GenbankSequencesFile.prototype.getStringFeature = function (line, name) {
        var value = line.split(name)[1].trim();
        return value;
    };
    return GenbankSequencesFile;
}(core_1.SequenceFile));
exports.GenbankSequencesFile = GenbankSequencesFile;
