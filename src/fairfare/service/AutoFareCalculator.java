package fairfare.service;

import fairfare.charges.BaseFareCharge;
import fairfare.charges.Charge;
import fairfare.charges.NightCharge;
import fairfare.charges.WaitingCharge;
import fairfare.model.CityRate;
import fairfare.model.FareBreakdown;
import fairfare.model.TripRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * Calculates the official auto-rickshaw fare.
 *
 * OOP concept: POLYMORPHISM - the list holds different kinds of Charge,
 * but the loop treats them all the same way. Adding a new charge
 * (e.g. a luggage charge) only needs one new class and one line here.
 */
public class AutoFareCalculator implements FareCalculator {

    private final List<Charge> charges = new ArrayList<>();

    public AutoFareCalculator() {
        charges.add(new BaseFareCharge());
        charges.add(new WaitingCharge());
        charges.add(new NightCharge());
    }

    @Override
    public FareBreakdown calculate(CityRate rate, TripRequest trip) {
        FareBreakdown breakdown = new FareBreakdown();
        for (Charge charge : charges) {
            if (charge.appliesTo(rate, trip)) {
                String text = charge.getName() + ": " + charge.describe(rate, trip);
                breakdown.addLine(text, charge.calculate(rate, trip));
            }
        }
        return breakdown;
    }
}
