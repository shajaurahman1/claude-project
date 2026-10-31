/*
 * FairFare web version: connects the page to the fare logic in fare.js.
 * History and edited rates are kept in this browser (localStorage).
 */
(function () {
  const $ = id => document.getElementById(id);
  const money = n => "Rs " + n.toFixed(2);
  const hh = h => String(h).padStart(2, "0") + ":00";

  // ----- Storage (wrapped so the page still works if storage is blocked) -----
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
  };

  const calculator = new AutoFareCalculator();
  const checker = new FareChecker();
  const distances = new RouteTableDistanceProvider();

  let rates = loadRates();
  let history = store.get("ff_history", []);

  function loadRates() {
    const saved = store.get("ff_rates", null);
    if (Array.isArray(saved) && saved.length) {
      try { return saved.map(CityRate.from); } catch (e) { /* fall back */ }
    }
    return DEFAULT_RATES.map(r => CityRate.from(r));
  }
  function saveRates() { store.set("ff_rates", rates); }
  function saveHistory() { store.set("ff_history", history); }
  const findRate = name => rates.find(r => r.cityName.toLowerCase() === String(name).toLowerCase());

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  // ----- Tabs -----
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });
  function showTab(name) {
    document.querySelectorAll(".tab").forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    document.querySelectorAll(".panel").forEach(p => { p.hidden = p.id !== "tab-" + name; });
    if (name === "history") renderHistory();
    if (name === "rates") renderRates();
    if (name === "check") fillCities();
  }

  // ================= CHECK FARE =================
  function fillCities() {
    const sel = $("city"), current = sel.value;
    sel.innerHTML = "";
    rates.forEach(r => sel.add(new Option(r.cityName, r.cityName)));
    if (findRate(current)) sel.value = current;
    onCityChange();
  }

  function onCityChange() {
    const rate = findRate($("city").value);
    const list = $("places");
    list.innerHTML = "";
    if (!rate) return;
    distances.getPlaces(rate.cityName).forEach(p => list.appendChild(new Option(p)));
    const hour = new Date().getHours();
    $("night").checked = rate.isNightHour(hour);
    $("nightHint").textContent = `(${hh(rate.nightStartHour)}–${hh(rate.nightEndHour)}, +${rate.nightPercent}%)`;
    $("distanceHint").textContent = "";
  }
  $("city").addEventListener("change", onCityChange);

  function lookupDistance(showMessage) {
    const rate = findRate($("city").value);
    const p = $("pickup").value.trim(), d = $("destination").value.trim();
    if (!rate || !p || !d) {
      if (showMessage) showFormError("Enter the pickup point and destination first.");
      return null;
    }
    const km = distances.getDistance(rate.cityName, p, d);
    if (km === null) {
      $("distanceHint").textContent = "Route not in our list. Type the distance from Google Maps.";
      if (showMessage) $("distance").focus();
      return null;
    }
    // Use the proper spelling of known places, e.g. "kaloor" -> "Kaloor".
    const places = distances.getPlaces(rate.cityName);
    const proper = name => places.find(x => x.toLowerCase() === name.toLowerCase()) || name;
    $("pickup").value = proper(p);
    $("destination").value = proper(d);
    $("distance").value = km;
    $("distanceHint").textContent = `Found: ${km} km`;
    hideFormError();
    return km;
  }
  $("getDistance").addEventListener("click", () => lookupDistance(true));
  ["pickup", "destination"].forEach(id => $(id).addEventListener("change", () => {
    if ($("pickup").value.trim() && $("destination").value.trim()) lookupDistance(false);
  }));

  function showFormError(msg) { const e = $("formError"); e.textContent = msg; e.hidden = false; }
  function hideFormError() { $("formError").hidden = true; }

  $("checkForm").addEventListener("submit", e => {
    e.preventDefault();
    hideFormError();
    const rate = findRate($("city").value);
    const pickup = $("pickup").value.trim();
    const destination = $("destination").value.trim();

    // Validation (same rules as FareService.java)
    if (!rate) return showFormError("Please add a city in Fare Rates first.");
    if (!pickup) return showFormError("Pickup point cannot be empty.");
    if (!destination) return showFormError("Destination cannot be empty.");
    if ($("distance").value.trim() === "" && lookupDistance(false) === null) {
      return showFormError("Distance is not known for this route. Please type the distance (km).");
    }
    const distanceKm = parseFloat($("distance").value);
    const waitingMinutes = $("waiting").value.trim() === "" ? 0 : Number($("waiting").value);
    const demanded = parseFloat($("demanded").value);

    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return showFormError("Distance must be more than 0 km.");
    if (distanceKm > 200) return showFormError("Distance looks too long for an auto trip (max 200 km).");
    if (!Number.isInteger(waitingMinutes) || waitingMinutes < 0) return showFormError("Waiting time must be a whole number of minutes (0 or more).");
    if (!Number.isFinite(demanded) || demanded <= 0) return showFormError("Enter the amount the driver asked for (more than 0).");

    const trip = { pickup, destination, distanceKm, waitingMinutes, nightTrip: $("night").checked };
    const breakdown = calculator.calculate(rate, trip);
    const official = breakdown.roundedTotal;
    const verdict = checker.check(official, demanded);

    const record = {
      date: new Date().toISOString(), city: rate.cityName, pickup, destination, distanceKm,
      waitingMinutes, nightTrip: trip.nightTrip, official, demanded, verdict,
    };
    history.push(record);
    saveHistory();
    showResult(record, breakdown);

    // On phones, scroll the result into view.
    if (window.innerWidth < 860) $("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function showResult(r, breakdown) {
    const diff = r.demanded - r.official;
    const fair = r.verdict === "FAIR";
    const box = $("verdict");
    box.className = "verdict " + (fair ? "fair" : "excessive");
    $("verdictText").textContent = r.verdict;
    $("verdictSub").textContent = fair
      ? (diff > 0 ? `Driver asked ${money(diff)} more (within the Rs ${FareChecker.ALLOWED_MARGIN} margin)` : "Driver's demand is within the official fare")
      : `Driver asked ${money(diff)} MORE than the official fare`;

    $("statOfficial").textContent = money(r.official);
    $("statDemanded").textContent = money(r.demanded);
    const d = $("statDiff");
    d.textContent = (diff >= 0 ? "+" : "−") + Math.abs(diff).toFixed(2);
    d.className = fair ? "green" : "red";

    const lines = breakdown.lines.map(l =>
      `<div class="bline"><div class="desc">${esc(l.name)}<small>${esc(l.text)}</small></div><div class="amt">${money(l.amount)}</div></div>`
    ).join("");
    $("breakdown").innerHTML =
      `<p class="meta">${esc(r.pickup)} → ${esc(r.destination)} · ${esc(r.city)} · ${r.distanceKm.toFixed(2)} km</p>` +
      lines +
      `<div class="bline total"><div>Official fare (rounded)</div><div class="amt">${money(r.official)}</div></div>` +
      `<p class="meta">Saved to history.</p>`;
  }

  function resetResult() {
    $("verdict").className = "verdict neutral";
    $("verdictText").textContent = "Enter trip details";
    $("verdictSub").textContent = "Fill in the trip and press Check Fare";
    ["statOfficial", "statDemanded", "statDiff"].forEach(id => { $(id).textContent = "–"; $(id).className = ""; });
    $("breakdown").innerHTML = '<p class="muted">The breakdown will appear here.</p>';
  }

  $("clearBtn").addEventListener("click", () => {
    ["pickup", "destination", "distance", "demanded"].forEach(id => { $(id).value = ""; });
    $("waiting").value = 0;
    hideFormError();
    onCityChange();
    resetResult();
  });

  // ================= HISTORY =================
  function renderHistory() {
    const excessive = history.filter(h => h.verdict === "EXCESSIVE");
    $("hTotal").textContent = history.length;
    $("hFair").textContent = history.length - excessive.length;
    $("hExcessive").textContent = excessive.length;
    $("hOver").textContent = money(excessive.reduce((s, h) => s + (h.demanded - h.official), 0));

    const list = $("historyList");
    if (!history.length) {
      list.innerHTML = '<li class="muted">No checks yet. Your fare checks will appear here.</li>';
      return;
    }
    list.innerHTML = history.slice().reverse().map(h => {
      const diff = h.demanded - h.official;
      const when = new Date(h.date).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
      return `<li>
        <div class="h-top">
          <div><div class="h-route">${esc(h.pickup)} → ${esc(h.destination)}</div>
          <div class="h-meta">${esc(h.city)} · ${when} · ${h.distanceKm.toFixed(1)} km${h.waitingMinutes ? " · " + h.waitingMinutes + " min wait" : ""}${h.nightTrip ? " · night" : ""}</div></div>
          <span class="pill ${h.verdict === "FAIR" ? "fair" : "excessive"}">${h.verdict}</span>
        </div>
        <div class="h-nums"><span>Official ${money(h.official)}</span><span>Asked ${money(h.demanded)}</span><span class="${h.verdict === "FAIR" ? "green" : "red"}">${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)}</span></div>
      </li>`;
    }).join("");
  }

  $("clearHistory").addEventListener("click", () => {
    if (!history.length) return;
    if (!confirm("Delete all trip history? This cannot be undone.")) return;
    history = [];
    saveHistory();
    renderHistory();
    toast("History cleared");
  });

  // ================= RATES =================
  let editing = null;   // city name being edited, or null for a new city

  function renderRates() {
    $("rateList").innerHTML = rates.map((r, i) => `<li>
      <div class="r-top">
        <div><div class="r-name">${esc(r.cityName)}</div>
        <div class="r-detail">Rs ${r.minimumFare} for ${r.minimumDistance} km, then Rs ${r.perKmRate}/km · wait Rs ${r.waitingPerMinute}/min · night +${r.nightPercent}% (${hh(r.nightStartHour)}–${hh(r.nightEndHour)})</div></div>
        <div class="r-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${i}">Edit</button>
          <button class="btn btn-danger btn-sm" data-del="${i}" aria-label="Delete ${esc(r.cityName)}">✕</button>
        </div>
      </div></li>`).join("") || '<li class="muted">No cities. Add one below or reset defaults.</li>';
  }

  $("rateList").addEventListener("click", e => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    if (edit) {
      const r = rates[+edit.dataset.edit];
      editing = r.cityName;
      $("rateFormTitle").textContent = "Edit " + r.cityName;
      $("rCity").value = r.cityName; $("rMinFare").value = r.minimumFare; $("rMinKm").value = r.minimumDistance;
      $("rPerKm").value = r.perKmRate; $("rWait").value = r.waitingPerMinute; $("rNight").value = r.nightPercent;
      $("rFrom").value = r.nightStartHour; $("rTo").value = r.nightEndHour;
      $("rateError").hidden = true;
      $("rateForm").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (del) {
      const r = rates[+del.dataset.del];
      if (!confirm("Delete rates for " + r.cityName + "?")) return;
      rates.splice(+del.dataset.del, 1);
      saveRates(); renderRates(); fillCities();
      toast(r.cityName + " deleted");
    }
  });

  function clearRateForm() {
    editing = null;
    $("rateFormTitle").textContent = "Add a city";
    ["rCity", "rMinFare", "rMinKm", "rPerKm", "rWait", "rNight", "rFrom", "rTo"].forEach(id => { $(id).value = ""; });
    $("rateError").hidden = true;
  }
  $("rateCancel").addEventListener("click", clearRateForm);

  $("rateForm").addEventListener("submit", e => {
    e.preventDefault();
    const num = id => $(id).value.trim() === "" ? NaN : Number($(id).value);
    try {
      const rate = new CityRate($("rCity").value, num("rMinFare"), num("rMinKm"), num("rPerKm"),
        num("rWait"), num("rNight"), num("rFrom"), num("rTo"));
      // Replace the city being edited (or one with the same name), else add.
      const idx = rates.findIndex(r => r.cityName.toLowerCase() === (editing || rate.cityName).toLowerCase());
      if (idx >= 0) rates[idx] = rate; else rates.push(rate);
      saveRates(); renderRates(); fillCities(); clearRateForm();
      toast("Rates saved for " + rate.cityName);
    } catch (err) {
      $("rateError").textContent = err.message;
      $("rateError").hidden = false;
    }
  });

  $("resetRates").addEventListener("click", () => {
    if (!confirm("Reset all fare rates to the defaults?")) return;
    rates = DEFAULT_RATES.map(r => CityRate.from(r));
    saveRates(); renderRates(); fillCities(); clearRateForm();
    toast("Rates reset");
  });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  fillCities();
})();
