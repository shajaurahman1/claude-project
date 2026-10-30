package fairfare.charges;

import fairfare.model.CityRate;
import fairfare.model.TripRequest;

/**
 * Extra percentage added to the distance fare for night trips.
 * Example: 50% night charge on a Rs 82.50 distance fare = Rs 41.25.
 *
 * It reuses BaseFareCharge to get the distance fare (COMPOSITION: a
 * NightCharge "has a" BaseFareCharge).
 */
public class NightCharge extends Charge {

    private final BaseFareCharge baseFare = new BaseFareCharge();

    public NightCharge() {
        super("Night charge");
    }

    @Override
    public boolean appliesTo(CityRate rate, TripRequest trip) {
        return trip.isNightTrip() && rate.getNightPercent() > 0;
    }

    @Override
    public double calculate(CityRate rate, TripRequest trip) {
        return baseFare.calculate(rate, trip) * rate.getNightPercent() / 100.0;
    }

    @Override
    public String describe(CityRate rate, TripRequest trip) {
        return String.format("Night %.0f%% of distance fare (%02d:00 - %02d:00)",
                rate.getNightPercent(), rate.getNightStartHour(), rate.getNightEndHour());
    }
}
