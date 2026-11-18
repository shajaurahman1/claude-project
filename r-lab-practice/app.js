/* R Lab Practice — app logic.
   Runs real R in the browser with WebR. If WebR can't start, the lessons and
   editor still work, and checking is switched off: no result is ever faked. */
(function () {
"use strict";

// ---------- small helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
const ORDER = [
  ...EXERCISES.filter((e) => e.group === "set" && e.mode === "fill"),
  ...EXERCISES.filter((e) => e.group === "set" && e.mode === "blank"),
  ...EXERCISES.filter((e) => e.group === "var"),
];
const label = (e) => (e.group === "set" ? `Set ${e.set} · Q${e.q}` : `Variation ${e.vn}`);
const shortLabel = (e) => (e.group === "set" ? `${e.set}.${e.q}` : `V${e.vn}`);
const blankStarter = (e) =>
  `# ${label(e)}: ${e.title}\n# Write your R code below. Use readline() for keyboard input.\n\n`;
const starterOf = (e) => (e.mode === "fill" ? e.starter : blankStarter(e));
const defaultInput = (e) => ((e.tests.find((t) => t.in) || {}).in || []).join("\n");

// ---------- local storage (drafts and progress) ----------
const KEY = "rlab-practice-v1";
let store = { drafts: {}, inputs: {}, status: {}, hints: {}, sol: {}, last: null, mock: null, mockHistory: [] };
try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) { /* storage blocked */ }
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } }, 250);
}

// ---------- R engine (WebR) ----------
const WEBR_VERSION = "0.5.9";
function webrSources() {
  const list = [];
  try {
    const q = new URLSearchParams(location.search).get("webr");
    // Only same-site relative paths are accepted (for an offline copy of WebR).
    if (q && /^\.{0,2}\/[\w./-]*$/.test(q) && !q.includes("//")) list.push({ base: new URL(q.endsWith("/") ? q : q + "/", location.href).href, entry: "webr.js" });
  } catch (e) { /* ignore */ }
  // The official CDN serves a browser build as webr.mjs; the npm package's browser build is webr.js.
  list.push({ base: `https://webr.r-wasm.org/v${WEBR_VERSION}/`, entry: "webr.mjs" },
            { base: `https://cdn.jsdelivr.net/npm/webr@${WEBR_VERSION}/dist/`, entry: "webr.js" });
  return list;
}

const R_SETUP = String.raw`
.rlab_inputs <- character(0); .rlab_echo <- TRUE; .rlab_err <- FALSE; .rlab_env <- globalenv()
readline <- function(prompt = "") {
  if (.rlab_echo) cat(prompt)
  if (length(.rlab_inputs) == 0) {
    if (.rlab_echo) cat("\n")
    stop("readline() wanted a value, but the Input box has no more lines. Type one value per line in the Input box.", call. = FALSE)
  }
  v <- .rlab_inputs[1]
  assign(".rlab_inputs", .rlab_inputs[-1], envir = globalenv())
  if (.rlab_echo) cat(v, "\n", sep = "")
  v
}
.rlab_sample <- function() {
  df <- data.frame(
    name  = c("Anu", "Bilal", "Chitra", "Devan", "Esha", "Farhan", "Gopika", "Hari"),
    roll  = 101:108,
    marks = c(82, 67, 91, 45, 76, 58, 88, 72),
    dept  = c("CSBS", "CSBS", "CSE", "ECE", "CSBS", "CSE", "ECE", "CSBS"))
  write.csv(df, "class_marks.csv", row.names = FALSE)
}
.rlab_prepare <- function(inputs, echo = TRUE, test = FALSE) {
  assign(".rlab_inputs", as.character(inputs), envir = globalenv())
  assign(".rlab_echo", echo, envir = globalenv())
  assign(".rlab_err", FALSE, envir = globalenv())
  home <- "/home/web_user"
  if (test) {
    d <- file.path(home, ".rlab_test")
    unlink(d, recursive = TRUE); dir.create(d, showWarnings = FALSE); setwd(d)
  } else setwd(home)
  if (!file.exists("class_marks.csv")) .rlab_sample()
  assign(".rlab_env", new.env(parent = globalenv()), envir = globalenv())
  invisible(NULL)
}
.rlab_run <- function(file) {
  withCallingHandlers(
    tryCatch(source(file, local = .rlab_env, echo = FALSE, print.eval = TRUE, keep.source = FALSE),
      error = function(e) {
        assign(".rlab_err", TRUE, envir = globalenv())
        cl <- conditionCall(e); where <- ""
        if (!is.null(cl)) {
          s <- deparse(cl)[1]
          if (!grepl("^(eval|source|withVisible|doTryCatch|withCallingHandlers)\\(", s)) where <- paste0(" in ", s)
        }
        cat("Error", where, ": ", conditionMessage(e), "\n", sep = "", file = stderr())
      }),
    warning = function(w) { cat("Warning: ", conditionMessage(w), "\n", sep = "", file = stderr()); invokeRestart("muffleWarning") },
    message = function(m) { cat(conditionMessage(m), sep = "", file = stderr()); invokeRestart("muffleMessage") })
  invisible(NULL)
}
`;

