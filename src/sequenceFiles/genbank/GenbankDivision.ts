/**
 * The GenBank division to which a record belongs is indicated with a three letter abbreviation - [documentaiton](https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#GenBankDivisionB)
 */
export enum GenbankDivision {
	/**
	 * primate sequences
	 */
	PRI = "PRI",

	/**
	 * rodent sequences
	 */
	ROD = "ROD",

	/**
	 * other mammalian sequences
	 */
	MAM = "MAM",

	/**
	 * other vertebrate sequences
	 */
	VRT = "VRT",

	/**
	 * invertebrate sequences
	 */
	INV = "INV",

	/**
	 * plant, fungal, and algal sequences
	 */
	PLN = "PLN",

	/**
	 * bacterial sequences
	 */
	BCT = "BCT",

	/**
	 * viral sequences
	 */
	VRL = "VRL",

	/**
	 * bacteriophage sequences
	 */
	PHG = "PHG",

	/**
	 * synthetic sequences
	 */
	SYN = "SYN",

	/**
	 * unannotated sequences
	 */
	UNA = "UNA",

	/**
	 * EST sequences (expressed sequence tags)
	 */
	EST = "EST",

	/**
	 * patent sequences
	 */
	PAT = "PAT",

	/**
	 * STS sequences (sequence tagged sites)
	 */
	STS = "STS",

	/**
	 * GSS sequences (genome survey sequences)
	 */
	GSS = "GSS",

	/**
	 * HTG sequences (high-throughput genomic sequences)
	 */
	HTG = "HTG",

	/**
	 * unfinished high-throughput cDNA sequencing
	 */
	HTC = "HTC",

	/**
	 * environmental sampling sequences
	 */
	ENV = "ENV",

	/**
	 * Not official genbank division
	 */
	Unknown = "Unknown",
}
