package fairfare.ui;

import fairfare.service.FareService;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
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
        setSize(1050, 620);
        setLocationRelativeTo(null);   // centre on screen

        add(buildHeader(), BorderLayout.NORTH);

        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Check Fare", new CheckFarePanel(service));
        tabs.addTab("Trip History", new HistoryPanel(service.getTripHistory()));
        tabs.addTab("Fare Rates", new RatesPanel(service.getRateRepository()));

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

    private JPanel buildHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(Theme.HEADER_YELLOW);
        header.setBorder(BorderFactory.createEmptyBorder(10, 16, 10, 16));

        JLabel title = new JLabel("FairFare");
        title.setFont(Theme.TITLE_FONT);
        title.setForeground(Theme.HEADER_TEXT);

        JLabel subtitle = new JLabel("Auto-Rickshaw Fare Checker - know the right fare before you pay");
        subtitle.setFont(Theme.LABEL_FONT);
        subtitle.setForeground(Theme.HEADER_TEXT);

        header.add(title, BorderLayout.WEST);
        header.add(subtitle, BorderLayout.EAST);
        return header;
    }
}
