package fairfare.storage;

import fairfare.model.Trip;
import fairfare.model.Verdict;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Stores every fare check and saves it to data/history.csv.
 */
public class TripHistory extends CsvFileStore<Trip> {

    private final List<Trip> trips;

    public TripHistory(String filePath) {
        super(filePath);
        trips = loadAll();
    }

    /** Adds a trip and saves the history file straight away. */
    public void addTrip(Trip trip) throws IOException {
        trips.add(trip);
        saveAll(trips);
    }

    /** Newest trip first, read-only. */
    public List<Trip> getTrips() {
        List<Trip> copy = new ArrayList<>(trips);
        Collections.reverse(copy);
        return Collections.unmodifiableList(copy);
    }

    public void clear() throws IOException {
        trips.clear();
        saveAll(trips);
    }

    public int getTotalChecks() {
        return trips.size();
    }

    public int getExcessiveCount() {
        int count = 0;
        for (Trip trip : trips) {
            if (trip.getVerdict() == Verdict.EXCESSIVE) {
                count++;
            }
        }
        return count;
    }

    /** Total extra money demanded across all EXCESSIVE trips. */
    public double getTotalOvercharge() {
        double total = 0;
        for (Trip trip : trips) {
            if (trip.getVerdict() == Verdict.EXCESSIVE) {
                total += trip.getDifference();
            }
        }
        return total;
    }

    // ----- CSV conversion (required by CsvFileStore) -----

    @Override
    protected String getHeader() {
        return "dateTime,city,pickup,destination,distanceKm,waitingMin,night,officialFare,demandedFare,verdict";
    }

    @Override
    protected String toCsvLine(Trip t) {
        return t.getDateTime() + "," + clean(t.getCity()) + "," + clean(t.getPickup()) + ","
                + clean(t.getDestination()) + "," + t.getDistanceKm() + "," + t.getWaitingMinutes() + ","
                + t.isNightTrip() + "," + t.getOfficialFare() + "," + t.getDemandedFare() + ","
                + t.getVerdict().name();
    }

    @Override
    protected Trip fromCsvLine(String[] p) {
        return new Trip(LocalDateTime.parse(p[0]), p[1], p[2], p[3],
                Double.parseDouble(p[4]), Integer.parseInt(p[5]), Boolean.parseBoolean(p[6]),
                Double.parseDouble(p[7]), Double.parseDouble(p[8]), Verdict.valueOf(p[9]));
    }
}
