package fairfare.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * One fare check made by the passenger. Every Trip is saved to history.
 *
 * OOP concept: ENCAPSULATION - fields are private and final, so a Trip
 * cannot be changed after it is created (an "immutable" object).
 */
public class Trip {

    public static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    private final LocalDateTime dateTime;
    private final String city;
    private final String pickup;
    private final String destination;
    private final double distanceKm;
    private final int waitingMinutes;
    private final boolean nightTrip;
    private final double officialFare;
    private final double demandedFare;
    private final Verdict verdict;

    public Trip(LocalDateTime dateTime, String city, String pickup, String destination,
                double distanceKm, int waitingMinutes, boolean nightTrip,
                double officialFare, double demandedFare, Verdict verdict) {
        this.dateTime = dateTime;
        this.city = city;
        this.pickup = pickup;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.waitingMinutes = waitingMinutes;
        this.nightTrip = nightTrip;
        this.officialFare = officialFare;
        this.demandedFare = demandedFare;
        this.verdict = verdict;
    }

    /** Extra amount asked by the driver (negative if the driver asked less). */
    public double getDifference() {
        return demandedFare - officialFare;
    }

    public LocalDateTime getDateTime() { return dateTime; }
    public String getCity()            { return city; }
    public String getPickup()          { return pickup; }
    public String getDestination()     { return destination; }
    public double getDistanceKm()      { return distanceKm; }
    public int getWaitingMinutes()     { return waitingMinutes; }
    public boolean isNightTrip()       { return nightTrip; }
    public double getOfficialFare()    { return officialFare; }
    public double getDemandedFare()    { return demandedFare; }
    public Verdict getVerdict()        { return verdict; }

    public String getFormattedDate() {
        return dateTime.format(DATE_FORMAT);
    }
}
