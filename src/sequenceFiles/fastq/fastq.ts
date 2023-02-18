import { SequenceFile } from "../../core";

export class FastqSequenceFile extends SequenceFile {
	constructor(path: string) {
		super(path);
	}

	public process(): void {
		throw new Error("Not implemented");
	}
}
