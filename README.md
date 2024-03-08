# biotech-js

[Documentation](https://biotech-js.cyber-man.pl/)

Package initially developed at and for A&amp;A Biotechnology for reading all kinds of biotechnology related files.

Currently it supports fastq, fasta and genbank files.

## Usage

### Reading `Fasta` file

```typescript
import { FastaSequenceFile, ProcessingStatus } from "biotech-js";

const file = new FastaSequenceFile("path/to/file.fa");
await file.process();

expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
expect(file.sequences.length).toBe(12345);
expect(file.tookMs).toBeLessThan(1000);

await file.save();
// Default output path is "path/to/file_processed.fa"
// But you can customize it by passing a path to the save method
await file.save("path/to/file2.fa");
```

### Reading `Fastq` file

```typescript
import { FastqSequenceFile, ProcessingStatus } from "biotech-js";

const file = new FastqSequenceFile("path/to/file1.fastq");
await file.process();

expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
expect(file.sequences.length).toBe(12345);
expect(file.tookMs).toBeLessThan(1000);

await file.save("path/to/file2.fastq");
```

### Reading `Genbank` file

```typescript
import { GenbankSequencesFile, ProcessingStatus } from "biotech-js";

const file = new GenbankSequencesFile("path/to/file1.gb");
await file.process();

expect(file.processingStatus).toBe(ProcessingStatus.SuccessFinished);
expect(file.sequences.length).toBe(12345);
expect(file.tookMs).toBeLessThan(1000);

await file.save("path/to/file2.gb");
```

### Detecting file extension

```typescript
import { FileExtensionHandler } from "biotech-js";

const path = "path/to/file.fa";
const pathExtension = path.split(".").pop();

const extension = FileExtensionHandler.fileExtensionToEnum(pathExtension);
console.log(extension);
// Output: Fasta
```

### Deployment

When deploying the library to npm run:

```bash
yarn b
```
