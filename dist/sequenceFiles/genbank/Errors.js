"use strict";
exports.__esModule = true;
exports.GenbankError = void 0;
var GenbankError;
(function (GenbankError) {
    GenbankError["WrongSequenceHeader"] = "Wrong sequence header";
    GenbankError["SeparatorNotFound"] = "Separator not found";
    GenbankError["CorruptedFeatureNumber"] = "Corrupted feature number";
    GenbankError["CurrentFeatureNotInitialized"] = "Current feature is not initialized";
})(GenbankError = exports.GenbankError || (exports.GenbankError = {}));
