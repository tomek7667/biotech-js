import { FileExtensionHandler, FileExtension } from "../file/FileExtension";

export abstract class SequenceFile {
	readonly originalPath: string;
	readonly created: Date;
	readonly format: FileExtension;
	readonly sequencesNumber: number;

	constructor(path: string) {
		this.originalPath = path;
		this.created = new Date();
		const extension = path.substring(path.lastIndexOf("."));
		this.format = FileExtensionHandler.fileExtensionToEnum(extension);
	}

	abstract process(): void;
}
