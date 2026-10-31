package fairfare.ui;

import fairfare.exception.InvalidInputException;
import fairfare.exception.RouteNotFoundException;
import fairfare.model.CityRate;
import fairfare.model.FareBreakdown;
import fairfare.model.Trip;
import fairfare.model.TripRequest;
import fairfare.model.Verdict;
import fairfare.service.FareChecker;
import fairfare.service.FareService;

import javax.swing.BorderFactory;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSpinner;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingConstants;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;
import java.io.IOException;
import java.time.LocalTime;

/**
 * Main screen: the passenger enters the trip, gets the distance,
 * types the amount the driver asked for, and sees FAIR or EXCESSIVE.
 */
public class CheckFarePanel extends JPanel implements Refreshable {

    private final FareService service;

    // Input fields
    private final JComboBox<CityRate> cityBox = new JComboBox<>();
    private final JComboBox<String> pickupBox = new JComboBox<>();
    private final JComboBox<String> destinationBox = new JComboBox<>();
    private final JTextField distanceField = new JTextField(8);
    private final JSpinner waitingSpinner = new JSpinner(new SpinnerNumberModel(0, 0, 600, 1));
    private final JCheckBox nightCheck = new JCheckBox("Night trip");
    private final JTextField demandedField = new JTextField(8);

    // Output
    private final RoundedPanel verdictBanner = new RoundedPanel(new BorderLayout(0, 4), Theme.NEUTRAL_LIGHT, 18);
    private final JLabel verdictLabel = new JLabel("Enter trip details", SwingConstants.CENTER);
    private final JLabel differenceLabel = new JLabel(" ", SwingConstants.CENTER);
    private final StatCard officialCard = new StatCard("Official fare");
    private final StatCard demandedCard = new StatCard("Driver demanded");
    private final StatCard differenceCard = new StatCard("Difference");
    private final JTextArea breakdownArea = new JTextArea();

    public CheckFarePanel(FareService service) {
        this.service = service;
        setLayout(new BorderLayout(14, 14));
        setBackground(Theme.BACKGROUND);
        setBorder(Theme.padding(14));

        pickupBox.setEditable(true);       // known places + any typed place
        destinationBox.setEditable(true);

        add(buildFormPanel(), BorderLayout.WEST);
        add(buildResultPanel(), BorderLayout.CENTER);

        // When the city changes, reload the place lists and night status.
        cityBox.addActionListener(e -> onCityChanged());
        refresh();
    }

    // ------------------------------------------------------------------
    // Layout
    // ------------------------------------------------------------------

    private JPanel buildFormPanel() {
        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(6, 4, 6, 4);
        c.anchor = GridBagConstraints.WEST;
        c.fill = GridBagConstraints.HORIZONTAL;

        int row = 0;
        addRow(form, c, row++, "City", cityBox);
        addRow(form, c, row++, "Pickup point", pickupBox);
        addRow(form, c, row++, "Destination", destinationBox);

        StyledButton distanceButton = StyledButton.secondary("Get Distance");
        distanceButton.addActionListener(e -> onGetDistance());
        JPanel distanceRow = new JPanel(new BorderLayout(8, 0));
        distanceRow.setOpaque(false);
        distanceRow.add(distanceField, BorderLayout.CENTER);
        distanceRow.add(distanceButton, BorderLayout.EAST);
        addRow(form, c, row++, "Distance (km)", distanceRow);

        addRow(form, c, row++, "Waiting time (min)", waitingSpinner);

        nightCheck.setOpaque(false);
        nightCheck.setFont(Theme.LABEL_FONT);
        nightCheck.setToolTipText("Ticked automatically during the city's night hours. You can change it.");
        addRow(form, c, row++, "", nightCheck);

        addRow(form, c, row++, "Driver demanded (Rs)", demandedField);

        StyledButton checkButton = StyledButton.primary("Check Fare");
        checkButton.addActionListener(e -> onCheckFare());
        StyledButton clearButton = StyledButton.secondary("Clear");
        clearButton.addActionListener(e -> clearForm());

        JPanel buttons = new JPanel(new GridLayout(1, 2, 10, 0));
        buttons.setOpaque(false);
        buttons.add(checkButton);
        buttons.add(clearButton);
        c.gridx = 0;
        c.gridy = row++;
        c.gridwidth = 2;
        c.insets = new Insets(18, 4, 4, 4);
        form.add(buttons, c);

        // Push everything to the top.
        c.gridy = row;
        c.weighty = 1;
        form.add(new JLabel(), c);

        cityBox.setPreferredSize(new Dimension(240, 30));

        RoundedPanel card = RoundedPanel.card(new BorderLayout());
        card.setBorder(Theme.padding(18));
        card.add(Theme.heading("Trip details"), BorderLayout.NORTH);
        card.add(form, BorderLayout.CENTER);
        return card;
    }

