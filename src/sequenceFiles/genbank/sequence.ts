import { Feature } from "./Feature";
import { GenbankDivision } from "./GenbankDivision";

export interface GenbankSequence {
	/**
	 * The LOCUS field contains a number of different data elements
	 */
	Locus: {
		/**
		 * The locus name was originally designed to help group entries with similar sequences: the first three characters usually designated the organism; the fourth and fifth characters were used to show other group designations, such as gene product; for segmented entries, the last character was one of a series of sequential integers
		 */
		Name: string;

		/**
		 * There is no maximum limit on the size of a sequence that can be submitted to GenBank. You can submit a whole genome if you have a contiguous piece of sequence from a single molecule type. However, there is a limit of 350 kb on an individual GenBank record. More on that [here](https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#SequenceLengthB).
		 */
		SequenceLength: number;

		/**
		 * DNA, RNA, or protein. If "linear" provided it means that it is a DNA sequence.
		 */
		MoleculeType: string;

		/**
		 * The GenBank division to which a record belongs is indicated with a three letter abbreviation.
		 */
		GenbankDivision: GenbankDivision;

		/**
		 * The date in the LOCUS field is the date of last modification. In some cases, the modification date might correspond to the release date, but there is no way to tell just by looking at the record.
		 */
		ModificationDate: Date;
	};

	/**
	 * Brief description of sequence; includes information such as source organism, gene name/protein name, or some description of the sequence's function (if the sequence is non-coding). If the sequence has a coding region (CDS), description may be followed by a completeness qualifier, such as "complete cds".
	 */
	Definition: string;

	/**
	 * The unique identifier for a sequence record. An accession number applies to the complete record and is usually a combination of a letter(s) and numbers, such as a single letter followed by five digits (e.g., U12345) or two letters followed by six digits (e.g., AF123456). Some accessions might be longer, depending on the type of sequence record. More on accession [here](https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#AccessionB)
	 */
	Accession: string;

	/**
	 * A nucleotide sequence identification number that represents a single, specific sequence in the GenBank database. This identification number uses the accession.version format implemented by GenBank/EMBL/DDBJ in February 1999.
	 */
	Version: string;

	/**
	 * This is not an official field in the NCBI documentation, however it occurs in some Genbank files.
	 */
	DbSource?: {
		UniProtKB: string;
		class: string;
		created: Date;
		SequenceUpdateDate: Date;
		AnnotationUpdateDate: Date;
		xrefsSequenceDatabases: string[];
		xrefsNonSequenceDatabases: string[];
	};

	/**
	 * Word or phrase describing the sequence.
	 */
	Keywords: string[];

	/**
	 * Free-format information including an abbreviated form of the organism name, sometimes followed by a molecule type.
	 */
	Source: {
		text: string;

		/**
		 * The formal scientific name for the source organism (genus and species, where appropriate) and its lineage, based on the phylogenetic classification scheme used in the NCBI Taxonomy Database.
		 */
		Organism: string[];
	};

	/**
	 * Publications by the authors of the sequence that discuss the data reported in the record. References are automatically sorted within the record based on date of publication, showing the oldest references first.
	 */
	References: {
		text: string;

		/**
		 * List of authors in the order in which they appear in the cited article.
		 */
		Authors: string[];

		/**
		 * Title of the published work or tentative title of an unpublished work.
		 */
		Title: string;

		/**
		 * MEDLINE abbreviation of the journal name. (Full spellings can be obtained from the Entrez [Journals Database](https://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=Journals).)
		 */
		Journal: string;

		/**
		 * PubMed Identifier (PMID). References that include PubMed IDs contain links from the sequence record to the corresponding PubMed record.
		 */
		PubMed: string;

		/**
		 * The inconsistency of genbank format forces us to use this field to store other fields.
		 */
		OtherFields: string[];
	}[];

	/**
	 * This is not an official field in the NCBI documentation, however it occurs in some Genbank files.
	 */
	Comment?: string;

	/**
	 * Information about genes and gene products, as well as regions of biological significance reported in the sequence. These can include regions of the sequence that code for proteins and RNA molecules, as well as a number of other features.
	 */
	Features: Feature[];

	/**
	 * The sequence data. The sequence data is stored in the same order as it appears in the record. The sequence data is not broken into lines, and there is no space between the sequence characters. All characters in the sequence are uppercase, unlike in the original GenBank file.
	 */
	Origin: string;
}
