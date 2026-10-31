package fairfare.ui;

import fairfare.model.CityRate;
import fairfare.storage.RateRepository;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.io.IOException;

/**
 * Lets the user view and update the official fare rates of each city.
 * Selecting a row fills the form; "Save" adds a new city or updates it.
 */
public class RatesPanel extends JPanel implements Refreshable {

    private static final String[] COLUMNS = {
        "City", "Minimum fare (Rs)", "Minimum km", "Per km (Rs)",
        "Waiting per min (Rs)", "Night %", "Night from", "Night to"
    };

    private final RateRepository repository;
    private final JTable table;
    private final DefaultTableModel tableModel = new DefaultTableModel(COLUMNS, 0) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };

    private final JTextField cityField = new JTextField();
    private final JTextField minFareField = new JTextField();
    private final JTextField minKmField = new JTextField();
    private final JTextField perKmField = new JTextField();
    private final JTextField waitingField = new JTextField();
    private final JTextField nightPercentField = new JTextField();
    private final JTextField nightStartField = new JTextField();
    private final JTextField nightEndField = new JTextField();

    public RatesPanel(RateRepository repository) {
        this.repository = repository;
        setLayout(new BorderLayout(14, 14));
        setBackground(Theme.BACKGROUND);
        setBorder(Theme.padding(14));

        table = new JTable(tableModel);
        table.setRowHeight(30);
        table.setShowGrid(false);
        table.getTableHeader().setFont(Theme.BOLD_FONT);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                fillFormFromSelection();
            }
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder());
        scroll.getViewport().setBackground(Theme.CARD);

        RoundedPanel tableCard = RoundedPanel.card(new BorderLayout());
        tableCard.setBorder(Theme.padding(18));
        tableCard.add(Theme.heading("Official fare rates by city"), BorderLayout.NORTH);
        tableCard.add(scroll, BorderLayout.CENTER);

        add(tableCard, BorderLayout.CENTER);
        add(buildForm(), BorderLayout.SOUTH);
        refresh();
    }

    private JPanel buildForm() {
        JPanel fields = new JPanel(new GridLayout(2, 8, 10, 4));
        fields.setOpaque(false);
        String[] labels = {"City", "Minimum fare (Rs)", "Minimum km", "Per km (Rs)",
                           "Waiting/min (Rs)", "Night %", "Night from (0-23)", "Night to (0-23)"};
        for (String label : labels) {
            JLabel l = new JLabel(label);
            l.setFont(Theme.SMALL_FONT);
            l.setForeground(Theme.MUTED);
            fields.add(l);
        }
        fields.add(cityField);
        fields.add(minFareField);
        fields.add(minKmField);
        fields.add(perKmField);
        fields.add(waitingField);
        fields.add(nightPercentField);
        fields.add(nightStartField);
        fields.add(nightEndField);

        StyledButton saveButton = StyledButton.primary("Save / Update");
        saveButton.addActionListener(e -> onSave());
        StyledButton deleteButton = StyledButton.danger("Delete City");
        deleteButton.addActionListener(e -> onDelete());
        StyledButton newButton = StyledButton.secondary("New City");
        newButton.addActionListener(e -> clearForm());

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        buttons.setOpaque(false);
        buttons.add(newButton);
        buttons.add(deleteButton);
        buttons.add(saveButton);

        RoundedPanel form = RoundedPanel.card(new BorderLayout(0, 12));
        form.setBorder(Theme.padding(18));
        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);
        top.add(Theme.heading("Add or update fare rates"), BorderLayout.NORTH);
        top.add(fields, BorderLayout.CENTER);
        form.add(top, BorderLayout.CENTER);
        form.add(buttons, BorderLayout.SOUTH);
        return form;
    }

    @Override
    public void refresh() {
        tableModel.setRowCount(0);
        for (CityRate r : repository.getAllRates()) {
            tableModel.addRow(new Object[] {
                r.getCityName(), r.getMinimumFare(), r.getMinimumDistance(), r.getPerKmRate(),
                r.getWaitingPerMinute(), r.getNightPercent(),
                String.format("%02d:00", r.getNightStartHour()),
                String.format("%02d:00", r.getNightEndHour())
            });
        }
    }

    private void fillFormFromSelection() {
        int row = table.getSelectedRow();
        if (row < 0) {
            return;
        }
        CityRate r = repository.getRate((String) tableModel.getValueAt(row, 0));
        if (r == null) {
            return;
        }
        cityField.setText(r.getCityName());
        minFareField.setText(String.valueOf(r.getMinimumFare()));
        minKmField.setText(String.valueOf(r.getMinimumDistance()));
        perKmField.setText(String.valueOf(r.getPerKmRate()));
        waitingField.setText(String.valueOf(r.getWaitingPerMinute()));
        nightPercentField.setText(String.valueOf(r.getNightPercent()));
        nightStartField.setText(String.valueOf(r.getNightStartHour()));
        nightEndField.setText(String.valueOf(r.getNightEndHour()));
    }

    private void onSave() {
        try {
            CityRate rate = new CityRate(
                    cityField.getText(),
                    Double.parseDouble(minFareField.getText().trim()),
                    Double.parseDouble(minKmField.getText().trim()),
                    Double.parseDouble(perKmField.getText().trim()),
                    Double.parseDouble(waitingField.getText().trim()),
                    Double.parseDouble(nightPercentField.getText().trim()),
                    Integer.parseInt(nightStartField.getText().trim()),
                    Integer.parseInt(nightEndField.getText().trim()));
            repository.saveRate(rate);
            refresh();
            JOptionPane.showMessageDialog(this, "Rates saved for " + rate.getCityName() + ".");
        } catch (NumberFormatException e) {
            showError("Please enter valid numbers in every rate field (night hours as whole numbers).");
        } catch (IllegalArgumentException e) {
            showError(e.getMessage());          // thrown by CityRate setters
        } catch (IOException e) {
            showError("Could not save rates file: " + e.getMessage());
        }
    }

    private void onDelete() {
        String city = cityField.getText().trim();
        if (city.isEmpty() || repository.getRate(city) == null) {
            showError("Select a city from the table first.");
            return;
        }
        int answer = JOptionPane.showConfirmDialog(this, "Delete rates for " + city + "?",
                "Delete city", JOptionPane.YES_NO_OPTION);
        if (answer == JOptionPane.YES_OPTION) {
            try {
                repository.deleteRate(city);
                clearForm();
                refresh();
            } catch (IOException e) {
                showError("Could not save rates file: " + e.getMessage());
            }
        }
    }

    private void clearForm() {
        table.clearSelection();
        for (JTextField f : new JTextField[] {cityField, minFareField, minKmField, perKmField,
                waitingField, nightPercentField, nightStartField, nightEndField}) {
            f.setText("");
        }
        cityField.requestFocus();
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Invalid rates", JOptionPane.WARNING_MESSAGE);
    }
}
