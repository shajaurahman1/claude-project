package fairfare.ui;

import fairfare.service.FareService;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JTabbedPane;
import java.awt.BorderLayout;
import java.awt.Component;

/**
 * The main application window with three tabs:
 *   1. Check Fare   2. Trip History   3. Fare Rates
 *
 * OOP concept: INHERITANCE - MainFrame "is a" JFrame and gets all window
 * behaviour (title bar, close button, resizing) from Swing for free.
 */
public class MainFrame extends JFrame {

    public MainFrame(FareService service) {
        super("FairFare - Auto-Rickshaw Fare Checker");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1120, 700);
        setMinimumSize(getSize());
        setLocationRelativeTo(null);   // centre on screen
        getContentPane().setBackground(Theme.BACKGROUND);

        add(new HeaderPanel(), BorderLayout.NORTH);

        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(Theme.BOLD_FONT);
        tabs.setBorder(BorderFactory.createEmptyBorder(10, 10, 0, 10));
        tabs.addTab("  Check Fare  ", new CheckFarePanel(service));
        tabs.addTab("  Trip History  ", new HistoryPanel(service.getTripHistory()));
        tabs.addTab("  Fare Rates  ", new RatesPanel(service.getRateRepository()));

        // Reload a tab's data every time it is opened (POLYMORPHISM through
        // the Refreshable interface - we don't care which panel it is).
        tabs.addChangeListener(e -> {
            Component selected = tabs.getSelectedComponent();
            if (selected instanceof Refreshable) {
                ((Refreshable) selected).refresh();
            }
        });
        add(tabs, BorderLayout.CENTER);
    }
}
