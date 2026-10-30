package fairfare.ui;

import java.awt.Color;
import java.awt.Font;

/** Colours and fonts used across the app, kept in one place. */
public final class Theme {

    private Theme() { }   // utility class, no objects needed

    public static final Color FAIR_GREEN      = new Color(46, 125, 50);
    public static final Color EXCESSIVE_RED   = new Color(198, 40, 40);
    public static final Color HEADER_YELLOW   = new Color(255, 193, 7);   // auto-rickshaw yellow
    public static final Color HEADER_TEXT     = new Color(33, 33, 33);
    public static final Color NEUTRAL_GREY    = new Color(120, 120, 120);

    public static final Font TITLE_FONT   = new Font("SansSerif", Font.BOLD, 22);
    public static final Font VERDICT_FONT = new Font("SansSerif", Font.BOLD, 30);
    public static final Font LABEL_FONT   = new Font("SansSerif", Font.PLAIN, 14);
    public static final Font BOLD_FONT    = new Font("SansSerif", Font.BOLD, 14);
    public static final Font MONO_FONT    = new Font("Monospaced", Font.PLAIN, 13);

    /** Formats an amount as "Rs 82.50". */
    public static String money(double amount) {
        return String.format("Rs %.2f", amount);
    }
}
