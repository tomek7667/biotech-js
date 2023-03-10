import { SequenceFile } from "../../core";
import { FastaSequence } from "./sequence";
export declare class FastaSequenceFile extends SequenceFile {
    sequences: FastaSequence[];
    private processingParams;
    constructor(path: string);
    onData(chunk: string): void;
    resetProcessingParams(): void;
}
