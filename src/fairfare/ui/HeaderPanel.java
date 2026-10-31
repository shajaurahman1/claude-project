package fairfare.ui;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;

/** The yellow strip at the top of the window with the app name. */
public class HeaderPanel extends JPanel {

    public HeaderPanel() {
        super(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(14, 22, 14, 22));
        setPreferredSize(new Dimension(100, 72));

        JLabel title = new JLabel("FairFare");
        title.setFont(Theme.TITLE_FONT);
        title.setForeground(Theme.DARK);

        JLabel subtitle = new JLabel("Auto-Rickshaw Fare Checker  -  know the right fare before you pay");
        subtitle.setFont(Theme.SUBTITLE_FONT);
        subtitle.setForeground(Theme.DARK);

        JPanel text = new JPanel();
        text.setOpaque(false);
        text.setLayout(new BoxLayout(text, BoxLayout.Y_AXIS));
        text.add(title);
        text.add(subtitle);
        add(text, BorderLayout.WEST);
    }

    /** Paints a soft yellow-to-amber gradient as the background. */
    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setPaint(new GradientPaint(0, 0, Theme.PRIMARY, getWidth(), 0, Theme.PRIMARY_DARK));
        g2.fillRect(0, 0, getWidth(), getHeight());
    }
}
