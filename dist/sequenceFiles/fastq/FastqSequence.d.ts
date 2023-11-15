/**
 * The format of a fastq sequence is created accordingly to it's definition in [wikipedia](https://en.wikipedia.org/wiki/FASTQ_format#Format)
 */
export interface FastqSequence {
    sequenceIdentifier1: string;
    sequence: string;
    sequenceIdentifier2: string;
    rawQuality: string;
    quality: number[];
}
