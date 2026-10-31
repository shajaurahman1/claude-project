package fairfare.service;

import fairfare.model.CityRate;
import fairfare.model.FareBreakdown;
import fairfare.model.TripRequest;

/**
 * Anything that can work out a fare.
 *
 * OOP concept: an INTERFACE is a pure contract. The rest of the app depends
 * only on this interface, so a different calculator (for example for taxis)
 * could be plugged in without changing the user interface.
 */
public interface FareCalculator {

    FareBreakdown calculate(CityRate rate, TripRequest trip);
}
