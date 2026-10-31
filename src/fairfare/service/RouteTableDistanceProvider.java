package fairfare.service;

import fairfare.exception.RouteNotFoundException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * Gives road distances from a built-in table of common routes in each city.
 * Distances are approximate road distances in km.
 *
 * If a route is not in the table, a RouteNotFoundException is thrown and
 * the passenger types the distance in (for example, from the meter or
 * a maps app).
 */
public class RouteTableDistanceProvider implements DistanceProvider {

    /** city (lower case) -> ("placeA|placeB" -> km) */
    private final Map<String, Map<String, Double>> routes = new HashMap<>();

    public RouteTableDistanceProvider() {
        loadSampleRoutes();
    }

    @Override
    public double getDistance(String city, String pickup, String destination)
            throws RouteNotFoundException {
        if (pickup.equalsIgnoreCase(destination)) {
            return 0;
        }
        Map<String, Double> cityRoutes = routes.get(city.toLowerCase());
        if (cityRoutes != null) {
            // Routes work both ways, so try A|B and B|A.
            Double km = cityRoutes.get(key(pickup, destination));
            if (km == null) {
                km = cityRoutes.get(key(destination, pickup));
            }
            if (km != null) {
                return km;
            }
        }
        throw new RouteNotFoundException(pickup, destination);
    }

    @Override
    public List<String> getPlaces(String city) {
        TreeSet<String> places = new TreeSet<>();   // sorted, no duplicates
        Map<String, Double> cityRoutes = routes.get(city.toLowerCase());
        if (cityRoutes != null) {
            for (String routeKey : cityRoutes.keySet()) {
                String[] parts = routeKey.split("\\|");
                places.add(parts[0]);
                places.add(parts[1]);
            }
        }
        return new ArrayList<>(places);
    }

    /** Adds a route between two places (usable from both directions). */
    public void addRoute(String city, String placeA, String placeB, double km) {
        routes.computeIfAbsent(city.toLowerCase(), c -> new HashMap<>())
              .put(key(placeA, placeB), km);
    }

    private static String key(String a, String b) {
        return a.trim() + "|" + b.trim();
    }

    /** Sample routes. Add more lines here to support more places. */
    private void loadSampleRoutes() {
        // ----- Kochi -----
        addRoute("Kochi", "Edappally", "Kaloor", 4.5);
        addRoute("Kochi", "Edappally", "MG Road", 8.0);
        addRoute("Kochi", "Edappally", "Vyttila", 7.5);
        addRoute("Kochi", "Edappally", "Ernakulam South Railway Station", 8.5);
        addRoute("Kochi", "Edappally", "Kakkanad", 8.0);
        addRoute("Kochi", "Edappally", "Aluva", 12.0);
        addRoute("Kochi", "Kaloor", "MG Road", 3.5);
        addRoute("Kochi", "Kaloor", "Vyttila", 6.0);
        addRoute("Kochi", "Kaloor", "Ernakulam South Railway Station", 4.0);
        addRoute("Kochi", "Kaloor", "Kakkanad", 9.0);
        addRoute("Kochi", "MG Road", "Vyttila", 5.0);
        addRoute("Kochi", "MG Road", "Ernakulam South Railway Station", 2.0);
        addRoute("Kochi", "MG Road", "Fort Kochi", 12.0);
        addRoute("Kochi", "Vyttila", "Ernakulam South Railway Station", 4.5);
        addRoute("Kochi", "Vyttila", "Kakkanad", 7.0);

        // ----- Thiruvananthapuram -----
        addRoute("Thiruvananthapuram", "Thampanoor", "East Fort", 1.5);
        addRoute("Thiruvananthapuram", "Thampanoor", "Pattom", 5.0);
        addRoute("Thiruvananthapuram", "Thampanoor", "Kowdiar", 5.0);
        addRoute("Thiruvananthapuram", "Thampanoor", "Medical College", 6.5);
        addRoute("Thiruvananthapuram", "Thampanoor", "Technopark", 14.0);
        addRoute("Thiruvananthapuram", "East Fort", "Pattom", 5.5);
        addRoute("Thiruvananthapuram", "Pattom", "Kesavadasapuram", 1.5);
        addRoute("Thiruvananthapuram", "Pattom", "Medical College", 2.5);
        addRoute("Thiruvananthapuram", "Pattom", "Technopark", 10.0);
        addRoute("Thiruvananthapuram", "Kesavadasapuram", "Technopark", 9.0);

        // ----- Kozhikode -----
        addRoute("Kozhikode", "Kozhikode Railway Station", "Mananchira", 1.5);
        addRoute("Kozhikode", "Kozhikode Railway Station", "Kozhikode Beach", 2.0);
        addRoute("Kozhikode", "Kozhikode Railway Station", "Medical College", 8.0);
        addRoute("Kozhikode", "Mananchira", "Palayam", 1.0);
        addRoute("Kozhikode", "Mananchira", "Medical College", 7.0);
        addRoute("Kozhikode", "Palayam", "Kozhikode Beach", 2.5);

        // ----- Bengaluru -----
        addRoute("Bengaluru", "Majestic", "MG Road", 5.0);
        addRoute("Bengaluru", "Majestic", "Jayanagar", 7.5);
        addRoute("Bengaluru", "MG Road", "Indiranagar", 5.5);
        addRoute("Bengaluru", "MG Road", "Koramangala", 7.0);
        addRoute("Bengaluru", "Koramangala", "Indiranagar", 6.5);
        addRoute("Bengaluru", "Koramangala", "Jayanagar", 5.0);
        addRoute("Bengaluru", "Indiranagar", "Whitefield", 15.0);

        // ----- Chennai -----
        addRoute("Chennai", "Chennai Central", "Egmore", 2.5);
        addRoute("Chennai", "Chennai Central", "T Nagar", 8.0);
        addRoute("Chennai", "Egmore", "T Nagar", 6.5);
        addRoute("Chennai", "T Nagar", "Adyar", 6.0);
        addRoute("Chennai", "Adyar", "Marina Beach", 6.5);
        addRoute("Chennai", "Chennai Central", "Marina Beach", 4.0);
    }
}
