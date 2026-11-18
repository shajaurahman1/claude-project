"""Build standalone.html: one self-contained file (HTML + data + app) to run locally.
Usage: python make-standalone.py   then   python -m http.server 8000
and open http://localhost:8000/standalone.html (R loads from webr.r-wasm.org)."""
from pathlib import Path
here = Path(__file__).parent
page = (here / "index.html").read_text(encoding="utf-8")
for name in ("exercises.js", "app.js"):
    js = (here / name).read_text(encoding="utf-8")
    page = page.replace(f'<script src="{name}"></script>', f"<script>\n{js}\n</script>")
html = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n" + page.replace("<header", "</head>\n<body>\n<header", 1) + "\n</body>\n</html>\n"
(here / "standalone.html").write_text(html, encoding="utf-8")
print("Wrote", here / "standalone.html")
