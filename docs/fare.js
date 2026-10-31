/*
 * FairFare web version: fare logic.
 * Same classes, formula and rules as the Java app (src/fairfare/...).
 */

// ----- model/CityRate.java -----
class CityRate {
  constructor(cityName, minimumFare, minimumDistance, perKmRate,
              waitingPerMinute, nightPercent, nightStartHour, nightEndHour) {
    if (!cityName || !String(cityName).trim()) throw new Error("City name cannot be empty.");
    const nums = { "Minimum fare": minimumFare, "Minimum distance": minimumDistance,
      "Per-km rate": perKmRate, "Waiting charge": waitingPerMinute, "Night charge %": nightPercent };
    for (const [name, v] of Object.entries(nums)) {
      if (!Number.isFinite(v)) throw new Error(name + " must be a number.");
      if (v < 0) throw new Error(name + " cannot be negative.");
    }
    for (const [name, h] of [["Night start hour", nightStartHour], ["Night end hour", nightEndHour]]) {
      if (!Number.isInteger(h) || h < 0 || h > 23) throw new Error(name + " must be a whole number between 0 and 23.");
    }
    this.cityName = String(cityName).trim();
    this.minimumFare = minimumFare;
    this.minimumDistance = minimumDistance;
    this.perKmRate = perKmRate;
    this.waitingPerMinute = waitingPerMinute;
    this.nightPercent = nightPercent;
    this.nightStartHour = nightStartHour;
    this.nightEndHour = nightEndHour;
  }

  /** True if the hour (0-23) is in the night window, which may cross midnight. */
  isNightHour(hour) {
    if (this.nightStartHour > this.nightEndHour) {
      return hour >= this.nightStartHour || hour < this.nightEndHour;
    }
    return hour >= this.nightStartHour && hour < this.nightEndHour;
  }

  static from(o) {
    return new CityRate(o.cityName, +o.minimumFare, +o.minimumDistance, +o.perKmRate,
      +o.waitingPerMinute, +o.nightPercent, +o.nightStartHour, +o.nightEndHour);
  }
}

// ----- charges/Charge.java and subclasses -----
class Charge {
  constructor(name) { this.name = name; }
  appliesTo(rate, trip) { throw new Error("abstract"); }
  calculate(rate, trip) { throw new Error("abstract"); }
  describe(rate, trip) { throw new Error("abstract"); }
}

class BaseFareCharge extends Charge {
  constructor() { super("Distance fare"); }
  appliesTo() { return true; }
  calculate(rate, trip) {
    if (trip.distanceKm <= rate.minimumDistance) return rate.minimumFare;
    return rate.minimumFare + (trip.distanceKm - rate.minimumDistance) * rate.perKmRate;
  }
  describe(rate, trip) {
    if (trip.distanceKm <= rate.minimumDistance) {
      return `Minimum fare (up to ${rate.minimumDistance.toFixed(1)} km)`;
    }
    return `Rs ${rate.minimumFare.toFixed(2)} + ${(trip.distanceKm - rate.minimumDistance).toFixed(2)} km × Rs ${rate.perKmRate.toFixed(2)}`;
  }
}

class WaitingCharge extends Charge {
  constructor() { super("Waiting charge"); }
  appliesTo(rate, trip) { return trip.waitingMinutes > 0; }
  calculate(rate, trip) { return trip.waitingMinutes * rate.waitingPerMinute; }
  describe(rate, trip) { return `${trip.waitingMinutes} min × Rs ${rate.waitingPerMinute.toFixed(2)}`; }
}

class NightCharge extends Charge {
  constructor() { super("Night charge"); this.baseFare = new BaseFareCharge(); }
  appliesTo(rate, trip) { return trip.nightTrip && rate.nightPercent > 0; }
  calculate(rate, trip) { return this.baseFare.calculate(rate, trip) * rate.nightPercent / 100; }
  describe(rate) {
    const hh = h => String(h).padStart(2, "0") + ":00";
    return `${rate.nightPercent}% of distance fare (${hh(rate.nightStartHour)}–${hh(rate.nightEndHour)})`;
  }
}

// ----- service/AutoFareCalculator.java -----
class AutoFareCalculator {
  constructor() { this.charges = [new BaseFareCharge(), new WaitingCharge(), new NightCharge()]; }
  calculate(rate, trip) {
    const lines = [];
    for (const c of this.charges) {
      if (c.appliesTo(rate, trip)) lines.push({ name: c.name, text: c.describe(rate, trip), amount: c.calculate(rate, trip) });
    }
    const total = lines.reduce((s, l) => s + l.amount, 0);
    return { lines, total, roundedTotal: Math.round(total) };
  }
}

// ----- service/FareChecker.java -----
class FareChecker {
  static ALLOWED_MARGIN = 5;
  check(officialFare, demandedFare) {
    return demandedFare <= officialFare + FareChecker.ALLOWED_MARGIN ? "FAIR" : "EXCESSIVE";
  }
}

