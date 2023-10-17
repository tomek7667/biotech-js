import { SequenceFile } from "../../core";
import { FastqSequence } from "./sequence";
export declare class FastqSequenceFile extends SequenceFile {
    sequences: FastqSequence[];
    private processingParams;
    private lowestQuality;
    constructor(path: string);
    onData(chunk: string): void;
    resetProcessingParams(): void;
}
