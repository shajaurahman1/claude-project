package fairfare.ui;

import javax.swing.JPanel;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.LayoutManager;
import java.awt.RenderingHints;

/**
 * A panel with rounded corners, used for the white "cards" on every screen.
 *
 * OOP concept: INHERITANCE + METHOD OVERRIDING - it extends Swing's JPanel
 * and overrides paintComponent() to draw its own rounded background.
 */
public class RoundedPanel extends JPanel {

    private final int radius;
    private Color borderColor;

    public RoundedPanel(LayoutManager layout, Color background, int radius) {
        super(layout);
        this.radius = radius;
        setBackground(background);
        setOpaque(false);              // we paint the background ourselves
        setBorder(Theme.padding(16));
    }

    /** Creates a standard white card with a thin grey outline. */
    public static RoundedPanel card(LayoutManager layout) {
        RoundedPanel card = new RoundedPanel(layout, Theme.CARD, 16);
        card.setBorderColor(Theme.CARD_BORDER);
        return card;
    }

    public void setBorderColor(Color borderColor) {
        this.borderColor = borderColor;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(getBackground());
        g2.fillRoundRect(0, 0, getWidth() - 1, getHeight() - 1, radius, radius);
        if (borderColor != null) {
            g2.setColor(borderColor);
            g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, radius, radius);
        }
        g2.dispose();
        super.paintComponent(g);
    }
}
