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
exports.__esModule = true;
exports.FastqSequenceFile = void 0;
var core_1 = require("../../core");
var FastqSequenceFile = /** @class */ (function (_super) {
    __extends(FastqSequenceFile, _super);
    function FastqSequenceFile(path) {
        var _this = _super.call(this, path) || this;
        _this.sequences = [];
        _this.processingParams = {
            preChunk: "",
            currentSequence: {
                quality: [],
                rawQuality: "",
                sequence: "",
                sequenceIdentifier1: "",
                sequenceIdentifier2: ""
            },
            currentLine: 0,
            gatheredFastqData: ""
        };
        _this.lowestQuality = "!".charCodeAt(0);
        return _this;
    }
    FastqSequenceFile.prototype.toString = function () {
        var content = this.sequences
            .map(function (_a) {
            var sequenceIdentifier1 = _a.sequenceIdentifier1, sequence = _a.sequence, sequenceIdentifier2 = _a.sequenceIdentifier2, rawQuality = _a.rawQuality;
            return "@".concat(sequenceIdentifier1, "\n").concat(sequence, "\n+").concat(sequenceIdentifier2, "\n").concat(rawQuality, "\n");
        })
            .join("");
        return content;
    };
    FastqSequenceFile.prototype.onData = function (chunk) {
        this.processingParams.gatheredFastqData += chunk;
    };
    FastqSequenceFile.prototype.onEndCallback = function () {
        var _this = this;
        var lines = this.processingParams.gatheredFastqData.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            switch (this.processingParams.currentLine) {
                case 0: {
                    if (this.processingParams.currentSequence.sequence !== "" &&
                        this.processingParams.currentSequence.rawQuality !== "") {
                        this.sequences.push(this.processingParams.currentSequence);
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
                            .map(function (char) {
                            return char.charCodeAt(0) - _this.lowestQuality;
                        });
                    break;
                }
            }
            this.processingParams.currentLine =
                (this.processingParams.currentLine + 1) % 4;
        }
        this.sequences.push(this.processingParams.currentSequence);
        this.removeEmptySequences();
    };
    FastqSequenceFile.prototype.resetProcessingParams = function () {
        this.processingParams = {
            preChunk: "",
            currentSequence: {
                quality: [],
                rawQuality: "",
                sequence: "",
                sequenceIdentifier1: "",
                sequenceIdentifier2: ""
            },
            currentLine: 0,
            gatheredFastqData: ""
        };
    };
    FastqSequenceFile.prototype.removeEmptySequences = function () {
        this.sequences = this.sequences.filter(function (_a) {
            var sequence = _a.sequence;
            return sequence.length > 0;
        });
    };
    return FastqSequenceFile;
}(core_1.SequenceFile));
exports.FastqSequenceFile = FastqSequenceFile;
