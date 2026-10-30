package fairfare.charges;

import fairfare.model.CityRate;
import fairfare.model.TripRequest;

/**
 * A single part of the total fare.
 *
 * OOP concepts:
 *  - ABSTRACTION: this class says WHAT every charge can do (calculate an
 *    amount and describe itself) but not HOW. It cannot be instantiated.
 *  - INHERITANCE: BaseFareCharge, WaitingCharge and NightCharge extend it.
 *  - POLYMORPHISM: the fare calculator keeps a List<Charge> and calls
 *    calculate() on each one; Java runs the right subclass version at runtime.
 */
public abstract class Charge {

    private final String name;

    protected Charge(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    /** Returns true if this charge should be added for the given trip. */
    public abstract boolean appliesTo(CityRate rate, TripRequest trip);

    /** Returns the amount (Rs) of this charge for the given trip. */
    public abstract double calculate(CityRate rate, TripRequest trip);

    /** Short explanation shown in the fare breakdown. */
    public abstract String describe(CityRate rate, TripRequest trip);
}
