package fairfare.ui;

import fairfare.model.Trip;
import fairfare.model.Verdict;
import fairfare.storage.TripHistory;

import javax.swing.BorderFactory;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.io.IOException;

/** Shows every saved fare check, newest first, with a short summary. */
public class HistoryPanel extends JPanel implements Refreshable {

    private static final String[] COLUMNS = {
        "Date & Time", "City", "Pickup", "Destination", "Km",
        "Waiting (min)", "Night", "Official (Rs)", "Demanded (Rs)", "Difference (Rs)", "Verdict"
    };
    private static final int VERDICT_COLUMN = 10;

    private final TripHistory history;

    private final StatCard totalCard = new StatCard("Total checks");
    private final StatCard fairCard = new StatCard("Fair");
    private final StatCard excessiveCard = new StatCard("Excessive");
    private final StatCard overchargeCard = new StatCard("Total overcharge caught");

    // Table cells are read-only.
    private final DefaultTableModel tableModel = new DefaultTableModel(COLUMNS, 0) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };

    public HistoryPanel(TripHistory history) {
        this.history = history;
        setLayout(new BorderLayout(14, 14));
        setBackground(Theme.BACKGROUND);
        setBorder(Theme.padding(14));

        // Summary cards on top
        JPanel stats = new JPanel(new GridLayout(1, 4, 12, 0));
        stats.setOpaque(false);
        stats.add(totalCard);
        stats.add(fairCard);
        stats.add(excessiveCard);
        stats.add(overchargeCard);
        fairCard.setValueColor(Theme.FAIR_GREEN);
        excessiveCard.setValueColor(Theme.EXCESSIVE_RED);
        overchargeCard.setValueColor(Theme.EXCESSIVE_RED);

        // Table of trips
        JTable table = new JTable(tableModel);
        table.setRowHeight(30);
        table.setShowGrid(false);
        table.getTableHeader().setFont(Theme.BOLD_FONT);
        table.getColumnModel().getColumn(0).setPreferredWidth(130);   // date
        table.getColumnModel().getColumn(VERDICT_COLUMN).setCellRenderer(new VerdictRenderer());
        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder());
        scroll.getViewport().setBackground(Theme.CARD);

        StyledButton clearButton = StyledButton.danger("Clear History");
        clearButton.addActionListener(e -> onClear());
        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        buttons.setOpaque(false);
        buttons.add(clearButton);

        RoundedPanel card = RoundedPanel.card(new BorderLayout(0, 12));
        card.setBorder(Theme.padding(18));
        card.add(Theme.heading("Trip history"), BorderLayout.NORTH);
        card.add(scroll, BorderLayout.CENTER);
        card.add(buttons, BorderLayout.SOUTH);

        add(stats, BorderLayout.NORTH);
        add(card, BorderLayout.CENTER);
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
        int total = history.getTotalChecks();
        int excessive = history.getExcessiveCount();
        totalCard.setValue(String.valueOf(total));
        fairCard.setValue(String.valueOf(total - excessive));
        excessiveCard.setValue(String.valueOf(excessive));
        overchargeCard.setValue(Theme.money(history.getTotalOvercharge()));
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

    /** Shows the Verdict cell in green (FAIR) or red (EXCESSIVE). */
    private static class VerdictRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, boolean selected,
                                                       boolean focused, int row, int column) {
            Component cell = super.getTableCellRendererComponent(table, value, selected, focused, row, column);
            boolean fair = Verdict.FAIR.getLabel().equals(value);
            cell.setBackground(fair ? Theme.FAIR_LIGHT : Theme.EXCESSIVE_LIGHT);
            cell.setForeground(fair ? Theme.FAIR_GREEN : Theme.EXCESSIVE_RED);
            cell.setFont(Theme.BOLD_FONT);
            setHorizontalAlignment(CENTER);
            return cell;
        }
    }
}
