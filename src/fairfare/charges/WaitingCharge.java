package fairfare.charges;

import fairfare.model.CityRate;
import fairfare.model.TripRequest;

/** Charge for the time the auto waited for the passenger. */
public class WaitingCharge extends Charge {

    public WaitingCharge() {
        super("Waiting charge");
    }

    @Override
    public boolean appliesTo(CityRate rate, TripRequest trip) {
        return trip.getWaitingMinutes() > 0;
    }

    @Override
    public double calculate(CityRate rate, TripRequest trip) {
        return trip.getWaitingMinutes() * rate.getWaitingPerMinute();
    }

    @Override
    public String describe(CityRate rate, TripRequest trip) {
        return String.format("Waiting %d min x Rs %.2f",
                trip.getWaitingMinutes(), rate.getWaitingPerMinute());
    }
}
