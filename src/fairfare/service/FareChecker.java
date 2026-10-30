package fairfare.service;

import fairfare.model.Verdict;

/**
 * Compares the amount the driver asked for with the official fare.
 */
public class FareChecker {

    /**
     * Small allowance (Rs) for rounding, e.g. a driver rounding Rs 83 up
     * to Rs 85 is still treated as FAIR.
     */
    public static final double ALLOWED_MARGIN = 5.0;

    public Verdict check(double officialFare, double demandedFare) {
        if (demandedFare <= officialFare + ALLOWED_MARGIN) {
            return Verdict.FAIR;
        }
        return Verdict.EXCESSIVE;
    }
}
