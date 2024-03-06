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
var GenbankError_1 = require("./GenbankError");
var GenbankDivision_1 = require("./GenbankDivision");
var regexes = {
    sequence: /LOCUS(.*?)(\r?\n\/\/)/gs,
    whitespace: /\s+/,
    endline: /\r?\n/
};
var GenbankSequencesFile = /** @class */ (function (_super) {
    __extends(GenbankSequencesFile, _super);
    function GenbankSequencesFile(path) {
        var _this = _super.call(this, path) || this;
        _this.sequences = [];
        _this.processingParams = {
            chunkNumber: 0,
            currentSequence: {},
            currentReference: {},
            currentFeature: {},
            previousFeatureName: "",
            prechunk: "",
            inFeature: ""
        };
        _this.onData = function (chunk) {
            var _a;
            chunk = _this.processingParams.prechunk + chunk;
            _this.processingParams.prechunk = "";
            var sequences = chunk.match(regexes.sequence);
            if (sequences === null) {
                _this.processingParams.prechunk += chunk;
                return;
            }
            var endString = chunk.replace(regexes.sequence, "");
            _this.processingParams.prechunk += endString.trim();
            var newSequences = sequences.map(_this.processSequence);
            (_a = _this.sequences).push.apply(_a, newSequences);
            return newSequences[newSequences.length - 1];
        };
        _this.processSequence = function (chunk) {
            var _a, _b, _c, _d, _e, _f, _g;
            _this.processingParams.currentSequence = {};
            _this.processingParams.currentFeature = {};
            var lines = chunk.split(regexes.endline);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.startsWith("LOCUS")) {
                    _this.processingParams.chunkNumber++;
                }
                else if (line.startsWith("//")) {
                    if (_this.processingParams.currentFeature.name) {
                        _this.processingParams.currentSequence.Features.push(_this.processingParams.currentFeature);
                    }
                    if (_this.processingParams.currentSequence.References) {
                        _this.processingParams.currentSequence.References.push(_this.processingParams.currentReference);
                    }
                    return _this.processingParams.currentSequence;
                }
                // We are inside of a sequence chunk
                if (line.startsWith("LOCUS")) {
                    _this.processingParams.inFeature = "LOCUS";
                    var header = line.split(regexes.whitespace);
                    _this.processingParams.currentSequence.Locus = {
                        Name: header[1],
                        SequenceLength: parseInt(header[2]),
                        MoleculeType: header[4],
                        GenbankDivision: (0, GenbankDivision_1.strToGenbankDivision)(header[5]),
                        ModificationDate: new Date(header[6])
                    };
                }
                if (_this.processingParams.inFeature === "DEFINITION" ||
                    line.startsWith("DEFINITION")) {
                    if (line.startsWith("DEFINITION")) {
                        _this.processingParams.currentSequence.Definition =
                            _this.getStringFeature(line, "DEFINITION");
                    }
                    _this.processingParams.inFeature = "DEFINITION";
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        _this.processingParams.currentSequence.Definition +=
                            " " + lines[i];
                    }
                    i++;
                    line = lines[i];
                }
                if (_this.processingParams.inFeature === "ACCESSION" ||
                    line.startsWith("ACCESSION")) {
                    if (line.startsWith("ACCESSION")) {
                        _this.processingParams.currentSequence.Accession =
                            _this.getStringFeature(line, "ACCESSION");
                    }
                    _this.processingParams.inFeature = "ACCESSION";
                    i++;
                    line = lines[i];
                }
                if (_this.processingParams.inFeature === "VERSION" ||
                    line.startsWith("VERSION")) {
                    if (line.startsWith("VERSION")) {
                        _this.processingParams.inFeature = "VERSION";
                        _this.processingParams.currentSequence.Version =
                            _this.getStringFeature(line, "VERSION");
                    }
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        _this.processingParams.currentSequence.Version +=
                            " " + lines[i].trim();
                    }
                    i++;
                    line = lines[i];
                }
                if (_this.processingParams.inFeature === "KEYWORDS" ||
                    line.startsWith("KEYWORDS")) {
                    _this.processingParams.inFeature = "KEYWORDS";
                    _this.processingParams.currentSequence.Keywords =
                        _this.getStringFeature(line, "KEYWORDS")
                            .split(";")
                            .map(function (s) {
                            return s.trim().endsWith(".")
                                ? s.trim().slice(0, -1)
                                : s.trim();
                        })
                            .filter(function (s) { return s.length > 0; });
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        _this.processingParams.currentSequence.Keywords =
                            _this.processingParams.currentSequence.Keywords.concat(lines[i]
                                .split(";")
                                .map(function (s) {
                                return s.trim().endsWith(".")
                                    ? s.trim().slice(0, -1)
                                    : s.trim();
                            })
                                .filter(function (s) { return s.length > 0; }));
                    }
                    i++;
                    line = lines[i];
                }
                if (_this.processingParams.inFeature === "SOURCE" ||
                    line.startsWith("SOURCE")) {
                    if (line.startsWith("SOURCE")) {
                        _this.processingParams.currentSequence.Source = {};
                        _this.processingParams.currentSequence.Source.text =
                            _this.getStringFeature(line, "SOURCE");
                        _this.processingParams.currentSequence.Source.Organism = [];
                    }
                    _this.processingParams.inFeature = "SOURCE";
                    var isInSource = true;
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        if (lines[i].includes("ORGANISM")) {
                            isInSource = false;
                            continue;
                        }
                        if (isInSource) {
                            _this.processingParams.currentSequence.Source.text +=
                                " " + lines[i].trim();
                        }
                        else {
                            _this.processingParams.currentSequence.Source.Organism =
                                __spreadArray(__spreadArray([], _this.processingParams.currentSequence.Source
                                    .Organism, true), [
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
                    }
                    i++;
                    line = lines[i];
                }
                if (_this.processingParams.inFeature === "REFERENCE" ||
                    line.startsWith("REFERENCE")) {
                    if (line.startsWith("REFERENCE")) {
                        _this.processingParams.currentSequence.References = __spreadArray([], ((_a = _this.processingParams.currentSequence.References) !== null && _a !== void 0 ? _a : []), true);
                        _this.processingParams.currentReference = {};
                        _this.processingParams.currentReference.text =
                            _this.getStringFeature(line, "REFERENCE");
                        _this.processingParams.inFeature = "REFERENCE";
                    }
                    if (lines[i].startsWith(" ")) {
                        if (lines[i].includes("AUTHORS")) {
                            _this.processingParams.currentReference.Authors = lines[i]
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
                            _this.processingParams.currentReference.Title = lines[i]
                                .split("TITLE")[1]
                                .trim();
                        }
                        else if (lines[i].includes("JOURNAL")) {
                            _this.processingParams.currentReference.Journal = lines[i]
                                .split("JOURNAL")[1]
                                .trim();
                        }
                        else if (lines[i].includes("PUBMED")) {
                            _this.processingParams.currentReference.PubMed = lines[i]
                                .split("PUBMED")[1]
                                .trim();
                        }
                        else {
                            _this.processingParams.currentReference.OtherFields = __spreadArray(__spreadArray([], ((_b = _this.processingParams.currentReference
                                .OtherFields) !== null && _b !== void 0 ? _b : []), true), [
                                lines[i],
                            ], false);
                        }
                    }
                }
                if (_this.processingParams.inFeature === "FEATURES" ||
                    line.startsWith("FEATURES")) {
                    if (line.startsWith("FEATURES")) {
                        _this.processingParams.currentSequence.Features =
                            [];
                        _this.processingParams.inFeature = "FEATURES";
                        continue;
                    }
                    if (line.startsWith("                     ")) {
                        if (_this.processingParams.currentFeature) {
                            if (line.split("/").length > 1) {
                                var name_1 = line.split("/")[1].split("=")[0];
                                var value = (_c = line
                                    .match(/"([^"]*)/gm)) === null || _c === void 0 ? void 0 : _c[0].slice(1);
                                _this.processingParams.previousFeatureName = name_1;
                                var previousValue = _this.processingParams.currentFeature.slashFields.get(name_1);
                                if (previousValue) {
                                    _this.processingParams.currentFeature.slashFields.set(name_1, "".concat(previousValue, ";").concat(value));
                                }
                                else {
                                    _this.processingParams.currentFeature.slashFields.set(name_1, value);
                                }
                            }
                            else {
                                var name_2 = _this.processingParams.previousFeatureName;
                                var value = (_e = (_d = line.trim().match(/([^"]*)"/)) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : line.trim();
                                var previousValue = _this.processingParams.currentFeature.slashFields.get(name_2);
                                _this.processingParams.currentFeature.slashFields.set(name_2, "".concat(previousValue, " ").concat(value));
                            }
                        }
                        else {
                            throw GenbankError_1.GenbankError.CurrentFeatureNotInitialized;
                        }
                    }
                    else if (line.startsWith("     ")) {
                        if (_this.processingParams.currentFeature.name) {
                            _this.processingParams.currentSequence.Features.push(_this.processingParams.currentFeature);
                            _this.processingParams.currentFeature = {};
                        }
                        var _h = line
                            .split(" ")
                            .filter(function (s) { return s.length > 0; }), key = _h[0], value = _h[1];
                        var numbers = (_f = value.match(/\d+\.\.\d+/)) !== null && _f !== void 0 ? _f : value.match(/\d+/);
                        if (!numbers) {
                            throw GenbankError_1.GenbankError.CorruptedFeatureNumber;
                        }
                        var _j = numbers[0].split(".."), start = _j[0], end = _j[1];
                        _this.processingParams.currentFeature = {
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
                if (_this.processingParams.inFeature === "ORIGIN" ||
                    line.startsWith("ORIGIN")) {
                    if (line.startsWith("ORIGIN")) {
                        _this.processingParams.inFeature = "ORIGIN";
                        _this.processingParams.currentSequence.Origin = "";
                        continue;
                    }
                    var sequence = (_g = line
                        .match(/\d+\s(.*)/)) === null || _g === void 0 ? void 0 : _g[1].toUpperCase().replace(/\s/g, "");
                    _this.processingParams.currentSequence.Origin += sequence;
                }
                if (_this.processingParams.inFeature === "COMMENT" ||
                    line.startsWith("COMMENT")) {
                    if (line.startsWith("COMMENT")) {
                        _this.processingParams.inFeature = "COMMENT";
                        _this.processingParams.currentSequence.Comment = "";
                    }
                    var comment = line.split(/COMMENT\s+/)[1].trim();
                    while (lines[i + 1].startsWith(" ")) {
                        i++;
                        comment += " " + lines[i].trim();
                    }
                    comment = comment.replace(/\s+/g, " ");
                    _this.processingParams.currentSequence.Comment = comment;
                }
            }
            throw GenbankError_1.GenbankError.InvalidSequence;
        };
        _this.resetProcessingParams = function () {
            _this.processingParams = {
                chunkNumber: 0,
                currentSequence: {},
                currentReference: {},
                currentFeature: {},
                previousFeatureName: "",
                prechunk: "",
                inFeature: ""
            };
        };
        _this.processingStatus = core_1.ProcessingStatus.NotStarted;
        return _this;
    }
    GenbankSequencesFile.prototype.toString = function () {
        // TODO: Implement
        throw new Error("Method not implemented.");
    };
    GenbankSequencesFile.prototype.getStringFeature = function (line, name) {
        var value = line.split(name)[1].trim();
        return value;
    };
    return GenbankSequencesFile;
}(core_1.SequenceFile));
exports.GenbankSequencesFile = GenbankSequencesFile;
