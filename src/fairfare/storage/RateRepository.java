package fairfare.storage;

import fairfare.model.CityRate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Keeps the fare rates of every city and saves them to data/rates.csv.
 * Rates can be added, updated or deleted from the "Fare Rates" tab.
 */
public class RateRepository extends CsvFileStore<CityRate> {

    /** city name (lower case) -> rates. LinkedHashMap keeps insertion order. */
    private final Map<String, CityRate> rates = new LinkedHashMap<>();

    public RateRepository(String filePath) {
        super(filePath);
        if (fileExists()) {
            for (CityRate rate : loadAll()) {
                rates.put(rate.getCityName().toLowerCase(), rate);
            }
        }
        if (rates.isEmpty()) {
            loadDefaultRates();
        }
    }

    public List<CityRate> getAllRates() {
        return new ArrayList<>(rates.values());
    }

    public CityRate getRate(String cityName) {
        return rates.get(cityName.toLowerCase());
    }

    /** Adds a new city or replaces the rates of an existing one, then saves. */
    public void saveRate(CityRate rate) throws IOException {
        rates.put(rate.getCityName().toLowerCase(), rate);
        saveAll(getAllRates());
    }

    public void deleteRate(String cityName) throws IOException {
        rates.remove(cityName.toLowerCase());
        saveAll(getAllRates());
    }

    /**
     * Starting rates used the first time the app runs. These are sample
     * values based on published state rates and can be edited in the app.
     */
    private void loadDefaultRates() {
        //                         city                min   minKm perKm wait/min night% from to
        add(new CityRate("Kochi",              30.0, 1.5, 15.0, 1.0, 50, 22, 5));
        add(new CityRate("Thiruvananthapuram", 30.0, 1.5, 15.0, 1.0, 50, 22, 5));
        add(new CityRate("Kozhikode",          30.0, 1.5, 15.0, 1.0, 50, 22, 5));
        add(new CityRate("Bengaluru",          30.0, 2.0, 15.0, 1.0, 50, 22, 5));
        add(new CityRate("Chennai",            50.0, 1.8, 18.0, 1.0, 50, 23, 5));
        try {
            saveAll(getAllRates());
        } catch (IOException e) {
            System.err.println("Could not save default rates: " + e.getMessage());
        }
    }

    private void add(CityRate rate) {
        rates.put(rate.getCityName().toLowerCase(), rate);
    }

    // ----- CSV conversion (required by CsvFileStore) -----

    @Override
    protected String getHeader() {
        return "city,minimumFare,minimumKm,perKm,waitingPerMinute,nightPercent,nightStart,nightEnd";
    }

    @Override
    protected String toCsvLine(CityRate r) {
        return clean(r.getCityName()) + "," + r.getMinimumFare() + "," + r.getMinimumDistance()
                + "," + r.getPerKmRate() + "," + r.getWaitingPerMinute() + "," + r.getNightPercent()
                + "," + r.getNightStartHour() + "," + r.getNightEndHour();
    }

    @Override
    protected CityRate fromCsvLine(String[] p) {
        return new CityRate(p[0],
                Double.parseDouble(p[1]), Double.parseDouble(p[2]), Double.parseDouble(p[3]),
                Double.parseDouble(p[4]), Double.parseDouble(p[5]),
                Integer.parseInt(p[6]), Integer.parseInt(p[7]));
    }
}
