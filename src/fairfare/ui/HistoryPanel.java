package fairfare.ui;

import fairfare.model.Trip;
import fairfare.model.Verdict;
import fairfare.storage.TripHistory;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.FlowLayout;
import java.io.IOException;

/** Shows every saved fare check, newest first, with a short summary. */
public class HistoryPanel extends JPanel implements Refreshable {

    private static final String[] COLUMNS = {
        "Date & Time", "City", "Pickup", "Destination", "Km",
        "Waiting (min)", "Night", "Official (Rs)", "Demanded (Rs)", "Difference (Rs)", "Verdict"
    };
    private static final int VERDICT_COLUMN = 10;

    private final TripHistory history;
    private final JLabel summaryLabel = new JLabel();

    // Table cells are read-only.
    private final DefaultTableModel tableModel = new DefaultTableModel(COLUMNS, 0) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };

    public HistoryPanel(TripHistory history) {
        this.history = history;
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));

        JTable table = new JTable(tableModel);
        table.setRowHeight(24);
        table.getColumnModel().getColumn(0).setPreferredWidth(130);   // date
        table.getColumnModel().getColumn(VERDICT_COLUMN).setCellRenderer(new VerdictRenderer());

        JButton clearButton = new JButton("Clear History");
        clearButton.addActionListener(e -> onClear());

        summaryLabel.setFont(Theme.BOLD_FONT);
        JPanel bottom = new JPanel(new BorderLayout());
        bottom.add(summaryLabel, BorderLayout.WEST);
        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttons.add(clearButton);
        bottom.add(buttons, BorderLayout.EAST);

        add(new JScrollPane(table), BorderLayout.CENTER);
        add(bottom, BorderLayout.SOUTH);
        refresh();
    }

    @Override
    public void refresh() {
        tableModel.setRowCount(0);
        for (Trip t : history.getTrips()) {
            tableModel.addRow(new Object[] {
                t.getFormattedDate(), t.getCity(), t.getPickup(), t.getDestination(),
                String.format("%.2f", t.getDistanceKm()), t.getWaitingMinutes(),
                t.isNightTrip() ? "Yes" : "No",
                String.format("%.2f", t.getOfficialFare()),
                String.format("%.2f", t.getDemandedFare()),
                String.format("%+.2f", t.getDifference()),
                t.getVerdict().getLabel()
            });
        }
        summaryLabel.setText(String.format(
                "Total checks: %d   |   Excessive: %d   |   Total overcharge caught: %s",
                history.getTotalChecks(), history.getExcessiveCount(),
                Theme.money(history.getTotalOvercharge())));
    }

    private void onClear() {
        int answer = JOptionPane.showConfirmDialog(this,
                "Delete all trip history? This cannot be undone.",
                "Clear history", JOptionPane.YES_NO_OPTION);
        if (answer == JOptionPane.YES_OPTION) {
            try {
                history.clear();
            } catch (IOException e) {
                JOptionPane.showMessageDialog(this, "Could not clear history: " + e.getMessage());
            }
            refresh();
        }
    }

    /** Colours the Verdict cell green (FAIR) or red (EXCESSIVE). */
    private static class VerdictRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, boolean selected,
                                                       boolean focused, int row, int column) {
            Component cell = super.getTableCellRendererComponent(table, value, selected, focused, row, column);
            boolean fair = Verdict.FAIR.getLabel().equals(value);
            cell.setBackground(fair ? Theme.FAIR_GREEN : Theme.EXCESSIVE_RED);
            cell.setForeground(Color.WHITE);
            setHorizontalAlignment(CENTER);
            return cell;
        }
    }
}
