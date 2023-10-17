# biotech-js

Package developed at A&amp;A Biotechnology for reading all kinds of biotechnology related files.

Currently it supports fastq, fasta and genbank files.

## Usage

```typescript
import {
	GenbankSequencesFile,
	FastaSequencesFile,
	FastqSequencesFile,
} from "biotech-js";

const genbankFile = new GenbankSequencesFile("path/to/file.gb");
await genbankFile.process();
console.log(genbankFile.processingStatus);
console.log(genbankFile.sequences);

const fastaFile = new FastaSequencesFile("path/to/file.fa");
await fastaFile.process();
console.log(fastaFile.processingStatus);
console.log(fastaFile.sequences);

const fastqFile = new FastqSequencesFile("path/to/file.fq");
await fastqFile.process();
console.log(fastqFile.processingStatus);
console.log(fastqFile.sequences);
```
