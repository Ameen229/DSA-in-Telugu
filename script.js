/* Totals from the course */
const TOTALS = { easy: 131, medium: 187, hard: 136 };
const ALL = TOTALS.easy + TOTALS.medium + TOTALS.hard;

/* Accordion open/close + step meter */
document.querySelectorAll(".step").forEach(section => {
  const header = section.querySelector(".step-header");
  const list = section.querySelector(".problem-list");
  list.style.display = "none"; // hide by default
  header.addEventListener("click", () => {
    const isOpen = header.classList.toggle("open");
    list.style.display = isOpen ? "block" : "none";
    header.querySelector(".caret").textContent = isOpen ? "▾" : "▸";
  });
});

// Handle Lecture accordion inside each step
document.querySelectorAll(".lecture").forEach(lec => {
  const header = lec.querySelector(".lecture-header");
  const problems = lec.querySelector(".lecture-problems");
  problems.style.display = "none"; // hide by default
  header.addEventListener("click", () => {
    const isOpen = header.classList.toggle("open");
    problems.style.display = isOpen ? "block" : "none";
    header.querySelector(".caret").textContent = isOpen ? "▾" : "▸";
  });
});



/* === Progress Logic (bars + radial cards) === */
(() => {
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE_PREFIX = `chk:${location.origin}${location.pathname}:`;

  function keyForCheckbox(cb, idx) {
    return STORAGE_PREFIX + (cb.dataset.key || cb.id || cb.name || idx);
  }

  // Totals derived from DOM once
  let TOTALS = { easy: 0, medium: 0, hard: 0 };
  let ALL = 0;
  function computeTotalsFromDOM() {
  TOTALS = { easy: 0, medium: 0, hard: 0 };
  ALL = 0;

  qsa('.t-row').forEach(row => {
    const cb = qs('.problem-check', row);
    const badge = qs('.badge', row);
    if (!cb || !badge) return;

    if (badge.classList.contains('easy'))   TOTALS.easy++;
    if (badge.classList.contains('medium')) TOTALS.medium++;
    if (badge.classList.contains('hard'))   TOTALS.hard++;
    ALL++;
  });
}


  function setRadial(kind, percent) {
    const card = qs(`.progress-card[data-kind="${kind}"]`);
    if (!card) return;
    const circle = qs(".fg", card);
    const pctEl  = qs(`#pct-${kind}`, card) || qs(".pct", card);
    const per = Math.max(0, Math.min(100, Math.round(percent)));
    const CIRC = 2 * Math.PI * 52; // matches r=52
    if (circle) {
      circle.style.strokeDasharray  = CIRC;
      circle.style.strokeDashoffset = CIRC - (CIRC * per / 100);
      const colorMap = {
        total: "#7c7cff",
        easy:  "var(--easy)",
        medium:"var(--medium)",
        hard:  "var(--hard)"
      };
      circle.style.stroke = colorMap[kind] || "#7c7cff";
    }
    if (pctEl) pctEl.textContent = `${per}%`;
  }

  function refreshTotals() {
  let e = 0, m = 0, h = 0;

  qsa('.t-row').forEach(row => {
    const cb = qs('.problem-check', row);
    const badge = qs('.badge', row);
    if (!cb || !badge) return;

    if (cb.checked) {
      if (badge.classList.contains('easy'))   e++;
      if (badge.classList.contains('medium')) m++;
      if (badge.classList.contains('hard'))   h++;
    }
  });

  const ePct = TOTALS.easy   ? (e / TOTALS.easy)   * 100 : 0;
  const mPct = TOTALS.medium ? (m / TOTALS.medium) * 100 : 0;
  const hPct = TOTALS.hard   ? (h / TOTALS.hard)   * 100 : 0;

  setRadial("easy", ePct);
  setRadial("medium", mPct);
  setRadial("hard", hPct);

  const done = e + m + h;
  const tPct = ALL ? (done / ALL) * 100 : 0;
  setRadial("total", tPct);

  if (qs("#txt-easy"))   qs("#txt-easy").textContent   = `${e} / ${TOTALS.easy} completed`;
  if (qs("#txt-medium")) qs("#txt-medium").textContent = `${m} / ${TOTALS.medium} completed`;
  if (qs("#txt-hard"))   qs("#txt-hard").textContent   = `${h} / ${TOTALS.hard} completed`;
  if (qs("#txt-total"))  qs("#txt-total").textContent  = `${done} / ${ALL}`;
}


  function updateStepMeter(stepEl) {
    const checks = qsa(".problem-check", stepEl);
    const done   = qsa(".problem-check:checked", stepEl).length;
    const total  = checks.length;
    const pct    = total ? Math.round((done / total) * 100) : 0;
    const fill   = qs(".meter-fill", stepEl);
    const count  = qs(".meter-count", stepEl);
    if (fill)  fill.style.width = pct + "%";
    if (count) count.textContent = `${done} / ${total}`;
  }

  function restoreCheckboxes() {
    qsa(".problem-check").forEach((cb, i) => {
      const key = keyForCheckbox(cb, i);
      if (localStorage.getItem(key) === "1") cb.checked = true;
    });
  }

  function persistCheckbox(cb, idx) {
    const key = keyForCheckbox(cb, idx);
    if (cb.checked) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  }

  function handleChange(e) {
    const cb = e.target.closest('.problem-check');
    if (!cb) return;
    const all = qsa('.problem-check');
    const idx = all.indexOf(cb);
    persistCheckbox(cb, idx);
    const stepEl = cb.closest(".step");
    if (stepEl) updateStepMeter(stepEl);
    refreshTotals();
  }

  function init() {
    computeTotalsFromDOM();
    restoreCheckboxes();
    qsa(".step").forEach(updateStepMeter);
    refreshTotals();
    document.addEventListener("change", handleChange, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();



