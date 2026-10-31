package fairfare.ui;

import javax.swing.JLabel;
import java.awt.BorderLayout;
import java.awt.Color;

/**
 * A small card showing a caption and a big value, e.g.
 *   Official fare
 *   Rs 156.00
 * Used on the result area and the history summary.
 */
public class StatCard extends RoundedPanel {

    private final JLabel valueLabel = new JLabel("-");

    public StatCard(String caption) {
        super(new BorderLayout(0, 4), Theme.NEUTRAL_LIGHT, 14);
        setBorder(Theme.padding(12));

        JLabel captionLabel = new JLabel(caption);
        captionLabel.setFont(Theme.SMALL_FONT);
        captionLabel.setForeground(Theme.MUTED);

        valueLabel.setFont(Theme.STAT_FONT);
        valueLabel.setForeground(Theme.TEXT);

        add(captionLabel, BorderLayout.NORTH);
        add(valueLabel, BorderLayout.CENTER);
    }

    public void setValue(String value) {
        valueLabel.setText(value);
    }

    public void setValueColor(Color color) {
        valueLabel.setForeground(color);
    }
}
