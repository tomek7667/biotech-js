import { SequenceFile } from "../../core";
import { GenbankSequence } from "./sequence";
export declare class GenbankSequencesFile extends SequenceFile {
    sequences: GenbankSequence[];
    private processingParams;
    constructor(path: string);
    onData(chunk: string): void;
    resetProcessingParams(): void;
    private getStringFeature;
}
