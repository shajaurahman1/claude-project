package fairfare;

import fairfare.service.AutoFareCalculator;
import fairfare.service.FareChecker;
import fairfare.service.FareService;
import fairfare.service.RouteTableDistanceProvider;
import fairfare.storage.RateRepository;
import fairfare.storage.TripHistory;
import fairfare.ui.MainFrame;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

/**
 * FairFare - Auto-Rickshaw Fare Checker
 * PBCST304 Object Oriented Programming - mini project
 *
 * Entry point: creates all the objects, connects them together and
 * opens the main window.
 */
public class Main {

    public static void main(String[] args) {
        // Create the objects the app needs.
        RateRepository rates = new RateRepository("data/rates.csv");
        TripHistory history = new TripHistory("data/history.csv");

        FareService service = new FareService(
                new RouteTableDistanceProvider(),
                new AutoFareCalculator(),
                new FareChecker(),
                rates,
                history);

        // Swing windows must be created on the Event Dispatch Thread.
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {
                // Fall back to the default Java look if the system one fails.
            }
            new MainFrame(service).setVisible(true);
        });
    }
}
