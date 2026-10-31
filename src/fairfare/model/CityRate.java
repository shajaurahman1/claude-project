package fairfare.model;

/**
 * Official auto-rickshaw fare rates for one city.
 *
 * OOP concept: ENCAPSULATION - all fields are private. Other classes can
 * only read them through getters and change them through setters, and the
 * setters reject invalid values (such as a negative fare).
 */
public class CityRate {

    private String cityName;
    private double minimumFare;       // fare for the first few km (Rs)
    private double minimumDistance;   // km covered by the minimum fare
    private double perKmRate;         // Rs per km after the minimum distance
    private double waitingPerMinute;  // Rs per minute of waiting
    private double nightPercent;      // extra % added at night, e.g. 50
    private int nightStartHour;       // night starts at this hour (0-23), e.g. 22
    private int nightEndHour;         // night ends at this hour (0-23), e.g. 5

    public CityRate(String cityName, double minimumFare, double minimumDistance,
                    double perKmRate, double waitingPerMinute, double nightPercent,
                    int nightStartHour, int nightEndHour) {
        setCityName(cityName);
        setMinimumFare(minimumFare);
        setMinimumDistance(minimumDistance);
        setPerKmRate(perKmRate);
        setWaitingPerMinute(waitingPerMinute);
        setNightPercent(nightPercent);
        setNightStartHour(nightStartHour);
        setNightEndHour(nightEndHour);
    }

    /**
     * Returns true if the given hour (0-23) falls in this city's night window.
     * The window may cross midnight, e.g. 22:00 to 05:00.
     */
    public boolean isNightHour(int hour) {
        if (nightStartHour > nightEndHour) {               // crosses midnight
            return hour >= nightStartHour || hour < nightEndHour;
        }
        return hour >= nightStartHour && hour < nightEndHour;
    }

    // ----- Getters -----

    public String getCityName()        { return cityName; }
    public double getMinimumFare()     { return minimumFare; }
    public double getMinimumDistance() { return minimumDistance; }
    public double getPerKmRate()       { return perKmRate; }
    public double getWaitingPerMinute(){ return waitingPerMinute; }
    public double getNightPercent()    { return nightPercent; }
    public int getNightStartHour()     { return nightStartHour; }
    public int getNightEndHour()       { return nightEndHour; }

    // ----- Setters (with validation) -----

    public void setCityName(String cityName) {
        if (cityName == null || cityName.trim().isEmpty()) {
            throw new IllegalArgumentException("City name cannot be empty.");
        }
        this.cityName = cityName.trim();
    }

    public void setMinimumFare(double minimumFare) {
        this.minimumFare = requireNotNegative(minimumFare, "Minimum fare");
    }

    public void setMinimumDistance(double minimumDistance) {
        this.minimumDistance = requireNotNegative(minimumDistance, "Minimum distance");
    }

    public void setPerKmRate(double perKmRate) {
        this.perKmRate = requireNotNegative(perKmRate, "Per-km rate");
    }

    public void setWaitingPerMinute(double waitingPerMinute) {
        this.waitingPerMinute = requireNotNegative(waitingPerMinute, "Waiting charge");
    }

    public void setNightPercent(double nightPercent) {
        this.nightPercent = requireNotNegative(nightPercent, "Night charge %");
    }

    public void setNightStartHour(int hour) {
        this.nightStartHour = requireHour(hour, "Night start hour");
    }

    public void setNightEndHour(int hour) {
        this.nightEndHour = requireHour(hour, "Night end hour");
    }

    // ----- Small helpers used by the setters -----

    private static double requireNotNegative(double value, String name) {
        if (value < 0) {
            throw new IllegalArgumentException(name + " cannot be negative.");
        }
        return value;
    }

    private static int requireHour(int hour, String name) {
        if (hour < 0 || hour > 23) {
            throw new IllegalArgumentException(name + " must be between 0 and 23.");
        }
        return hour;
    }

    @Override
    public String toString() {
        return cityName;   // shown in the city drop-down list
    }
}
