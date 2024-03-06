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
exports.FastaSequenceFile = void 0;
var core_1 = require("../../core");
var FastaSequenceFile = /** @class */ (function (_super) {
    __extends(FastaSequenceFile, _super);
    function FastaSequenceFile(path) {
        var _this = _super.call(this, path) || this;
        _this.sequences = [];
        _this.processingParams = {
            currentSequence: {
                description: "",
                sequence: ""
            },
            gatheredFastaData: ""
        };
        return _this;
    }
    FastaSequenceFile.prototype.toString = function () {
        var content = this.sequences
            .map(function (_a) {
            var description = _a.description, sequence = _a.sequence;
            // additionally remove all newlines
            var sequenceText = ">".concat(description
                .replace(/\n/g, "")
                .replace(/\r/g, ""), "\n");
            for (var i = 0; i < sequence.length; i += 60) {
                sequenceText += sequence.slice(i, i + 60) + "\n";
            }
            return sequenceText;
        })
            .join("");
        return content;
    };
    FastaSequenceFile.prototype.onData = function (chunk) {
        this.processingParams.gatheredFastaData += chunk;
    };
    FastaSequenceFile.prototype.onEndCallback = function () {
        var lines = this.processingParams.gatheredFastaData.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.startsWith(">")) {
                if (this.processingParams.currentSequence.sequence !== "" &&
                    this.processingParams.currentSequence.description !== "") {
                    this.sequences.push(this.processingParams.currentSequence);
                }
                this.processingParams.currentSequence = {
                    description: line.substring(1),
                    sequence: ""
                };
            }
            else {
                this.processingParams.currentSequence.sequence += line
                    .replace(/\s/g, "")
                    .toUpperCase();
            }
        }
        this.sequences.push(this.processingParams.currentSequence);
        this.removeEmptySequences();
    };
    FastaSequenceFile.prototype.resetProcessingParams = function () {
        this.processingParams = {
            currentSequence: {
                description: "",
                sequence: ""
            },
            gatheredFastaData: ""
        };
    };
    FastaSequenceFile.prototype.removeEmptySequences = function () {
        this.sequences = this.sequences.filter(function (_a) {
            var sequence = _a.sequence, description = _a.description;
            return sequence.length > 0 && description.length > 0;
        });
    };
    return FastaSequenceFile;
}(core_1.SequenceFile));
exports.FastaSequenceFile = FastaSequenceFile;
