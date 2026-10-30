package fairfare.exception;

/**
 * Thrown when the distance between two places is not known.
 * The passenger can then type the distance in manually.
 */
public class RouteNotFoundException extends Exception {

    public RouteNotFoundException(String pickup, String destination) {
        super("Distance from \"" + pickup + "\" to \"" + destination
                + "\" is not known. Please enter the distance (km) manually.");
    }
}
