package fairfare.charges;

import fairfare.model.CityRate;
import fairfare.model.TripRequest;

/**
 * Distance fare = minimum fare + per-km rate for every km beyond the
 * minimum distance.
 *
 * Example (Kochi: Rs 30 for first 1.5 km, then Rs 15/km), trip of 5 km:
 *   30 + (5 - 1.5) x 15 = 30 + 52.50 = Rs 82.50
 */
public class BaseFareCharge extends Charge {

    public BaseFareCharge() {
        super("Distance fare");
    }

    @Override
    public boolean appliesTo(CityRate rate, TripRequest trip) {
        return true;   // every trip pays the distance fare
    }

    @Override
    public double calculate(CityRate rate, TripRequest trip) {
        double distance = trip.getDistanceKm();
        if (distance <= rate.getMinimumDistance()) {
            return rate.getMinimumFare();
        }
        double extraKm = distance - rate.getMinimumDistance();
        return rate.getMinimumFare() + extraKm * rate.getPerKmRate();
    }

    @Override
    public String describe(CityRate rate, TripRequest trip) {
        double distance = trip.getDistanceKm();
        if (distance <= rate.getMinimumDistance()) {
            return String.format("Minimum fare (up to %.1f km)", rate.getMinimumDistance());
        }
        return String.format("Minimum fare Rs %.2f + %.2f km x Rs %.2f",
                rate.getMinimumFare(), distance - rate.getMinimumDistance(), rate.getPerKmRate());
    }
}
