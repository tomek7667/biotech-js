/**
 * Information about genes and gene products, as well as regions of biological significance reported in the sequence. These can include regions of the sequence that code for proteins and RNA molecules, as well as a number of other features.
 */
export interface Feature {
    /**
     * The key of the feature. `Source` is a mandatory key in each genbank file.
     */
    name: string;
    from: number;
    to: number;
    /**
     * Example: `complement(3300..4037)` in a file. The feature extends from base 3300 through base 4037 but is actually on the complementary strand
     */
    isComplementary: boolean;
    /**
     * Example: `<1..206` in a file. The feature extends from base 1 through base 206 in the sequence shown, and is partial on the 5' end
     */
    isPartialOn5Prime: boolean;
    /**
     * Example: `4821..5028>` in a file. The feature extends from base 4821 through base 5028 and is partial on the 3' end
     */
    isPartialOn3Prime: boolean;
    /**
     * There are many different fields in a featur, all begin with a slash. For example, `/redion_name="Some name"` in a file.
     */
    slashFields: Map<string, string | undefined>;
}