const Engine = {
  state: "off", webR: null, shelter: null, base: null, error: null, busy: false, abort: null, listeners: [],
  on(fn) { this.listeners.push(fn); },
  set(state, msg) { this.state = state; this.msg = msg || ""; this.listeners.forEach((f) => f(state, this.msg)); },
  start() {
    if (this.starting) return this.starting;
    this.starting = this._start().finally(() => { this.starting = null; });
    return this.starting;
  },
  async _start() {
    this.set("loading", "Starting R (first load downloads about 25 MB)…");
    const sources = this.base ? [this.base] : webrSources();
    const errors = [];
    for (const src of sources) {
      const base = src.base;
      let webR = null;
      try {
        // Quick reachability probe: fails at once where the page may not download R.
        const probe = await withTimeout(fetch(base + "webr-worker.js", { method: "HEAD", cache: "no-store" }), 15000, "No response from " + base);
        if (!probe.ok) throw new Error("HTTP " + probe.status + " from " + base);
        const mod = await withTimeout(import(base + src.entry), 20000, "Loading WebR timed out");
        webR = new mod.WebR({ baseUrl: base, channelType: mod.ChannelType.PostMessage, interactive: false });
        await withTimeout(webR.init(), 180000, "Starting R timed out");
        await webR.evalRVoid(R_SETUP);
        this.webR = webR; this.base = src;
        this.shelter = await new webR.Shelter();
        this.error = null;
        this.set("ready", "R is ready");
        return true;
      } catch (e) {
        errors.push(base + ": " + String((e && e.message) || e));
        try { webR && webR.close(); } catch (e2) { /* ignore */ }
      }
    }
    this.error = errors.join(" | ") || "unknown error";
    this.set("failed", "R could not start here");
    return false;
  },
  async restart() {
    if (this.starting) await this.starting.catch(() => {});
    if (this.abort) { this.abort("restart"); this.abort = null; }
    try { this.webR && this.webR.close(); } catch (e) { /* ignore */ }
    this.webR = null; this.shelter = null; this.busy = false;
    this.state = "off";
    return this.start();
  },
  // Runs code for real. Returns { out:[{type,text}], images:[canvas], error, timedOut, stopped }.
  async run(code, inputs, { test = false, timeout = 30000 } = {}) {
    if (this.state !== "ready") throw new Error("R is not running");
    this.busy = true; this.set("busy", test ? "Checking…" : "Running…");
    const webR = this.webR, shelter = this.shelter;
    let stopReason = null;
    const stopper = new Promise((_, rej) => { this.abort = (why) => { stopReason = why; rej(new Error(why)); }; });
    let timer = null;
    const timeoutP = new Promise((_, rej) => { timer = setTimeout(() => { stopReason = "timeout"; rej(new Error("timeout")); }, timeout); });
    try {
      await webR.FS.writeFile("/home/web_user/your_code.R", new TextEncoder().encode(code));
      const vec = "c(" + inputs.map((s) => JSON.stringify(String(s))).join(", ") + ")";
      const rcode = `.rlab_prepare(${vec}, echo = ${test ? "FALSE" : "TRUE"}, test = ${test ? "TRUE" : "FALSE"}); .rlab_run("/home/web_user/your_code.R")`;
      const cap = await Promise.race([
        shelter.captureR(rcode, { captureGraphics: { width: 640, height: 440 }, captureConditions: false, withAutoprint: false }),
        stopper, timeoutP,
      ]);
      const out = cap.output.map((o) => ({ type: o.type, text: typeof o.data === "string" ? o.data : String(o.data) }));
      const images = cap.images.map((img) => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; c.getContext("2d").drawImage(img, 0, 0); return c; });
      const error = await webR.evalRBoolean(".rlab_err");
      await shelter.purge();
      return { out, images, error, timedOut: false, stopped: false };
    } catch (e) {
      if (stopReason) {
        // The worker is stuck (probably an endless loop). Replace it with a fresh R.
        this.abort = null;
        if (stopReason !== "restart") await this.restart();
        return { out: [], images: [], error: true, timedOut: stopReason === "timeout", stopped: stopReason !== "timeout" };
      }
      throw e;
    } finally {
      clearTimeout(timer);
      this.abort = null; this.busy = false;
      if (this.state === "busy") this.set("ready", "R is ready");
    }
  },
  stop() { if (this.abort) this.abort("stopped"); },
  // Evaluate an R expression inside the environment of the last run.
  async evalCheck(expr) {
    const code = `invisible(capture.output(.rlab_ok <- isTRUE(tryCatch(local({ ${expr} }, envir = .rlab_env), error = function(e) FALSE))))`;
    await this.webR.evalRVoid(code);
    return this.webR.evalRBoolean(".rlab_ok");
  },
  async evalNums(expr) {
    const s = await this.webR.evalRString(`tryCatch({ invisible(capture.output(.v <- local({ ${expr} }, envir = .rlab_env))); paste(format(as.numeric(.v), digits = 15), collapse = "|") }, error = function(e) "__ERR__")`);
    if (s === "__ERR__" || s === "") return null;
    return s.split("|").map(Number);
  },
  async evalText(expr) {
    const s = await this.webR.evalRString(`tryCatch({ invisible(capture.output(.v <- local({ ${expr} }, envir = .rlab_env))); paste(as.character(.v), collapse = "\u0001") }, error = function(e) "__ERR__")`);
    if (s === "__ERR__") return null;
    return s.split("\u0001");
  },
  async listFiles() {
    if (this.state !== "ready") return [];
    const s = await this.webR.evalRString(`paste(list.files("/home/web_user"), collapse = "|")`);
    return s ? s.split("|").filter((f) => f !== "your_code.R") : [];
  },
  async readFile(name) { return this.webR.FS.readFile("/home/web_user/" + name); },
  async writeFile(name, bytes) { await this.webR.FS.writeFile("/home/web_user/" + name, bytes); },
};

function withTimeout(p, ms, msg) {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(msg)), ms); })]).finally(() => clearTimeout(t));
}

// ---------- engine status UI ----------
const engineEl = $("#engine"), engineText = $("#engineText"), banner = $("#engineBanner");
Engine.on((state, msg) => {
  engineEl.dataset.state = state;
  engineText.textContent = msg;
  renderBanner();
  document.querySelectorAll("[data-needs-r]").forEach((b) => { b.disabled = state !== "ready"; });
  document.querySelectorAll("[data-stop]").forEach((b) => { b.hidden = state !== "busy"; });
});
$("#restartBtn").addEventListener("click", () => Engine.restart());

function renderBanner() {
  if (Engine.state === "loading") {
    banner.innerHTML = `<div class="banner"><p><b>Starting R in your browser.</b> The first load downloads R (about 25 MB) and can take up to a minute. You can read lessons and write code while you wait.</p></div>`;
  } else if (Engine.state === "failed") {
    banner.innerHTML = `<div class="banner warn">
      <h3>R can't run on this page</h3>
      <p>This page runs R with WebR, which has to download R files from the internet. That download was blocked here (by this viewer or the network), so code cannot run on this page. Lessons, the editor, hints, solutions and saving still work. Checking is off, because answers are only marked using real R output.</p>
      <details><summary class="note">Technical detail</summary><p class="note">${esc(Engine.error || "")}</p></details>
      <details><summary><b>Run your code in RStudio instead</b></summary>
        <ol>
          <li>Press <b>Copy for RStudio</b> under the editor.</li>
          <li>In RStudio, choose File → New File → R Script and paste.</li>
          <li>Press <b>Source</b> (Ctrl+Shift+S). When R asks for input in the Console, type each value from the Input box and press Enter.</li>
          <li>Compare your output with the expected results listed under the question.</li>
        </ol>
      </details>
      <details><summary><b>Run this whole site on your computer</b></summary>
        <ol>
          <li>Get the <code>r-lab-practice</code> folder from the project repository. It has <code>standalone.html</code>, a single-file copy of this site.</li>
          <li>In that folder, run <code>python -m http.server 8000</code>.</li>
          <li>Open <code>http://localhost:8000/standalone.html</code> in Chrome, Edge or Firefox with internet on. R loads from webr.r-wasm.org.</li>
        </ol>
      </details>
      <div class="row" style="margin-top:8px"><button class="btn" type="button" id="retryR">Try starting R again</button></div>
    </div>`;
    $("#retryR").addEventListener("click", () => Engine.restart());
  } else banner.innerHTML = "";
}

