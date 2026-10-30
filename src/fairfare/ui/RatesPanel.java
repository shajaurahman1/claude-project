package fairfare.ui;

import fairfare.model.CityRate;
import fairfare.storage.RateRepository;

import javax.swing.BorderFactory;
import javax.swing.JButton;
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
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));

        table = new JTable(tableModel);
        table.setRowHeight(24);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                fillFormFromSelection();
            }
        });

        add(new JScrollPane(table), BorderLayout.CENTER);
        add(buildForm(), BorderLayout.SOUTH);
        refresh();
    }

    private JPanel buildForm() {
        JPanel fields = new JPanel(new GridLayout(2, 8, 8, 4));
        String[] labels = {"City", "Minimum fare (Rs)", "Minimum km", "Per km (Rs)",
                           "Waiting/min (Rs)", "Night %", "Night from (0-23)", "Night to (0-23)"};
        for (String label : labels) {
            fields.add(new JLabel(label));
        }
        fields.add(cityField);
        fields.add(minFareField);
        fields.add(minKmField);
        fields.add(perKmField);
        fields.add(waitingField);
        fields.add(nightPercentField);
        fields.add(nightStartField);
        fields.add(nightEndField);

        JButton saveButton = new JButton("Save / Update City");
        saveButton.setBackground(Theme.HEADER_YELLOW);
        saveButton.addActionListener(e -> onSave());
        JButton deleteButton = new JButton("Delete City");
        deleteButton.addActionListener(e -> onDelete());
        JButton newButton = new JButton("New City");
        newButton.addActionListener(e -> clearForm());

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttons.add(newButton);
        buttons.add(deleteButton);
        buttons.add(saveButton);

        JPanel form = new JPanel(new BorderLayout(4, 4));
        form.setBorder(BorderFactory.createTitledBorder("Add or update fare rates"));
        form.add(fields, BorderLayout.CENTER);
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
