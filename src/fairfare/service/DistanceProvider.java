package fairfare.service;

import fairfare.exception.RouteNotFoundException;

import java.util.List;

/**
 * Something that can tell the travel distance between two places.
 *
 * OOP concept: INTERFACE / ABSTRACTION - today the distance comes from a
 * built-in route table (RouteTableDistanceProvider). Later it could come
 * from an online maps service without changing any other class.
 */
public interface DistanceProvider {

    /** Returns road distance in km, or throws if the route is unknown. */
    double getDistance(String city, String pickup, String destination)
            throws RouteNotFoundException;

    /** Returns the known place names in a city (for the drop-down lists). */
    List<String> getPlaces(String city);
}
