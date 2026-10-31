package fairfare.service;

import fairfare.exception.InvalidInputException;
import fairfare.exception.RouteNotFoundException;
import fairfare.model.CityRate;
import fairfare.model.FareBreakdown;
import fairfare.model.Trip;
import fairfare.model.TripRequest;
import fairfare.model.Verdict;
import fairfare.storage.RateRepository;
import fairfare.storage.TripHistory;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * The "brain" of FairFare. The user interface calls this class; this class
 * uses the distance provider, fare calculator, fare checker and storage.
 *
 * OOP concept: COMPOSITION - FareService "has a" DistanceProvider,
 * FareCalculator, FareChecker, RateRepository and TripHistory.
 * It depends on interfaces (DistanceProvider, FareCalculator), not on
 * concrete classes, so parts can be swapped easily.
 */
public class FareService {

    private final DistanceProvider distanceProvider;
    private final FareCalculator fareCalculator;
    private final FareChecker fareChecker;
    private final RateRepository rateRepository;
    private final TripHistory tripHistory;

    public FareService(DistanceProvider distanceProvider, FareCalculator fareCalculator,
                       FareChecker fareChecker, RateRepository rateRepository,
                       TripHistory tripHistory) {
        this.distanceProvider = distanceProvider;
        this.fareCalculator = fareCalculator;
        this.fareChecker = fareChecker;
        this.rateRepository = rateRepository;
        this.tripHistory = tripHistory;
    }

    /** Step 1: find the distance between pickup and destination. */
    public double findDistance(String city, String pickup, String destination)
            throws InvalidInputException, RouteNotFoundException {
        requireText(pickup, "Pickup point");
        requireText(destination, "Destination");
        return distanceProvider.getDistance(city, pickup.trim(), destination.trim());
    }

    /** Step 2: work out the official fare. */
    public FareBreakdown calculateFare(CityRate rate, TripRequest request)
            throws InvalidInputException {
        validate(rate, request);
        return fareCalculator.calculate(rate, request);
    }

    /** Step 3: compare with the driver's demand and save the trip to history. */
    public Trip checkAndSave(CityRate rate, TripRequest request, double demandedFare)
            throws InvalidInputException, IOException {
        if (demandedFare <= 0) {
            throw new InvalidInputException("Amount demanded by the driver must be more than 0.");
        }
        FareBreakdown breakdown = calculateFare(rate, request);
        double officialFare = breakdown.getRoundedTotal();
        Verdict verdict = fareChecker.check(officialFare, demandedFare);

        Trip trip = new Trip(LocalDateTime.now(), rate.getCityName(),
                request.getPickup(), request.getDestination(), request.getDistanceKm(),
                request.getWaitingMinutes(), request.isNightTrip(),
                officialFare, demandedFare, verdict);
        tripHistory.addTrip(trip);
        return trip;
    }

    public List<String> getPlaces(String city) {
        return distanceProvider.getPlaces(city);
    }

    public RateRepository getRateRepository() {
        return rateRepository;
    }

    public TripHistory getTripHistory() {
        return tripHistory;
    }

    // ----- Input checks -----

    private void validate(CityRate rate, TripRequest request) throws InvalidInputException {
        if (rate == null) {
            throw new InvalidInputException("Please select a city.");
        }
        requireText(request.getPickup(), "Pickup point");
        requireText(request.getDestination(), "Destination");
        if (request.getDistanceKm() <= 0) {
            throw new InvalidInputException("Distance must be more than 0 km.");
        }
        if (request.getDistanceKm() > 200) {
            throw new InvalidInputException("Distance looks too long for an auto trip (max 200 km).");
        }
        if (request.getWaitingMinutes() < 0) {
            throw new InvalidInputException("Waiting time cannot be negative.");
        }
    }

    private void requireText(String value, String fieldName) throws InvalidInputException {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidInputException(fieldName + " cannot be empty.");
        }
    }
}
