package fairfare.ui;

import javax.swing.JButton;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

/**
 * A flat button with rounded corners that darkens when the mouse is over it.
 * Overrides paintComponent() like RoundedPanel does.
 */
public class StyledButton extends JButton {

    private final Color normal;
    private final Color hover;

    public StyledButton(String text, Color normal, Color hover, Color textColor) {
        super(text);
        this.normal = normal;
        this.hover = hover;
        setForeground(textColor);
        setFont(Theme.BOLD_FONT);
        setContentAreaFilled(false);   // we draw the background ourselves
        setBorderPainted(false);
        setFocusPainted(false);
        setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        setPreferredSize(new Dimension(140, 36));
    }

    /** Yellow main-action button. */
    public static StyledButton primary(String text) {
        return new StyledButton(text, Theme.PRIMARY, Theme.PRIMARY_DARK, Theme.DARK);
    }

    /** Light grey button for less important actions. */
    public static StyledButton secondary(String text) {
        return new StyledButton(text, Theme.SECONDARY_BTN, new Color(218, 222, 226), Theme.TEXT);
    }

    /** Red button for deleting things. */
    public static StyledButton danger(String text) {
        return new StyledButton(text, Theme.EXCESSIVE_LIGHT, new Color(255, 205, 210), Theme.EXCESSIVE_RED);
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        boolean active = getModel().isRollover() || getModel().isPressed();
        g2.setColor(active ? hover : normal);
        g2.fillRoundRect(0, 0, getWidth(), getHeight(), 12, 12);
        g2.dispose();
        super.paintComponent(g);       // draws the text on top
    }
}
