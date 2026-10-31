package fairfare.exception;

/**
 * Thrown when the user enters something the app cannot work with,
 * for example a negative distance or an empty pickup point.
 *
 * OOP concept: INHERITANCE - our own exception type extends Java's Exception.
 * It is a "checked" exception, so the compiler forces callers to handle it.
 */
public class InvalidInputException extends Exception {

    public InvalidInputException(String message) {
        super(message);
    }
}
