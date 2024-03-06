import { SequenceFile } from "../../core";
import { GenbankSequence } from "./GenbankSequence";
export declare class GenbankSequencesFile extends SequenceFile {
    sequences: GenbankSequence[];
    private processingParams;
    constructor(path: string);
    onData: (chunk: string) => void | GenbankSequence;
    toString(): string;
    private processSequence;
    resetProcessingParams: () => void;
    private getStringFeature;
}