// ---------- output rendering ----------
function renderOutput(res, consoleEl, plotsEl, note) {
  consoleEl.innerHTML = "";
  if (plotsEl) plotsEl.innerHTML = "";
  if (res.timedOut || res.stopped) {
    consoleEl.innerHTML = `<span class="sys">${res.stopped ? "Stopped. R was restarted, so variables from earlier runs are gone." : "Stopped after " + (note || 30) + " seconds. A loop may never end: check that its condition becomes FALSE. R was restarted."}</span>`;
    return;
  }
  const frag = document.createDocumentFragment();
  res.out.forEach((o) => {
    const span = document.createElement("span");
    if (o.type === "stderr") span.className = "err";
    span.textContent = o.text + "\n";
    frag.appendChild(span);
  });
  if (!res.out.length) { const s = document.createElement("span"); s.className = "sys"; s.textContent = res.images.length ? "(no text output — see the plot below)" : "(no output — did you forget print() or cat()?)"; frag.appendChild(s); }
  consoleEl.appendChild(frag);
  if (plotsEl) res.images.forEach((c) => plotsEl.appendChild(c));
}

function sysMsg(consoleEl, text) { consoleEl.innerHTML = `<span class="sys">${esc(text)}</span>`; }

function splitInputs(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  return lines.map((l) => l.trim());
}

async function runInteractive(code, stdin, consoleEl, plotsEl) {
  if (/___/.test(code)) { sysMsg(consoleEl, "Fill in every blank (___) before running."); return null; }
  if (Engine.state === "loading") { sysMsg(consoleEl, "R is still starting. Try again in a moment."); return null; }
  if (Engine.state !== "ready") { sysMsg(consoleEl, "R is not running on this page. Use Copy for RStudio, or the standalone version described above."); return null; }
  sysMsg(consoleEl, "Running…");
  try {
    const res = await Engine.run(code, splitInputs(stdin), { test: false, timeout: 30000 });
    renderOutput(res, consoleEl, plotsEl, 30);
    return res;
  } catch (e) { sysMsg(consoleEl, "Could not run: " + (e.message || e)); return null; }
}

// ---------- checking against tests ----------
const NUM_RE = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
function numbersIn(text) { return (text.match(NUM_RE) || []).map(Number).filter((n) => !Number.isNaN(n)); }
function close(a, e) { const tol = Math.abs(e) < 1 ? 0.0006 : Math.max(0.0051, 6e-4 * Math.abs(e)); return Math.abs(a - e) <= tol; }
function fmt(n) { return Number.isInteger(n) ? String(n) : String(+n.toPrecision(6)); }
function stripComments(code) { return code.split("\n").map((l) => l.replace(/#.*$/, "")).join("\n"); }
function tokRe(t) { return new RegExp("(^|[^A-Za-z0-9+])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-z0-9+])"); }

function useName(p) { return p.replace(/\\b|\\s\*|\\\(/g, "").replace(/\\\./g, "."); }
function describeTest(t) {
  const parts = [];
  if (t.in) parts.push("Input: " + (t.in.length ? t.in.join(", ") : "none"));
  if (t.nums) parts.push("Shows " + t.nums.map(fmt).join(", "));
  if (t.notNums) parts.push("Does not show " + t.notNums.join(", "));
  if (t.last !== undefined) parts.push("Last number printed is " + t.last);
  if (t.text) parts.push("Mentions " + t.text.map((x) => `"${x}"`).join(", "));
  if (t.notText) parts.push("Does not mention " + t.notText.map((x) => `"${x}"`).join(", "));
  if (t.tok) parts.push("Prints the grade " + t.tok.join(", "));
  if (t.plot) parts.push("Draws a plot");
  return parts.join(" · ");
}

async function runTests(ex, code) {
  const results = [];
  const clean = stripComments(code);
  for (const t of ex.tests) {
    const items = [];
    let res;
    // Function-only tests still need input if the program also calls readline().
    const inputs = t.in || (ex.tests.find((x) => x.in) || {}).in || [];
    try { res = await Engine.run(code, inputs, { test: true, timeout: 12000 }); }
    catch (e) { results.push({ t, pass: false, items: [{ ok: false, msg: "Could not run: " + (e.message || e) }] }); continue; }
    if (res.stopped) { results.push({ t, pass: false, items: [{ ok: false, msg: "Checking was stopped." }] }); continue; }
    if (res.timedOut) { results.push({ t, pass: false, items: [{ ok: false, msg: "Took longer than 12 seconds. A loop may never end, or the code waits for more input than the test gives." }] }); continue; }
    const errLine = res.out.filter((o) => o.type === "stderr" && /^Error/.test(o.text)).map((o) => o.text).join(" ");
    const text = res.out.filter((o) => !(o.type === "stderr" && /^Error/.test(o.text))).map((o) => o.text).join("\n");
    if (res.error) items.push({ ok: false, msg: "Your code stopped with an error: " + (errLine || "see the console").replace(/^Error\s*:?\s*/, "") });
    const nums = numbersIn(text);
    const lower = text.toLowerCase();
    const want = (arr) => { const miss = arr.filter((e) => !nums.some((a) => close(a, e))); return miss; };
    if (t.nums) { const m = want(t.nums); items.push(m.length ? { ok: false, msg: "Missing number(s): " + m.map(fmt).join(", ") } : { ok: true, msg: "All expected numbers appear" }); }
    if (t.notNums) { const f = t.notNums.filter((e) => nums.some((a) => close(a, e))); items.push(f.length ? { ok: false, msg: "Should not show: " + f.join(", ") } : { ok: true, msg: "Skipped values are not shown" }); }
    if (t.last !== undefined) { const l = nums[nums.length - 1]; items.push(l !== undefined && close(l, t.last) ? { ok: true, msg: "Final answer is " + t.last } : { ok: false, msg: `Final number should be ${t.last}` + (l !== undefined ? `, but it is ${fmt(l)}` : ", but no number was printed") }); }
    if (t.text) { const m = t.text.filter((w) => !lower.includes(w.toLowerCase())); items.push(m.length ? { ok: false, msg: "Missing word(s): " + m.join(", ") } : { ok: true, msg: "Expected words appear" }); }
    if (t.notText) { const f = t.notText.filter((w) => lower.includes(w.toLowerCase())); items.push(f.length ? { ok: false, msg: "Should not say: " + f.join(", ") } : { ok: true, msg: "No wrong words" }); }
    if (t.tok) { const m = t.tok.filter((w) => !tokRe(w).test(text)); items.push(m.length ? { ok: false, msg: "Expected grade " + m.join(", ") + " on its own" } : { ok: true, msg: "Correct grade " + t.tok.join(", ") }); }
    if (t.notTok) { const f = t.notTok.filter((w) => tokRe(w).test(text)); if (f.length) items.push({ ok: false, msg: "Wrong grade shown: " + f.join(", ") }); }
    if (t.plot) items.push(res.images.length ? { ok: true, msg: "A plot was drawn" } : { ok: false, msg: "No plot was drawn" });
    if (t.use) t.use.forEach((p) => { const ok = new RegExp(p).test(clean); items.push({ ok, msg: (ok ? "Uses " : "Should use ") + useName(p) }); });
    if (!res.error) {
      if (t.check) { const ok = await Engine.evalCheck(t.check); items.push({ ok, msg: ok ? "Variables and functions behave correctly" : "A variable or function does not match the task (see the description above)" }); }
      if (t.numsR) { const exp = await Engine.evalNums(t.numsR); if (!exp) items.push({ ok: false, msg: "Could not find the variables named in the task" }); else { const m = want(exp); items.push(m.length ? { ok: false, msg: "Your output is missing: " + m.map(fmt).join(", ") } : { ok: true, msg: "Printed values match R's own calculation" }); } }
      if (t.textR) { const exp = await Engine.evalText(t.textR); if (!exp) items.push({ ok: false, msg: "Could not find the variables named in the task" }); else { const m = exp.filter((w) => !lower.includes(String(w).toLowerCase())); items.push(m.length ? { ok: false, msg: "Your output is missing: " + m.join(", ") } : { ok: true, msg: "Expected values are printed" }); } }
    }
    const pass = items.length > 0 && items.every((i) => i.ok);
    results.push({ t, pass, items, sample: text.slice(0, 600) });
  }
  return results;
}

function renderResults(results, el) {
  const passed = results.filter((r) => r.pass).length;
  el.innerHTML = `<ul class="tests">${results.map((r, i) => `
    <li class="${r.pass ? "pass" : "fail"}"><b>${r.pass ? "✓" : "✗"} Test ${i + 1}</b> — ${esc(r.t.d || describeTest(r.t))}
      ${r.t.in ? `<div class="note">Input lines: ${esc(r.t.in.join(" ⏎ "))}</div>` : ""}
      ${r.pass ? "" : `<ul class="why">${r.items.filter((x) => !x.ok).map((x) => `<li>${esc(x.msg)}</li>`).join("")}</ul>`}
    </li>`).join("")}</ul>
    <p class="verdict ${passed === results.length ? "pass" : "fail"}">${passed === results.length ? "All tests passed. Well done." : `${passed} of ${results.length} tests passed.`}</p>`;
  return passed === results.length;
}

// ---------- editor widget (used by Practice and Mock) ----------
function editorHTML(prefix, { checks = true, hints = true } = {}) {
  return `
  <div class="edhead"><span class="file">your_code.R</span>
    <span class="row"><button class="btn ghost" type="button" id="${prefix}Copy">Copy for RStudio</button><button class="btn ghost" type="button" id="${prefix}Dl">Download .R</button></span></div>
  <textarea class="code" id="${prefix}Code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="R code editor"></textarea>
  <label class="lbl" for="${prefix}Stdin">Input for readline() — one value per line</label>
  <textarea class="stdin" id="${prefix}Stdin" spellcheck="false" placeholder="e.g.&#10;12&#10;5"></textarea>
  <div class="toolbar">
    <button class="btn primary" type="button" id="${prefix}Run" data-needs-r>Run <kbd>Ctrl+Enter</kbd></button>
    <button class="btn danger" type="button" id="${prefix}Stop" data-stop hidden>Stop</button>
    ${checks ? `<button class="btn" type="button" id="${prefix}Check" data-needs-r>Check my answer</button>` : ""}
    <button class="btn" type="button" id="${prefix}Reset">Reset</button>
  </div>
  <span class="lbl">Console</span>
  <pre class="console" id="${prefix}Console" aria-live="polite"><span class="sys">Output appears here after you press Run.</span></pre>
  <div class="plots" id="${prefix}Plots"></div>
  <details class="files" id="${prefix}Files"><summary>Files in R's folder (CSV files you write appear here)</summary>
    <ul class="filelist" id="${prefix}FileList"></ul>
    <label class="btn" style="cursor:pointer">Upload a CSV<input type="file" accept=".csv,text/csv,.txt" id="${prefix}Upload" hidden></label>
  </details>`;
}

function wireEditor(prefix, { getCode, setCode, onChange, onRun }) {
  const code = $("#" + prefix + "Code"), stdin = $("#" + prefix + "Stdin");
  const consoleEl = $("#" + prefix + "Console"), plotsEl = $("#" + prefix + "Plots");
  code.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); const s = code.selectionStart, en = code.selectionEnd; code.setRangeText("  ", s, en, "end"); onChange && onChange(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); $("#" + prefix + "Run").click(); }
  });
  code.addEventListener("input", () => onChange && onChange());
  stdin.addEventListener("input", () => onChange && onChange());
  $("#" + prefix + "Run").addEventListener("click", async () => {
    const res = await runInteractive(code.value, stdin.value, consoleEl, plotsEl);
    refreshFiles(prefix);
    onRun && onRun(res);
  });
  $("#" + prefix + "Stop").addEventListener("click", () => Engine.stop());
  $("#" + prefix + "Copy").addEventListener("click", () => copyText(rstudioText(code.value, stdin.value), $("#" + prefix + "Copy")));
  $("#" + prefix + "Dl").addEventListener("click", () => downloadBlob(new Blob([code.value], { type: "text/plain" }), "your_code.R"));
  $("#" + prefix + "Files").addEventListener("toggle", () => refreshFiles(prefix));
  $("#" + prefix + "Upload").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (Engine.state !== "ready") { sysMsg(consoleEl, "R is not running, so the file can't be added."); return; }
    const name = f.name.replace(/[^\w.-]/g, "_");
    await Engine.writeFile(name, new Uint8Array(await f.arrayBuffer()));
    sysMsg(consoleEl, `Uploaded ${name}. Read it with read.csv("${name}").`);
    refreshFiles(prefix); e.target.value = "";
  });
  return { code, stdin, consoleEl, plotsEl };
}

