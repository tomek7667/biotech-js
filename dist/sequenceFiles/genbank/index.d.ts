import { SequenceFile } from "../../core";
import { GenbankSequence } from "./sequence";
export declare class GenbankSequencesFile extends SequenceFile {
    sequences: GenbankSequence[];
    private processingParams;
    constructor(path: string);
    onData(chunk: string): void;
    onEndCallback(): void;
    private _onData;
    resetProcessingParams(): void;
    private getStringFeature;
}
