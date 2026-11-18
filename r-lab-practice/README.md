# R Lab Practice

A practice site for **PCCBL308 Statistical Methods Lab (R Language)**, KTU S3 CSBS, 2024 scheme.
It runs real R in the browser with [WebR](https://docs.r-wasm.org/webr/) 0.5.9. No login and no paid API.

- **Learn**: six patterns (input and conditions, loops, functions and recursion, vectors and matrices,
  data frames and CSVs, plots). Each has an idea, a three-step algorithm, a template, the expected output,
  a common mistake, a worked example and a similar question. There is also a lab-record extension covering matrix
  multiplication, histograms and box plots, correlation and covariance, and binomial, Poisson and normal
  probabilities ("exactly", "at most", "at least").
- **Practice**: all 30 questions from *My practice sets* (Sets 1–5 as fill-in-the-blank, Sets 6–10 as a
  blank editor), followed by 12 original *Practice variations*. You get Run, Stop, Reset, two hints and Reveal
  solution. **Check my answer** runs your code against test inputs and compares the real R output and values.
- **Mock Lab**: three mixed questions, an optional timer, no hints, and checking after you submit.

Drafts, progress and mock history are saved in your browser's `localStorage`.

## Run it on your computer

```bash
cd r-lab-practice
python make-standalone.py      # rebuilds standalone.html from index.html + exercises.js + app.js
python -m http.server 8000
```

Open <http://localhost:8000/standalone.html> (or `index.html`) with internet on. R downloads from
`webr.r-wasm.org` the first time (about 25 MB).

**Offline copy of WebR (optional):** run `npm pack webr@0.5.9`, extract it, copy `package/dist` to
`r-lab-practice/webr/`, and open `http://localhost:8000/standalone.html?webr=./webr/`.

## How checking works

- `readline()` reads lines from the Input box (one value per line).
- Each test runs your code in a fresh environment and a fresh folder. Depending on the test, it checks numbers
  or words in the output, values computed by R from your own variables, function behaviour such as
  `fact(5) == 120`, whether a plot was drawn, and whether you used a required construct such as `while` or `switch()`.
- If R cannot start, checking is switched off. Nothing is ever marked as passed without real R output.
