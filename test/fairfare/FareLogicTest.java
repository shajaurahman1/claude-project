package fairfare;

import fairfare.exception.RouteNotFoundException;
import fairfare.model.CityRate;
import fairfare.model.FareBreakdown;
import fairfare.model.TripRequest;
import fairfare.model.Verdict;
import fairfare.service.AutoFareCalculator;
import fairfare.service.FareChecker;
import fairfare.service.RouteTableDistanceProvider;

/**
 * Simple tests for the fare logic (no extra libraries needed).
 * Run with:  java -cp out fairfare.FareLogicTest
 */
public class FareLogicTest {

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) throws Exception {
        CityRate kochi = new CityRate("Kochi", 30, 1.5, 15, 1, 50, 22, 5);
        AutoFareCalculator calc = new AutoFareCalculator();
        FareChecker checker = new FareChecker();

        // Short trip -> only minimum fare
        check("1 km = minimum fare", 30.0, total(calc, kochi, 1.0, 0, false));
        // 5 km -> 30 + 3.5 x 15 = 82.50
        check("5 km day fare", 82.5, total(calc, kochi, 5.0, 0, false));
        // 5 km + 10 min waiting -> 82.50 + 10 = 92.50
        check("5 km + waiting", 92.5, total(calc, kochi, 5.0, 10, false));
        // 5 km at night -> 82.50 + 50% = 123.75
        check("5 km night", 123.75, total(calc, kochi, 5.0, 0, true));

        // Verdicts
        check("demand 85 on 83 is FAIR", Verdict.FAIR, checker.check(83, 85));
        check("demand 150 on 83 is EXCESSIVE", Verdict.EXCESSIVE, checker.check(83, 150));

        // Night window crossing midnight
        check("23:00 is night", true, kochi.isNightHour(23));
        check("03:00 is night", true, kochi.isNightHour(3));
        check("12:00 is day", false, kochi.isNightHour(12));

        // Distance lookup works both ways
        RouteTableDistanceProvider routes = new RouteTableDistanceProvider();
        check("Kaloor -> MG Road", 3.5, routes.getDistance("Kochi", "Kaloor", "MG Road"));
        check("MG Road -> Kaloor", 3.5, routes.getDistance("Kochi", "MG Road", "Kaloor"));
        try {
            routes.getDistance("Kochi", "Nowhere", "MG Road");
            fail("unknown route should throw");
        } catch (RouteNotFoundException e) {
            pass("unknown route throws RouteNotFoundException");
        }

        // Validation in CityRate setters
        try {
            new CityRate("Test", -5, 1, 1, 1, 0, 22, 5);
            fail("negative fare should be rejected");
        } catch (IllegalArgumentException e) {
            pass("negative fare rejected");
        }

        System.out.println("\nPassed: " + passed + "  Failed: " + failed);
        if (failed > 0) {
            System.exit(1);
        }
    }

    private static double total(AutoFareCalculator calc, CityRate rate, double km, int wait, boolean night) {
        FareBreakdown b = calc.calculate(rate, new TripRequest("A", "B", km, wait, night));
        return b.getTotal();
    }

    private static void check(String name, Object expected, Object actual) {
        if (expected.equals(actual)) {
            pass(name);
        } else {
            fail(name + " (expected " + expected + ", got " + actual + ")");
        }
    }

    private static void pass(String name) { passed++; System.out.println("PASS  " + name); }
    private static void fail(String name) { failed++; System.out.println("FAIL  " + name); }
}
