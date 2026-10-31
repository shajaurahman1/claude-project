package fairfare.model;

/**
 * The details the passenger enters before the fare is calculated.
 * It is passed to the fare calculator and to every Charge.
 */
public class TripRequest {

    private final String pickup;
    private final String destination;
    private final double distanceKm;
    private final int waitingMinutes;
    private final boolean nightTrip;

    public TripRequest(String pickup, String destination, double distanceKm,
                       int waitingMinutes, boolean nightTrip) {
        this.pickup = pickup;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.waitingMinutes = waitingMinutes;
        this.nightTrip = nightTrip;
    }

    public String getPickup()      { return pickup; }
    public String getDestination() { return destination; }
    public double getDistanceKm()  { return distanceKm; }
    public int getWaitingMinutes() { return waitingMinutes; }
    public boolean isNightTrip()   { return nightTrip; }
}