async function refreshFiles(prefix) {
  const list = $("#" + prefix + "FileList"); if (!list) return;
  if (Engine.state !== "ready") { list.innerHTML = `<li class="note">R is not running.</li>`; return; }
  const files = await Engine.listFiles();
  list.innerHTML = files.length ? files.map((f) => `<li><span>${esc(f)}</span><button class="btn ghost" type="button" data-view-file="${esc(f)}">View</button><button class="btn ghost" type="button" data-dl-file="${esc(f)}">Download</button></li>`).join("") : `<li class="note">No files yet.</li>`;
  list.querySelectorAll("[data-view-file]").forEach((b) => b.addEventListener("click", async () => {
    const bytes = await Engine.readFile(b.dataset.viewFile);
    const txt = new TextDecoder().decode(bytes);
    const c = $("#" + prefix + "Console");
    c.innerHTML = `<span class="sys">Contents of ${esc(b.dataset.viewFile)}:</span>\n${esc(txt.split("\n").slice(0, 40).join("\n"))}`;
  }));
  list.querySelectorAll("[data-dl-file]").forEach((b) => b.addEventListener("click", async () => {
    const bytes = await Engine.readFile(b.dataset.dlFile);
    downloadBlob(new Blob([bytes], { type: "text/csv" }), b.dataset.dlFile);
  }));
}

