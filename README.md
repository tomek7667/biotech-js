# biotech-js

[Documentation](https://biotech-js.cyber-man.pl/)

Package initially developed at and for A&amp;A Biotechnology for reading all kinds of biotechnology related files.

Currently it supports fastq, fasta and genbank files.

## Quick use:

```typescript
import {
	GenbankSequencesFile,
	FastaSequencesFile,
	FastqSequencesFile,
} from "biotech-js";

// Loading genbank files:
const genbankFile = new GenbankSequencesFile("path/to/file.gb");
await genbankFile.process();
console.log(genbankFile.processingStatus);
console.log(genbankFile.sequences);

// Loading fasta files:
const fastaFile = new FastaSequencesFile("path/to/file.fa");
await fastaFile.process();
console.log(fastaFile.processingStatus);
console.log(fastaFile.sequences);

// Loading fastq files:
const fastqFile = new FastqSequencesFile("path/to/file.fq");
await fastqFile.process();
console.log(fastqFile.processingStatus);
console.log(fastqFile.sequences);
```

### Deployment

When deploying the library to npm run:

```bash
yarn b
```