// ----- service/RouteTableDistanceProvider.java -----
class RouteTableDistanceProvider {
  constructor() {
    this.routes = {};
    const add = (city, a, b, km) => {
      const c = city.toLowerCase();
      (this.routes[c] ||= {})[a + "|" + b] = km;
    };
    [
      ["Kochi", "Edappally", "Kaloor", 4.5], ["Kochi", "Edappally", "MG Road", 8.0],
      ["Kochi", "Edappally", "Vyttila", 7.5], ["Kochi", "Edappally", "Ernakulam South Railway Station", 8.5],
      ["Kochi", "Edappally", "Kakkanad", 8.0], ["Kochi", "Edappally", "Aluva", 12.0],
      ["Kochi", "Kaloor", "MG Road", 3.5], ["Kochi", "Kaloor", "Vyttila", 6.0],
      ["Kochi", "Kaloor", "Ernakulam South Railway Station", 4.0], ["Kochi", "Kaloor", "Kakkanad", 9.0],
      ["Kochi", "MG Road", "Vyttila", 5.0], ["Kochi", "MG Road", "Ernakulam South Railway Station", 2.0],
      ["Kochi", "MG Road", "Fort Kochi", 12.0], ["Kochi", "Vyttila", "Ernakulam South Railway Station", 4.5],
      ["Kochi", "Vyttila", "Kakkanad", 7.0],
      ["Thiruvananthapuram", "Thampanoor", "East Fort", 1.5], ["Thiruvananthapuram", "Thampanoor", "Pattom", 5.0],
      ["Thiruvananthapuram", "Thampanoor", "Kowdiar", 5.0], ["Thiruvananthapuram", "Thampanoor", "Medical College", 6.5],
      ["Thiruvananthapuram", "Thampanoor", "Technopark", 14.0], ["Thiruvananthapuram", "East Fort", "Pattom", 5.5],
      ["Thiruvananthapuram", "Pattom", "Kesavadasapuram", 1.5], ["Thiruvananthapuram", "Pattom", "Medical College", 2.5],
      ["Thiruvananthapuram", "Pattom", "Technopark", 10.0], ["Thiruvananthapuram", "Kesavadasapuram", "Technopark", 9.0],
      ["Kozhikode", "Kozhikode Railway Station", "Mananchira", 1.5], ["Kozhikode", "Kozhikode Railway Station", "Kozhikode Beach", 2.0],
      ["Kozhikode", "Kozhikode Railway Station", "Medical College", 8.0], ["Kozhikode", "Mananchira", "Palayam", 1.0],
      ["Kozhikode", "Mananchira", "Medical College", 7.0], ["Kozhikode", "Palayam", "Kozhikode Beach", 2.5],
      ["Bengaluru", "Majestic", "MG Road", 5.0], ["Bengaluru", "Majestic", "Jayanagar", 7.5],
      ["Bengaluru", "MG Road", "Indiranagar", 5.5], ["Bengaluru", "MG Road", "Koramangala", 7.0],
      ["Bengaluru", "Koramangala", "Indiranagar", 6.5], ["Bengaluru", "Koramangala", "Jayanagar", 5.0],
      ["Bengaluru", "Indiranagar", "Whitefield", 15.0],
      ["Chennai", "Chennai Central", "Egmore", 2.5], ["Chennai", "Chennai Central", "T Nagar", 8.0],
      ["Chennai", "Egmore", "T Nagar", 6.5], ["Chennai", "T Nagar", "Adyar", 6.0],
      ["Chennai", "Adyar", "Marina Beach", 6.5], ["Chennai", "Chennai Central", "Marina Beach", 4.0],
    ].forEach(r => add(...r));
  }

  /** Returns km, or null if the route is not known. Case-insensitive, works both ways. */
  getDistance(city, pickup, destination) {
    const p = pickup.trim().toLowerCase(), d = destination.trim().toLowerCase();
    if (p === d) return 0;
    const table = this.routes[city.toLowerCase()] || {};
    for (const [key, km] of Object.entries(table)) {
      const [a, b] = key.toLowerCase().split("|");
      if ((a === p && b === d) || (a === d && b === p)) return km;
    }
    return null;
  }

  getPlaces(city) {
    const set = new Set();
    for (const key of Object.keys(this.routes[city.toLowerCase()] || {})) key.split("|").forEach(x => set.add(x));
    return [...set].sort();
  }
}

// ----- storage/RateRepository.java defaults -----
const DEFAULT_RATES = [
  new CityRate("Kochi", 30, 1.5, 15, 1, 50, 22, 5),
  new CityRate("Thiruvananthapuram", 30, 1.5, 15, 1, 50, 22, 5),
  new CityRate("Kozhikode", 30, 1.5, 15, 1, 50, 22, 5),
  new CityRate("Bengaluru", 30, 2.0, 15, 1, 50, 22, 5),
  new CityRate("Chennai", 50, 1.8, 18, 1, 50, 23, 5),
];
