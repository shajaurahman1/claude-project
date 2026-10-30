package fairfare.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Holds each part of a fare (base fare, waiting charge, night charge)
 * and the total. Used to show the passenger how the fare was worked out.
 */
public class FareBreakdown {

    /** One line of the breakdown, e.g. "Waiting charge (10 min) = Rs 10.00". */
    public static class Line {
        private final String description;
        private final double amount;

        public Line(String description, double amount) {
            this.description = description;
            this.amount = amount;
        }

        public String getDescription() { return description; }
        public double getAmount()      { return amount; }
    }

    private final List<Line> lines = new ArrayList<>();

    public void addLine(String description, double amount) {
        lines.add(new Line(description, amount));
    }

    /** The lines cannot be changed from outside (encapsulation). */
    public List<Line> getLines() {
        return Collections.unmodifiableList(lines);
    }

    /** Exact total of all lines. */
    public double getTotal() {
        double total = 0;
        for (Line line : lines) {
            total += line.getAmount();
        }
        return total;
    }

    /** Total rounded to the nearest rupee, as drivers charge whole rupees. */
    public double getRoundedTotal() {
        return Math.round(getTotal());
    }
}
