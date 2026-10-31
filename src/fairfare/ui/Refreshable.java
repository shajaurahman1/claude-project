package fairfare.ui;

/**
 * A screen that can reload its data, e.g. after rates or history change.
 * MainFrame calls refresh() whenever the user switches to a tab.
 */
public interface Refreshable {
    void refresh();
}
