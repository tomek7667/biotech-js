"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SequenceFile = void 0;
var __1 = require("..");
var fs_1 = require("fs");
var FileExtension_1 = require("../file/FileExtension");
var promises_1 = require("fs/promises");
var SequenceFile = /** @class */ (function () {
    function SequenceFile(path) {
        var _this = this;
        this.sequences = [];
        /**
         * Saves the processed file to a new file and returns the path of the new file
         *
         * @param path - optional path to save the file to
         */
        this.save = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var outputPath, firstPart, extension, string;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        outputPath = "";
                        if (path) {
                            outputPath = path;
                        }
                        else {
                            firstPart = this.originalPath.substring(0, this.originalPath.lastIndexOf("."));
                            extension = this.originalPath.substring(this.originalPath.lastIndexOf("."));
                            outputPath = "".concat(firstPart, "_processed").concat(extension);
                        }
                        string = this.toString();
                        return [4 /*yield*/, (0, promises_1.writeFile)(outputPath, string)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, outputPath];
                }
            });
        }); };
        this.qualityCheck = function () {
            var invalidSequences = 0;
            var isQualityOk = true;
            switch (_this.format) {
                case FileExtension_1.FileExtension.Fasta: {
                    var sequences = _this.sequences;
                    sequences.forEach(function (data) {
                        if (data.sequence === null || data.sequence === undefined) {
                            invalidSequences++;
                            isQualityOk = false;
                        }
                    });
                    break;
                }
                case FileExtension_1.FileExtension.Fastq: {
                    var sequences = _this.sequences;
                    sequences.forEach(function (data) {
                        if (data.sequence === null ||
                            data.sequence === undefined ||
                            data.quality === null ||
                            data.quality === undefined) {
                            invalidSequences++;
                            isQualityOk = false;
                        }
                    });
                    break;
                }
                case FileExtension_1.FileExtension.Genbank: {
                    var sequences = _this.sequences;
                    sequences.forEach(function (data) {
                        if (data.Origin === null ||
                            data.Origin === undefined ||
                            data.Locus === null ||
                            data.Locus === undefined ||
                            data.Locus.Name === null ||
                            data.Locus.Name === undefined) {
                            invalidSequences++;
                            isQualityOk = false;
                        }
                    });
                    break;
                }
                default: {
                    _this.warn("Unknown file extension. Skipping quality check.");
                    break;
                }
            }
            if (!isQualityOk) {
                _this.warn("Quality check failed for ".concat(_this.format, ":").concat(_this.originalPath, ". Invalid sequences: ").concat(invalidSequences, "/").concat(_this.sequences.length));
                _this.processingStatus =
                    __1.ProcessingStatus.SuccessFinishedWithWarnings;
            }
            if (invalidSequences === _this.sequences.length ||
                invalidSequences === _this.sequencesNumber) {
                _this.processingStatus = __1.ProcessingStatus.FailedFinished;
            }
        };
        this.warn = function (str) {
            console.log("[WARNING] ".concat(str));
        };
        this.originalPath = path;
        this.created = new Date();
        var extension = path.substring(path.lastIndexOf("."));
        this.format = FileExtension_1.FileExtensionHandler.fileExtensionToEnum(extension);
    }
    /**
     * Processes the file and returns a promise that resolves when the file is processed
     *
     * @returns Promise<void> - resolves when the file is processed
     */
    SequenceFile.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var start;
            var _this = this;
            return __generator(this, function (_a) {
                start = Date.now();
                this.processingStatus = __1.ProcessingStatus.InProgress;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.stream = (0, fs_1.createReadStream)(_this.originalPath, {
                            encoding: "utf8"
                        });
                        _this.stream.on("data", function (chunk) {
                            _this.onData(chunk);
                        });
                        _this.stream.on("error", function (error) {
                            _this.onError(error);
                            _this.tookMs = Date.now() - start;
                            return reject(error);
                        });
                        _this.stream.on("end", function () {
                            _this.onEnd();
                            _this.tookMs = Date.now() - start;
                            return resolve();
                        });
                    })];
            });
        });
    };
    SequenceFile.prototype.onError = function (error) {
        this.processingStatus = __1.ProcessingStatus.FailedFinished;
        console.error(error);
    };
    SequenceFile.prototype.onEnd = function () {
        var _a;
        (_a = this.onEndCallback) === null || _a === void 0 ? void 0 : _a.call(this);
        this.resetProcessingParams();
        this.sequencesNumber = this.sequences.length;
        this.processingStatus = __1.ProcessingStatus.SuccessFinished;
        this.qualityCheck();
    };
    return SequenceFile;
}());
exports.SequenceFile = SequenceFile;
