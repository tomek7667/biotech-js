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
            currentSequence: {},
            currentLine: 0
        };
        _this.lowestQuality = "!".charCodeAt(0);
        return _this;
    }
    FastqSequenceFile.prototype.toString = function () {
        // TODO: Implement
        throw new Error("Method not implemented.");
    };
    FastqSequenceFile.prototype.onData = function (chunk) {
        var _this = this;
        var lines = chunk.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            switch (this.processingParams.currentLine) {
                case 0: {
                    if (this.processingParams.currentSequence.sequence &&
                        this.processingParams.currentSequence.rawQuality) {
                        this.sequences.push(this.processingParams.currentSequence);
                    }
                    this.processingParams.currentSequence = {
                        sequenceIdentifier1: line.substring(1),
                        sequence: "",
                        sequenceIdentifier2: "",
                        rawQuality: "",
                        quality: []
                    };
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
    };
    FastqSequenceFile.prototype.resetProcessingParams = function () {
        this.processingParams = {
            preChunk: "",
            currentSequence: {},
            currentLine: 0
        };
    };
    return FastqSequenceFile;
}(core_1.SequenceFile));
exports.FastqSequenceFile = FastqSequenceFile;
