package fairfare.model;

/**
 * The result of comparing the driver's demand with the official fare.
 *
 * OOP concept: an ENUM is a special class with a fixed set of objects.
 * Each constant carries its own display text.
 */
public enum Verdict {
    FAIR("FAIR"),
    EXCESSIVE("EXCESSIVE");

    private final String label;

    Verdict(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