    private void addRow(JPanel panel, GridBagConstraints c, int row, String label,
                        java.awt.Component field) {
        c.gridwidth = 1;
        c.gridx = 0;
        c.gridy = row;
        c.weightx = 0;
        JLabel l = new JLabel(label);
        l.setFont(Theme.LABEL_FONT);
        l.setForeground(Theme.MUTED);
        panel.add(l, c);
        c.gridx = 1;
        c.weightx = 1;
        panel.add(field, c);
    }

    private JPanel buildResultPanel() {
        // Coloured verdict banner
        verdictLabel.setFont(Theme.VERDICT_FONT);
        differenceLabel.setFont(Theme.BOLD_FONT);
        verdictBanner.setBorder(Theme.padding(18));
        verdictBanner.add(verdictLabel, BorderLayout.CENTER);
        verdictBanner.add(differenceLabel, BorderLayout.SOUTH);

        // Three small number cards
        JPanel stats = new JPanel(new GridLayout(1, 3, 10, 0));
        stats.setOpaque(false);
        stats.add(officialCard);
        stats.add(demandedCard);
        stats.add(differenceCard);

        JPanel top = new JPanel(new BorderLayout(0, 12));
        top.setOpaque(false);
        top.add(verdictBanner, BorderLayout.NORTH);
        top.add(stats, BorderLayout.CENTER);

        // Fare breakdown text
        breakdownArea.setEditable(false);
        breakdownArea.setFont(Theme.MONO_FONT);
        breakdownArea.setForeground(Theme.TEXT);
        breakdownArea.setBackground(Theme.CARD);
        breakdownArea.setBorder(Theme.padding(4));
        JScrollPane scroll = new JScrollPane(breakdownArea);
        scroll.setBorder(BorderFactory.createEmptyBorder());
        scroll.getViewport().setBackground(Theme.CARD);

        JPanel breakdown = new JPanel(new BorderLayout());
        breakdown.setOpaque(false);
        breakdown.add(Theme.heading("Fare breakdown"), BorderLayout.NORTH);
        breakdown.add(scroll, BorderLayout.CENTER);

        RoundedPanel card = RoundedPanel.card(new BorderLayout(0, 16));
        card.setBorder(Theme.padding(18));
        card.add(top, BorderLayout.NORTH);
        card.add(breakdown, BorderLayout.CENTER);
        showNeutral("Enter trip details");
        return card;
    }

    // ------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------

    /** Reloads the city list (rates may have been edited in another tab). */
    @Override
    public void refresh() {
        Object selected = cityBox.getSelectedItem();
        String selectedName = selected == null ? null : selected.toString();

        cityBox.removeAllItems();
        for (CityRate rate : service.getRateRepository().getAllRates()) {
            cityBox.addItem(rate);
            if (rate.getCityName().equals(selectedName)) {
                cityBox.setSelectedItem(rate);
            }
        }
        onCityChanged();
    }

    private void onCityChanged() {
        CityRate rate = (CityRate) cityBox.getSelectedItem();
        if (rate == null) {
            return;
        }
        String pickup = getText(pickupBox);
        String destination = getText(destinationBox);

        pickupBox.removeAllItems();
        destinationBox.removeAllItems();
        for (String place : service.getPlaces(rate.getCityName())) {
            pickupBox.addItem(place);
            destinationBox.addItem(place);
        }
        // Keep what the user already typed, otherwise start empty.
        pickupBox.setSelectedItem(pickup);
        destinationBox.setSelectedItem(destination);

        nightCheck.setSelected(rate.isNightHour(LocalTime.now().getHour()));
    }

