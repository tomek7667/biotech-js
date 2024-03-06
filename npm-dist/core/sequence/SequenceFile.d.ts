import { ProcessingStatus } from "..";
import { FileExtension } from "../file/FileExtension";
export declare abstract class SequenceFile {
    readonly originalPath: string;
    readonly created: Date;
    readonly format: FileExtension;
    sequences: unknown[];
    processingStatus?: ProcessingStatus;
    tookMs?: number;
    sequencesNumber?: number;
    private stream?;
    constructor(path: string);
    /**
     * Processes the file and returns a promise that resolves when the file is processed
     *
     * @returns Promise<void> - resolves when the file is processed
     */
    process(): Promise<void>;
    /**
     * Saves the processed file to a new file and returns the path of the new file
     *
     * @param path - optional path to save the file to
     */
    save: (path?: string) => Promise<string>;
    abstract toString(): string;
    private onError;
    private onEnd;
    private qualityCheck;
    private warn;
    abstract onData(chunk: string): void;
    abstract resetProcessingParams(): void;
    onEndCallback?(): void;
}
