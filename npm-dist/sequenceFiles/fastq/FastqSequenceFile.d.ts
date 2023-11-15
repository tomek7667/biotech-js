import { SequenceFile } from "../../core";
import { FastqSequence } from "./FastqSequence";
export declare class FastqSequenceFile extends SequenceFile {
    sequences: FastqSequence[];
    private processingParams;
    private lowestQuality;
    constructor(path: string);
    onData(chunk: string): void;
    resetProcessingParams(): void;
}