    private void onGetDistance() {
        CityRate rate = (CityRate) cityBox.getSelectedItem();
        if (rate == null) {
            showError("Please add a city in the Fare Rates tab first.");
            return;
        }
        try {
            double km = service.findDistance(rate.getCityName(), getText(pickupBox), getText(destinationBox));
            distanceField.setText(String.valueOf(km));
        } catch (InvalidInputException e) {
            showError(e.getMessage());
        } catch (RouteNotFoundException e) {
            distanceField.setText("");
            distanceField.requestFocus();
            JOptionPane.showMessageDialog(this, e.getMessage(), "Route not found",
                    JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void onCheckFare() {
        try {
            CityRate rate = (CityRate) cityBox.getSelectedItem();
            String pickup = getText(pickupBox);
            String destination = getText(destinationBox);

            // If the distance box is empty, try to look it up first.
            if (distanceField.getText().trim().isEmpty() && rate != null) {
                try {
                    double km = service.findDistance(rate.getCityName(), pickup, destination);
                    distanceField.setText(String.valueOf(km));
                } catch (RouteNotFoundException e) {
                    throw new InvalidInputException(e.getMessage());
                }
            }

            double distance = parseNumber(distanceField.getText(), "Distance");
            int waiting = (Integer) waitingSpinner.getValue();
            double demanded = parseNumber(demandedField.getText(), "Amount demanded");

            TripRequest request = new TripRequest(pickup, destination, distance,
                    waiting, nightCheck.isSelected());

            FareBreakdown breakdown = service.calculateFare(rate, request);
            Trip trip = service.checkAndSave(rate, request, demanded);
            showResult(trip, breakdown);

        } catch (InvalidInputException e) {
            showError(e.getMessage());
        } catch (IOException e) {
            showError("Fare checked, but the trip could not be saved to history: " + e.getMessage());
        }
    }

    private void clearForm() {
        pickupBox.setSelectedItem("");
        destinationBox.setSelectedItem("");
        distanceField.setText("");
        waitingSpinner.setValue(0);
        demandedField.setText("");
        CityRate rate = (CityRate) cityBox.getSelectedItem();
        nightCheck.setSelected(rate != null && rate.isNightHour(LocalTime.now().getHour()));
        breakdownArea.setText("");
        showNeutral("Enter trip details");
    }

    // ------------------------------------------------------------------
    // Showing results
    // ------------------------------------------------------------------

    private void showResult(Trip trip, FareBreakdown breakdown) {
        boolean fair = trip.getVerdict() == Verdict.FAIR;
        Color strong = fair ? Theme.FAIR_GREEN : Theme.EXCESSIVE_RED;
        Color light = fair ? Theme.FAIR_LIGHT : Theme.EXCESSIVE_LIGHT;

        verdictBanner.setBackground(light);
        verdictBanner.setBorderColor(strong);
        verdictLabel.setText(trip.getVerdict().getLabel());
        verdictLabel.setForeground(strong);

        double diff = trip.getDifference();
        if (fair) {
            differenceLabel.setText(diff > 0
                    ? "Driver asked " + Theme.money(diff) + " more (within the allowed margin)"
                    : "Driver's demand is within the official fare");
        } else {
            differenceLabel.setText("Driver asked " + Theme.money(diff) + " MORE than the official fare");
        }
        differenceLabel.setForeground(strong);

        officialCard.setValue(Theme.money(trip.getOfficialFare()));
        demandedCard.setValue(Theme.money(trip.getDemandedFare()));
        differenceCard.setValue(String.format("%+.2f", diff));
        differenceCard.setValueColor(strong);

        StringBuilder sb = new StringBuilder();
        sb.append("Route    : ").append(trip.getPickup()).append(" -> ").append(trip.getDestination()).append('\n');
        sb.append("City     : ").append(trip.getCity()).append('\n');
        sb.append(String.format("Distance : %.2f km%n%n", trip.getDistanceKm()));
        for (FareBreakdown.Line line : breakdown.getLines()) {
            sb.append(String.format("%-58s %10s%n", line.getDescription(), Theme.money(line.getAmount())));
        }
        sb.append("--------------------------------------------------------------------\n");
        sb.append(String.format("%-58s %10s%n", "Official fare (rounded)", Theme.money(trip.getOfficialFare())));
        sb.append(String.format("%nAllowed margin for rounding: %s.  Saved to trip history.",
                Theme.money(FareChecker.ALLOWED_MARGIN)));
        breakdownArea.setText(sb.toString());
        breakdownArea.setCaretPosition(0);
    }

    private void showNeutral(String text) {
        verdictBanner.setBackground(Theme.NEUTRAL_LIGHT);
        verdictBanner.setBorderColor(null);
        verdictLabel.setText(text);
        verdictLabel.setForeground(Theme.MUTED);
        differenceLabel.setText("Fill in the trip details and press Check Fare");
        differenceLabel.setForeground(Theme.MUTED);
        for (StatCard card : new StatCard[] {officialCard, demandedCard, differenceCard}) {
            card.setValue("-");
            card.setValueColor(Theme.TEXT);
        }
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Please check your input",
                JOptionPane.WARNING_MESSAGE);
    }

    // ------------------------------------------------------------------
    // Small helpers
    // ------------------------------------------------------------------

    /** Reads the text of an editable combo box (typed or selected). */
    private static String getText(JComboBox<String> box) {
        Object value = box.isEditable() ? box.getEditor().getItem() : box.getSelectedItem();
        return value == null ? "" : value.toString().trim();
    }

    private static double parseNumber(String text, String fieldName) throws InvalidInputException {
        try {
            return Double.parseDouble(text.trim());
        } catch (NumberFormatException e) {
            throw new InvalidInputException(fieldName + " must be a number.");
        }
    }
}
