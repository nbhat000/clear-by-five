const EMAIL = "nikhil@clearbyfive.com";
const WEEKS = 50;
const THRESHOLD = 25000;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/* Year */
const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

/* Mobile menu */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");

const setMenu = (open) => {
  if (!toggle || !nav) return;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close" : "Menu";
  nav.classList.toggle("is-open", open);
};

toggle?.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    toggle.focus();
  }
});

/* Worksheet */
const blanks = [...document.querySelectorAll(".blank")];
const outputs = Object.fromEntries(
  [...document.querySelectorAll("[data-out]")].map((el) => [el.dataset.out, el])
);
const threshold = document.querySelector("[data-threshold]");
const systems = [...document.querySelectorAll(".checklist input")];
const mailLinks = [...document.querySelectorAll("[data-mail]")];

const read = (input) => {
  const cleaned = input.value.replace(/[^0-9.]/g, "");
  let value = Number.parseFloat(cleaned);
  const valid = cleaned === "" || Number.isFinite(value);
  if (!Number.isFinite(value)) value = 0;
  const max = Number(input.dataset.max);
  if (max && value > max) value = max;
  input.setAttribute("aria-invalid", String(!valid));
  return value;
};

const sizeBlank = (input) => {
  input.style.setProperty("--len", String(Math.max(2, input.value.length)));
};

const figures = () => Object.fromEntries(blanks.map((input) => [input.dataset.key, read(input)]));

const compute = (f) => {
  const leads = f.leadsPerWeek * WEEKS * (f.leadsLostPct / 100) * f.leadTicket;
  const quotes = f.quotesPerMonth * 12 * (f.quotesWonPct / 100) * f.quoteTicket;
  const hours = f.officeHours * WEEKS * f.hourlyCost;
  return { leads, quotes, hours, total: leads + quotes + hours };
};

const flash = (el) => {
  el.classList.remove("is-updated");
  void el.offsetWidth;
  el.classList.add("is-updated");
};

const buildBody = (f, totals) => {
  const lines = [
    "Hi Nikhil,",
    "",
    "I'd like to set up a 20-minute scan.",
    "",
    "Company:",
    "Best number to reach me:",
    "",
    "My worksheet numbers:",
    `- Leads that wait: ${plain.format(f.leadsPerWeek)} a week, ${plain.format(f.leadsLostPct)}% book elsewhere, ${money.format(f.leadTicket)} a job = ${money.format(totals.leads)} a year`,
    `- Estimates that go quiet: ${plain.format(f.quotesPerMonth)} a month, ${plain.format(f.quotesWonPct)}% closable, ${money.format(f.quoteTicket)} a job = ${money.format(totals.quotes)} a year`,
    `- Office time spent chasing: ${plain.format(f.officeHours)} hours a week at ${money.format(f.hourlyCost)} an hour = ${money.format(totals.hours)} a year`,
    `Total: ${money.format(totals.total)} a year`,
  ];
  const checked = systems.filter((box) => box.checked).map((box) => box.value);
  if (checked.length) lines.push("", `Systems we use: ${checked.join(", ")}`);
  return lines.join("\r\n");
};

const updateMail = (f, totals) => {
  const body = buildBody(f, totals);
  mailLinks.forEach((link) => {
    const subject = link.dataset.subject || "20-minute scan request";
    link.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
};

let previous = null;

const render = ({ animate = true } = {}) => {
  const f = figures();
  const totals = compute(f);

  Object.entries(totals).forEach(([key, value]) => {
    const el = outputs[key];
    if (!el) return;
    const text = money.format(value);
    if (el.textContent !== text) {
      el.textContent = text;
      if (animate && previous) flash(el);
    }
  });

  if (threshold) {
    threshold.textContent =
      totals.total >= THRESHOLD
        ? "That clears the $25,000 in annual value our audit guarantee is built on."
        : "Under $25,000 by these numbers. A scan can check what this worksheet doesn’t count.";
  }

  updateMail(f, totals);
  previous = totals;
};

blanks.forEach((input) => {
  sizeBlank(input);
  input.addEventListener("input", () => {
    sizeBlank(input);
    render();
  });
  input.addEventListener("focus", () => input.select());
  input.addEventListener("blur", () => {
    const value = read(input);
    input.value = plain.format(value);
    sizeBlank(input);
    render({ animate: false });
  });
});

systems.forEach((box) => box.addEventListener("change", () => render({ animate: false })));

render({ animate: false });