function rstudioText(code, stdin) {
  const lines = splitInputs(stdin);
  const head = lines.length && /readline\s*\(/.test(code) ? `# When R asks for input in the Console, type these values one at a time:\n# ${lines.join(" , ")}\n\n` : "";
  return head + code;
}
function copyText(text, btn) {
  const done = () => { const o = btn.textContent; btn.textContent = "Copied"; setTimeout(() => (btn.textContent = o), 1400); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ } ta.remove();
}
function downloadBlob(blob, name) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------- PRACTICE ----------
let current = null;
function railHTML() {
  const st = (id) => store.status[id] === "passed" ? `<span class="st passed" title="Passed">✓</span>` : store.status[id] === "tried" ? `<span class="st tried" title="Tried">•</span>` : "";
  const item = (e) => `<button type="button" data-ex="${e.id}"><span class="num">${shortLabel(e)}</span><span>${esc(e.title)}</span>${st(e.id)}</button>`;
  const fill = ORDER.filter((e) => e.group === "set" && e.mode === "fill");
  const blank = ORDER.filter((e) => e.group === "set" && e.mode === "blank");
  const vars = ORDER.filter((e) => e.group === "var");
  return `<h4>My practice sets</h4>
    <div class="setname">Part A · Fill in the blanks (Sets 1–5)</div>${fill.map(item).join("")}
    <div class="setname">Part B · Blank editor (Sets 6–10)</div>${blank.map(item).join("")}
    <h4>Practice variations</h4><div class="setname">Original exercises, blank editor</div>${vars.map(item).join("")}`;
}
function renderRail() {
  const rail = $("#exRail"); rail.innerHTML = railHTML();
  rail.querySelectorAll("[data-ex]").forEach((b) => { b.addEventListener("click", () => openExercise(b.dataset.ex)); if (current && b.dataset.ex === current.id) b.setAttribute("aria-current", "true"); });
  const sel = $("#exSelect");
  sel.innerHTML = `<optgroup label="My practice sets">${ORDER.filter((e) => e.group === "set").map((e) => `<option value="${e.id}">${label(e)} — ${esc(e.title)}${store.status[e.id] === "passed" ? " ✓" : ""}</option>`).join("")}</optgroup>
    <optgroup label="Practice variations">${ORDER.filter((e) => e.group === "var").map((e) => `<option value="${e.id}">${label(e)} — ${esc(e.title)}${store.status[e.id] === "passed" ? " ✓" : ""}</option>`).join("")}</optgroup>`;
  if (current) sel.value = current.id;
}
$("#exSelect").addEventListener("change", (e) => openExercise(e.target.value));
$("#prevEx").addEventListener("click", () => step(-1));
$("#nextEx").addEventListener("click", () => step(1));
function step(d) { const i = ORDER.indexOf(current); const n = ORDER[(i + d + ORDER.length) % ORDER.length]; openExercise(n.id); }

function openExercise(id) {
  const ex = byId[id] || ORDER[0];
  current = ex; store.last = ex.id; save();
  if (location.hash !== "#practice") { history.replaceState(null, "", "#practice"); showView("practice"); }
  const hintsShown = store.hints[ex.id] || 0;
  const qp = $("#qPane");
  qp.innerHTML = `
    <div class="qmeta">
      <span class="chip ${ex.group === "set" ? "set" : "var"}">${ex.group === "set" ? "My practice sets · " + label(ex) : "Practice variation " + ex.vn}</span>
      <span class="chip">${PATTERNS[ex.pattern].name}</span>
      <span class="chip">${ex.mode === "fill" ? "Fill in the blanks" : "Blank editor"}</span>
    </div>
    ${ex.group === "var" ? `<p class="varnote">An original practice exercise for building skill. It is not a past paper question or an exam prediction.</p>` : ""}
    <h1 class="qtitle">${esc(ex.title)}</h1>
    <p class="question">${esc(ex.question)}</p>
    <span class="lbl">What the checker expects</span>
    <p class="task">${ex.task}</p>
    ${ex.mode === "fill" ? `<p class="note">Replace each <code>___</code> in the editor, then press Run.</p>` : ""}
    <span class="lbl">Tests your code must pass</span>
    <ul class="tests" id="testList">${ex.tests.map((t, i) => `<li><b>Test ${i + 1}</b> — ${esc(t.d || describeTest(t))}${t.in ? `<div class="note">Input lines: ${esc(t.in.join(" ⏎ "))}</div>` : ""}</li>`).join("")}</ul>
    <div id="resultBox"></div>
    <div class="row" style="margin-top:14px">
      <button class="btn" type="button" id="hintBtn">${hintsShown >= 2 ? "No more hints" : `Hint (${hintsShown + 1} of 2)`}</button>
      <button class="btn" type="button" id="solBtn">Reveal solution</button>
      <a class="btn ghost" href="#learn" data-learn="${ex.pattern}">Lesson: ${PATTERNS[ex.pattern].short}</a>
    </div>
    <div id="hintBox"></div>
    <div id="solBox"></div>`;
  $("#ePane").innerHTML = editorHTML("p");
  const ed = wireEditor("p", {
    onChange: () => { store.drafts[ex.id] = ed.code.value; store.inputs[ex.id] = ed.stdin.value; save(); },
    onRun: (res) => { if (res && !store.status[ex.id]) { store.status[ex.id] = "tried"; save(); renderRail(); } },
  });
  ed.code.value = store.drafts[ex.id] ?? starterOf(ex);
  ed.stdin.value = store.inputs[ex.id] ?? defaultInput(ex);
  $("#pReset").addEventListener("click", () => {
    const box = $("#resultBox");
    box.innerHTML = `<div class="hint"><b>Reset the editor?</b> Your current code for this exercise will be replaced with the starting code. <div class="row" style="margin-top:6px"><button class="btn" type="button" id="resetYes">Yes, reset</button><button class="btn ghost" type="button" id="resetNo">Cancel</button></div></div>`;
    $("#resetYes").addEventListener("click", () => { ed.code.value = starterOf(ex); ed.stdin.value = defaultInput(ex); delete store.drafts[ex.id]; delete store.inputs[ex.id]; save(); box.innerHTML = ""; sysMsg(ed.consoleEl, "Editor reset."); ed.plotsEl.innerHTML = ""; });
    $("#resetNo").addEventListener("click", () => (box.innerHTML = ""));
  });
  $("#pCheck").addEventListener("click", async () => {
    const box = $("#resultBox");
    if (/___/.test(ed.code.value)) { box.innerHTML = `<p class="verdict fail">Fill in every blank (___) first.</p>`; return; }
    if (Engine.state !== "ready") { box.innerHTML = `<p class="verdict fail">Checking needs R running. Nothing was marked.</p>`; return; }
    box.innerHTML = `<p class="note">Running ${ex.tests.length} test${ex.tests.length > 1 ? "s" : ""} with real R…</p>`;
    const results = await runTests(ex, ed.code.value);
    const ok = renderResults(results, box);
    if (ok) store.status[ex.id] = "passed"; else if (store.status[ex.id] !== "passed") store.status[ex.id] = "tried";
    save(); renderRail();
    if (ok) box.insertAdjacentHTML("beforeend", `<button class="btn primary" type="button" id="goNext">Next exercise →</button>`), $("#goNext").addEventListener("click", () => step(1));
  });
  const showHints = () => {
    const n = store.hints[ex.id] || 0;
    $("#hintBox").innerHTML = ex.hints.slice(0, n).map((h, i) => `<div class="hint"><b>Hint ${i + 1}.</b> ${esc(h)}</div>`).join("");
    $("#hintBtn").textContent = n >= 2 ? "No more hints" : `Hint (${n + 1} of 2)`;
    $("#hintBtn").disabled = n >= 2;
  };
  $("#hintBtn").addEventListener("click", () => { store.hints[ex.id] = Math.min(2, (store.hints[ex.id] || 0) + 1); save(); showHints(); });
  showHints();
  const showSol = () => {
    $("#solBox").innerHTML = `<span class="lbl">Reference solution</span><pre class="codeblock">${esc(ex.solution)}</pre>
      <div class="row"><button class="btn" type="button" id="solLoad">Put it in the editor</button><span class="note">Read it, close it, and try typing it yourself from memory.</span></div>`;
    $("#solLoad").addEventListener("click", () => { ed.code.value = ex.solution; store.drafts[ex.id] = ex.solution; save(); });
    $("#solBtn").textContent = "Hide solution";
  };
  $("#solBtn").addEventListener("click", () => {
    if (store.sol[ex.id]) { store.sol[ex.id] = false; save(); $("#solBox").innerHTML = ""; $("#solBtn").textContent = "Reveal solution"; return; }
    $("#solBox").innerHTML = `<div class="hint"><b>Show the full solution?</b> Using the hints first helps you remember more. <div class="row" style="margin-top:6px"><button class="btn" type="button" id="solYes">Yes, show it</button><button class="btn ghost" type="button" id="solNo">Not yet</button></div></div>`;
    $("#solYes").addEventListener("click", () => { store.sol[ex.id] = true; save(); showSol(); });
    $("#solNo").addEventListener("click", () => ($("#solBox").innerHTML = ""));
  });
  if (store.sol[ex.id]) showSol();
  qp.querySelector("[data-learn]").addEventListener("click", (e) => { e.preventDefault(); goLearn(ex.pattern); });
  Engine.listeners.forEach((f) => f(Engine.state, Engine.msg));
  renderRail();
}

// ---------- LEARN ----------
function lessonRunner(id, code, input) {
  return `<pre class="codeblock">${esc(code)}</pre>
    <div class="row">
      <button class="btn" type="button" data-run-lesson="${id}" data-needs-r>Run</button>
      <button class="btn ghost" type="button" data-try="${id}">Open in Scratch</button>
      ${input ? `<span class="note">Input used: ${esc(input.split("\n").join(", "))}</span>` : ""}
    </div>
    <div class="miniout" id="out-${id}" hidden><pre class="console"></pre><div class="plots"></div></div>`;
}
const LESSON_CODE = {};
function renderLearn() {
  const v = $("#view-learn");
  const sections = LEARN.map((L) => {
    const P = PATTERNS[L.key];
    LESSON_CODE["t-" + L.key] = { code: L.template, input: L.input };
    LESSON_CODE["w-" + L.key] = { code: L.worked.code, input: L.worked.input };
    const related = EXERCISES.filter((e) => e.pattern === L.key);
    return `<section class="lesson" id="lesson-${L.key}">
      <h2>${P.name}</h2>
      <p class="idea">${esc(L.idea)}</p>
      <div class="lgrid">
        <div><span class="lbl">Algorithm in three steps</span><ol class="steps">${L.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          <div class="mistake"><b>Common mistake.</b> ${esc(L.mistake)}</div></div>
        <div><span class="lbl">Code template</span>${lessonRunner("t-" + L.key, L.template, L.input)}
          <span class="lbl">Expected output</span><pre class="codeblock">${esc(L.expected)}</pre></div>
      </div>
      <div class="worked">
        <span class="lbl">Worked example</span>
        <p><b>${esc(L.worked.q)}</b></p>
        ${lessonRunner("w-" + L.key, L.worked.code, L.worked.input)}
        <p>${esc(L.worked.explain)}</p>
      </div>
      <div class="yourturn"><span><b>Your turn:</b> ${esc(L.similar.text)}</span>
        <button class="btn primary" type="button" data-open-ex="${L.similar.ex}">Solve it in Practice →</button></div>
      <span class="lbl">All questions with this pattern</span>
      <div class="related">${related.map((e) => `<button type="button" data-open-ex="${e.id}">${label(e)}: ${esc(e.title)}</button>`).join("")}</div>
    </section>`;
  }).join("");

  EXTENSION.forEach((x, i) => (LESSON_CODE["x-" + i] = { code: x.code, input: "" }));
  LESSON_CODE["x-prob"] = { code: PROB_CODE, input: "" };
  const ext = `<section class="lesson" id="lesson-extension">
    <h2>Lab record extension</h2>
    <p class="idea">Four extra topics from the lab record: matrix multiplication, histograms and box plots, correlation and covariance, and probability distributions.</p>
    ${EXTENSION.map((x, i) => `<div class="worked"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>${lessonRunner("x-" + i, x.code, "")}
      <div class="row" style="margin-top:6px"><button class="btn" type="button" data-open-ex="${x.practice}">Practise: ${esc(byId[x.practice].title)} →</button></div></div>`).join("")}
    <div class="worked" id="lesson-probability">
      <h3>Binomial, Poisson and normal probabilities</h3>
      <p>Each distribution has a <b>d</b> function (probability of one exact value) and a <b>p</b> function (probability of that value <em>or less</em>). The words in the question tell you which one to use.</p>
      <div class="rules">
        <div><b>Exactly k</b>P(X = k) → <code>dbinom(k, n, p)</code> or <code>dpois(k, λ)</code>. Example: exactly 3 heads in 10 tosses = 0.1172.</div>
        <div><b>At most k</b>P(X ≤ k) → <code>pbinom(k, n, p)</code> or <code>ppois(k, λ)</code>. "At most 3" includes 0, 1, 2 and 3. Example: 0.1719.</div>
        <div><b>At least k</b>P(X ≥ k) = 1 − P(X ≤ k − 1) → <code>1 - pbinom(k - 1, n, p)</code>. Example: at least 3 heads = 1 − pbinom(2, 10, 0.5) = 0.9453.</div>
      </div>
      <p><b>Normal is continuous.</b> "Exactly 75 marks" has probability 0, so only ranges make sense. At most x → <code>pnorm(x, mean, sd)</code>. At least x → <code>1 - pnorm(x, mean, sd)</code>, with no −1 step. Between a and b → <code>pnorm(b) - pnorm(a)</code>.</p>
      <p class="note">Watch the words: "more than 3" means at least 4, so use 1 − pbinom(3, …). "Fewer than 3" means at most 2, so use pbinom(2, …).</p>
      <div class="tablewrap"><table class="prob"><thead><tr><th>Distribution</th><th>Question</th><th>R code</th><th>Value</th></tr></thead>
        <tbody>${PROB_ROWS.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td><code>${esc(r[2])}</code></td><td class="v">${r[3]}</td></tr>`).join("")}</tbody></table></div>
      <span class="lbl">Try it</span>${lessonRunner("x-prob", PROB_CODE, "")}
      <div class="row" style="margin-top:6px"><button class="btn" type="button" data-open-ex="v11">Practise: ${esc(byId.v11.title)} →</button></div>
    </div>
    <p class="note" style="margin-top:14px">For the full experiment list, see the <a href="https://pccbl308-r-ktu.blogspot.com/2026/06/list-of-experiments-for-lab-record.html" target="_blank" rel="noopener">lab record list of experiments</a>.</p>
  </section>`;

  const scratch = `<section class="lesson" id="lesson-scratch"><h2>Scratch editor</h2>
    <p class="idea">Try any code from a lesson here. Your scratch code is saved in this browser.</p>${editorHTML("s", { checks: false })}</section>`;

  v.innerHTML = `<div class="learn">
    <nav class="toc" aria-label="Lessons">${LEARN.map((L) => `<a href="#learn" data-goto="lesson-${L.key}">${PATTERNS[L.key].name}</a>`).join("")}
      <a href="#learn" data-goto="lesson-extension">Lab record extension</a><a href="#learn" data-goto="lesson-probability">Exactly · at most · at least</a><a href="#learn" data-goto="lesson-scratch">Scratch editor</a></nav>
    <div style="min-width:0">${sections}${ext}${scratch}</div></div>`;

  v.querySelectorAll("[data-goto]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(a.dataset.goto).scrollIntoView({ behavior: "smooth" }); }));
  v.querySelectorAll("[data-open-ex]").forEach((b) => b.addEventListener("click", () => { location.hash = "#practice"; openExercise(b.dataset.openEx); window.scrollTo(0, 0); }));
  v.querySelectorAll("[data-run-lesson]").forEach((b) => b.addEventListener("click", async () => {
    const id = b.dataset.runLesson, L = LESSON_CODE[id], box = $("#out-" + id);
    box.hidden = false;
    await runInteractive(L.code, L.input || "", box.querySelector(".console"), box.querySelector(".plots"));
  }));
  const sEd = wireEditor("s", { onChange: () => { store.drafts.__scratch = sEd.code.value; store.inputs.__scratch = sEd.stdin.value; save(); } });
  sEd.code.value = store.drafts.__scratch ?? "# Scratch editor: write any R code and press Run\nx <- c(4, 8, 15, 16, 23, 42)\nsummary(x)\n";
  sEd.stdin.value = store.inputs.__scratch ?? "";
  $("#sReset").addEventListener("click", () => { sEd.code.value = ""; store.drafts.__scratch = ""; save(); });
  v.querySelectorAll("[data-try]").forEach((b) => b.addEventListener("click", () => {
    const L = LESSON_CODE[b.dataset.try];
    sEd.code.value = L.code; sEd.stdin.value = L.input || ""; store.drafts.__scratch = L.code; store.inputs.__scratch = L.input || ""; save();
    $("#lesson-scratch").scrollIntoView({ behavior: "smooth" });
  }));
}
function goLearn(key) {
  location.hash = "#learn";
  setTimeout(() => { const el = document.getElementById("lesson-" + key); if (el) el.scrollIntoView(); }, 30);
}

// ---------- MOCK LAB ----------
let mockTick = null;
function pickMock() {
  const groups = [["input", "loops"], ["functions", "vectors"], ["dataframes", "plots"]];
  return groups.map((g) => { const pool = EXERCISES.filter((e) => g.includes(e.pattern)); return pool[Math.floor(Math.random() * pool.length)].id; });
}
function renderMock() {
  clearInterval(mockTick);
  const v = $("#view-mock"), m = store.mock;
  if (!m) {
    v.innerHTML = `<div class="card"><h2>Mock Lab</h2>
      <p>You get three mixed questions: one on input, conditions or loops; one on functions, vectors or matrices; and one on data frames, CSVs or plots. You can run your code, but there are no hints. When you submit, each answer is checked with real R and you see what to retry.</p>
      <div class="row"><label for="mockTime"><b>Timer</b></label>
        <select id="mockTime" class="btn"><option value="0">No timer</option><option value="30">30 minutes</option><option value="45" selected>45 minutes</option><option value="60">60 minutes</option></select>
        <button class="btn primary" type="button" id="mockStart">Start mock lab</button></div>
      <p class="note">Questions come from your practice sets and the practice variations. This is practice only and does not predict exam questions.</p></div>
      ${historyHTML()}`;
    $("#mockStart").addEventListener("click", () => {
      const mins = +$("#mockTime").value;
      store.mock = { qs: pickMock(), drafts: {}, inputs: {}, startedAt: Date.now(), endAt: mins ? Date.now() + mins * 60000 : null, mins, active: 0, submitted: false, results: null };
      save(); renderMock();
    });
    return;
  }
  if (m.submitted) { renderMockResults(); return; }
  const q = byId[m.qs[m.active]];
  v.innerHTML = `<div class="mockbar">
      <div class="qtabs">${m.qs.map((id, i) => `<button type="button" data-q="${i}" aria-current="${i === m.active}">Question ${i + 1}</button>`).join("")}</div>
      <span class="timer" id="mockTimer">${m.endAt ? "" : "No timer"}</span>
      <span class="row" style="margin-left:auto"><button class="btn" type="button" id="mockQuit">Quit</button><button class="btn primary" type="button" id="mockSubmit">Submit all answers</button></span>
    </div>
    <div id="mockConfirm"></div>
    <div class="bench">
      <article class="pane">
        <div class="qmeta"><span class="chip">Question ${m.active + 1} of 3</span><span class="chip">${PATTERNS[q.pattern].name}</span></div>
        <h1 class="qtitle">${esc(q.title)}</h1>
        <p class="question">${esc(q.question)}</p>
        <span class="lbl">What the checker expects</span><p class="task">${q.task}</p>
        <p class="note">No hints in the mock lab. Test your program with your own inputs before you submit.</p>
      </article>
      <div class="pane">${editorHTML("m", { checks: false })}</div>
    </div>`;
  v.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { m.active = +b.dataset.q; save(); renderMock(); }));
  const ed = wireEditor("m", { onChange: () => { m.drafts[q.id] = ed.code.value; m.inputs[q.id] = ed.stdin.value; save(); } });
  ed.code.value = m.drafts[q.id] ?? `# Mock lab — Question ${m.active + 1}: ${q.title}\n\n`;
  ed.stdin.value = m.inputs[q.id] ?? "";
  $("#mReset").addEventListener("click", () => { ed.code.value = `# Mock lab — Question ${m.active + 1}: ${q.title}\n\n`; m.drafts[q.id] = ed.code.value; save(); });
  $("#mockSubmit").addEventListener("click", () => {
    $("#mockConfirm").innerHTML = `<div class="banner warn"><b>Submit all three answers?</b> You can't edit them after this. <span class="row" style="margin-top:6px"><button class="btn primary" type="button" id="subYes">Submit</button><button class="btn ghost" type="button" id="subNo">Keep working</button></span></div>`;
    $("#subYes").addEventListener("click", submitMock); $("#subNo").addEventListener("click", () => ($("#mockConfirm").innerHTML = ""));
  });
  $("#mockQuit").addEventListener("click", () => {
    $("#mockConfirm").innerHTML = `<div class="banner warn"><b>Quit this mock lab?</b> Your answers for it will be deleted. <span class="row" style="margin-top:6px"><button class="btn danger" type="button" id="quitYes">Quit and delete</button><button class="btn ghost" type="button" id="quitNo">Keep working</button></span></div>`;
    $("#quitYes").addEventListener("click", () => { store.mock = null; save(); renderMock(); }); $("#quitNo").addEventListener("click", () => ($("#mockConfirm").innerHTML = ""));
  });
  Engine.listeners.forEach((f) => f(Engine.state, Engine.msg));
  if (m.endAt) {
    const tick = () => {
      const left = m.endAt - Date.now(), el = $("#mockTimer");
      if (!el) { clearInterval(mockTick); return; }
      if (left <= 0) { clearInterval(mockTick); el.textContent = "Time's up"; submitMock(); return; }
      const s = Math.ceil(left / 1000);
      el.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")} left`;
      el.classList.toggle("low", s < 300);
    };
    tick(); mockTick = setInterval(tick, 1000);
  }
}
async function submitMock() {
  const m = store.mock; if (!m || m.submitted) return;
  clearInterval(mockTick);
  m.submitted = true; m.submittedAt = Date.now(); m.results = null; save();
  $("#view-mock").innerHTML = `<div class="card"><h2>Checking your answers…</h2><p class="note">Running each answer with real R.</p></div>`;
  if (Engine.state === "loading") await new Promise((r) => { const f = () => (Engine.state !== "loading" ? r() : setTimeout(f, 500)); f(); });
  if (Engine.state === "ready") {
    m.results = [];
    for (const id of m.qs) {
      const code = m.drafts[id] || "";
      const rs = await runTests(byId[id], code);
      m.results.push(rs.map((r) => ({ pass: r.pass, fails: r.items.filter((x) => !x.ok).map((x) => x.msg) })));
    }
    const score = m.results.filter((r) => r.every((x) => x.pass)).length;
    store.mockHistory.unshift({ at: m.submittedAt, qs: m.qs, score, checked: true });
  } else {
    store.mockHistory.unshift({ at: m.submittedAt, qs: m.qs, score: null, checked: false });
  }
  store.mockHistory = store.mockHistory.slice(0, 20);
  save(); renderMockResults();
}
function renderMockResults() {
  const m = store.mock, v = $("#view-mock");
  const checked = !!m.results;
  const score = checked ? m.results.filter((r) => r.every((x) => x.pass)).length : null;
  const retry = checked ? m.qs.filter((id, i) => !m.results[i].every((x) => x.pass)) : m.qs;
  v.innerHTML = `<div class="card">
      <h2>Mock lab results</h2>
      ${checked ? `<p class="score">${score} / 3 questions fully correct</p>` : `<p class="verdict fail">Not checked: R was not running, so no marks were given. Copy each answer to RStudio and compare it with the expected results below.</p>`}
      ${retry.length ? `<p><b>What to retry:</b></p><ul>${retry.map((id) => `<li>${esc(byId[id].title)}: practise it again, then review the <a href="#learn" data-learn="${byId[id].pattern}">${PATTERNS[byId[id].pattern].name}</a> lesson.</li>`).join("")}</ul>` : `<p>Nothing to retry. Try another mock lab with new questions.</p>`}
      <div class="row"><button class="btn primary" type="button" id="mockNew">Start a new mock lab</button></div>
    </div>
    ${m.qs.map((id, i) => {
      const q = byId[id], res = checked ? m.results[i] : null;
      return `<div class="card">
        <div class="qmeta"><span class="chip">Question ${i + 1}</span><span class="chip ${q.group === "set" ? "set" : "var"}">${q.group === "set" ? "My practice sets · " + label(q) : "Practice variation " + q.vn}</span></div>
        <h2>${esc(q.title)}</h2><p class="question">${esc(q.question)}</p>
        <span class="lbl">Your code</span><pre class="codeblock">${esc(m.drafts[id] || "(empty)")}</pre>
        <span class="lbl">Expected results</span>
        <ul class="tests">${q.tests.map((t, k) => {
          const r = res ? res[k] : null;
          return `<li class="${r ? (r.pass ? "pass" : "fail") : ""}"><b>${r ? (r.pass ? "✓" : "✗") : "•"} Test ${k + 1}</b> — ${esc(t.d || describeTest(t))}${t.in ? `<div class="note">Input lines: ${esc(t.in.join(" ⏎ "))}</div>` : ""}${r && !r.pass ? `<ul class="why">${r.fails.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}</li>`;
        }).join("")}</ul>
        <details style="margin-top:10px"><summary><b>Reference solution</b></summary><pre class="codeblock">${esc(q.solution)}</pre></details>
        <div class="row" style="margin-top:8px"><button class="btn" type="button" data-open-ex="${id}">Retry this in Practice →</button></div>
      </div>`;
    }).join("")}
    ${historyHTML()}`;
  $("#mockNew").addEventListener("click", () => { store.mock = null; save(); renderMock(); });
  v.querySelectorAll("[data-open-ex]").forEach((b) => b.addEventListener("click", () => { location.hash = "#practice"; openExercise(b.dataset.openEx); window.scrollTo(0, 0); }));
  v.querySelectorAll("[data-learn]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goLearn(a.dataset.learn); }));
}
function historyHTML() {
  if (!store.mockHistory.length) return "";
  return `<div class="card"><h2>Past mock labs</h2><div class="tablewrap"><table class="hist"><thead><tr><th>Date</th><th>Questions</th><th>Result</th></tr></thead><tbody>
    ${store.mockHistory.map((h) => `<tr><td>${new Date(h.at).toLocaleString()}</td><td>${h.qs.map((id) => esc(byId[id] ? byId[id].title : id)).join(" · ")}</td><td>${h.checked ? h.score + " / 3" : "Not checked"}</td></tr>`).join("")}
  </tbody></table></div></div>`;
}

// ---------- router ----------
let learnBuilt = false;
function showView(name) {
  ["learn", "practice", "mock"].forEach((n) => { $("#view-" + n).hidden = n !== name; });
  document.querySelectorAll("nav.tabs a").forEach((a) => a.setAttribute("aria-current", a.dataset.view === name ? "page" : "false"));
  if (name === "learn" && !learnBuilt) { renderLearn(); learnBuilt = true; }
  if (name === "mock") renderMock();
  if (name === "practice" && !current) openExercise(store.last || ORDER[0].id);
  Engine.listeners.forEach((f) => f(Engine.state, Engine.msg));
}
function route() {
  const h = (location.hash || "").replace("#", "");
  showView(["learn", "practice", "mock"].includes(h) ? h : "practice");
}
window.addEventListener("hashchange", route);
route();
Engine.start();
})();
