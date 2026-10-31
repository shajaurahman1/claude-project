package fairfare.ui;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.UIManager;
import javax.swing.border.Border;
import java.awt.Color;
import java.awt.Font;
import java.awt.GraphicsEnvironment;
import java.util.Arrays;
import java.util.List;

/** Colours, fonts and look-and-feel settings used across the app, kept in one place. */
public final class Theme {

    private Theme() { }   // utility class, no objects needed

    // ----- Colours -----
    public static final Color BACKGROUND     = new Color(244, 245, 247);
    public static final Color CARD           = Color.WHITE;
    public static final Color CARD_BORDER    = new Color(226, 229, 234);
    public static final Color PRIMARY        = new Color(255, 193, 7);    // auto-rickshaw yellow
    public static final Color PRIMARY_DARK   = new Color(240, 170, 0);
    public static final Color DARK           = new Color(33, 37, 41);
    public static final Color TEXT           = new Color(33, 37, 41);
    public static final Color MUTED          = new Color(108, 117, 125);
    public static final Color SECONDARY_BTN  = new Color(233, 236, 239);

    public static final Color FAIR_GREEN     = new Color(46, 125, 50);
    public static final Color FAIR_LIGHT     = new Color(232, 245, 233);
    public static final Color EXCESSIVE_RED  = new Color(198, 40, 40);
    public static final Color EXCESSIVE_LIGHT= new Color(255, 235, 238);
    public static final Color NEUTRAL_LIGHT  = new Color(241, 243, 245);

    // ----- Fonts (use the nicest font installed on this computer) -----
    private static final String FAMILY = pickFontFamily();

    public static final Font TITLE_FONT    = new Font(FAMILY, Font.BOLD, 24);
    public static final Font SUBTITLE_FONT = new Font(FAMILY, Font.PLAIN, 13);
    public static final Font HEADING_FONT  = new Font(FAMILY, Font.BOLD, 15);
    public static final Font VERDICT_FONT  = new Font(FAMILY, Font.BOLD, 34);
    public static final Font LABEL_FONT    = new Font(FAMILY, Font.PLAIN, 13);
    public static final Font BOLD_FONT     = new Font(FAMILY, Font.BOLD, 13);
    public static final Font STAT_FONT     = new Font(FAMILY, Font.BOLD, 20);
    public static final Font SMALL_FONT    = new Font(FAMILY, Font.PLAIN, 11);
    public static final Font MONO_FONT     = new Font(Font.MONOSPACED, Font.PLAIN, 13);

    private static String pickFontFamily() {
        List<String> installed = Arrays.asList(
                GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames());
        for (String name : new String[] {"Segoe UI", "Inter", "Helvetica Neue", "Roboto", "DejaVu Sans"}) {
            if (installed.contains(name)) {
                return name;
            }
        }
        return Font.SANS_SERIF;
    }

    /**
     * Switches Swing to the built-in "Nimbus" look and tunes its colours.
     * Must be called before any window is created.
     */
    public static void install() {
        try {
            for (UIManager.LookAndFeelInfo info : UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (Exception e) {
            // Keep the default look if Nimbus is not available.
        }
        UIManager.put("control", BACKGROUND);
        UIManager.put("nimbusBase", new Color(90, 96, 104));
        UIManager.put("nimbusFocus", PRIMARY_DARK);
        UIManager.put("nimbusSelectionBackground", PRIMARY_DARK);
        UIManager.put("nimbusSelection", PRIMARY_DARK);
        UIManager.put("text", TEXT);
        UIManager.put("defaultFont", LABEL_FONT);
        UIManager.put("Table.alternateRowColor", new Color(248, 249, 250));
    }

    /** Empty space around a component. */
    public static Border padding(int size) {
        return BorderFactory.createEmptyBorder(size, size, size, size);
    }

    /** A bold heading label used at the top of each card. */
    public static JLabel heading(String text) {
        JLabel label = new JLabel(text);
        label.setFont(HEADING_FONT);
        label.setForeground(TEXT);
        label.setBorder(BorderFactory.createEmptyBorder(0, 0, 10, 0));
        return label;
    }

    /** Formats an amount as "Rs 82.50". */
    public static String money(double amount) {
        return String.format("Rs %.2f", amount);
    }
}
