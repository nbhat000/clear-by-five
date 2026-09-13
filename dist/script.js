/* ------------------------------------------------------------------
   SETUP: paste your links here. The site works before you do;
   the form just falls back to email.
   ------------------------------------------------------------------ */
const CONFIG = {
  email: "nikhil@clearbyfive.com",

  // Google Calendar booking page link (Calendar > Create > Appointment schedule > Share).
  // Example: "https://calendar.app.google/AbCdEf123"
  bookingUrl: "",

  // Google Form that collects scan requests. Leave action empty to fall back to email.
  googleForm: {
    // Your form's link with "viewform" swapped for "formResponse".
    // Example: "https://docs.google.com/forms/d/e/1FAIpQL.../formResponse"
    action: "",
    // The entry IDs from the form's pre-filled link.
    fields: {
      name: "entry.0000000001",
      email: "entry.0000000002",
      company: "entry.0000000003",
      phone: "entry.0000000004",
      details: "entry.0000000005",
    },
  },
};

const WEEKS = 50;
const THRESHOLD = 25000;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/* Header, menu, year */

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const year = document.querySelector("[data-year]");

if (year) year.textContent = String(new Date().getFullYear());

const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const setMenu = (open) => {
  menuButton?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
};

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

/* Booking buttons go straight to the calendar once a booking page is set */

if (CONFIG.bookingUrl) {
  document.querySelectorAll("[data-cta]").forEach((link) => {
    link.href = CONFIG.bookingUrl;
    link.target = "_blank";
    link.rel = "noopener";
  });
}

/* Cost worksheet */

const blanks = [...document.querySelectorAll(".blank")];
const outputs = Object.fromEntries(
  [...document.querySelectorAll("[data-out]")].map((el) => [el.dataset.out, el])
);
const threshold = document.querySelector("[data-threshold]");
const systems = [...document.querySelectorAll(".systems-grid input")];

const read = (input) => {
  let value = Number.parseFloat(input.value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(value)) value = 0;
  const max = Number(input.dataset.max);
  if (max && value > max) value = max;
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

let worksheetTouched = false;
let rendered = false;

const flash = (el) => {
  el.classList.remove("is-updated");
  void el.offsetWidth;
  el.classList.add("is-updated");
};

const render = ({ animate = true } = {}) => {
  const totals = compute(figures());

  Object.entries(totals).forEach(([key, value]) => {
    const el = outputs[key];
    if (!el) return;
    const text = money.format(value);
    if (el.textContent !== text) {
      el.textContent = text;
      if (animate && rendered) flash(el);
    }
  });

  if (threshold) {
    threshold.textContent =
      totals.total >= THRESHOLD
        ? "That’s above the $25,000 our audit guarantee is built on."
        : "Under $25,000 by these numbers. A scan can check what this doesn’t count.";
  }

  rendered = true;
};

blanks.forEach((input) => {
  sizeBlank(input);
  input.addEventListener("input", () => {
    worksheetTouched = true;
    sizeBlank(input);
    render();
  });
  input.addEventListener("focus", () => input.select());
  input.addEventListener("blur", () => {
    input.value = plain.format(read(input));
    sizeBlank(input);
    render({ animate: false });
  });
});

render({ animate: false });

/* Details that ride along with a scan request */

const buildDetails = () => {
  const f = figures();
  const t = compute(f);
  const lines = [
    worksheetTouched ? "Worksheet (their numbers):" : "Worksheet (example numbers, not edited):",
    `- Leads that wait: ${plain.format(f.leadsPerWeek)}/week, ${plain.format(f.leadsLostPct)}% lost, ${money.format(f.leadTicket)}/job = ${money.format(t.leads)}/yr`,
    `- Quotes that go quiet: ${plain.format(f.quotesPerMonth)}/month, ${plain.format(f.quotesWonPct)}% closable, ${money.format(f.quoteTicket)}/job = ${money.format(t.quotes)}/yr`,
    `- Office time: ${plain.format(f.officeHours)} hrs/week at ${money.format(f.hourlyCost)}/hr = ${money.format(t.hours)}/yr`,
    `Total: ${money.format(t.total)}/yr`,
  ];
  const checked = systems.filter((box) => box.checked).map((box) => box.value);
  lines.push("", `Software: ${checked.length ? checked.join(", ") : "not selected"}`);
  return lines.join("\n");
};

/* Scan request form */

const form = document.querySelector("[data-book-form]");
const done = document.querySelector("[data-book-done]");
const doneMessage = document.querySelector("[data-done-message]");
const bookingLink = document.querySelector("[data-booking-link]");
const errorBox = document.querySelector("[data-form-error]");
const submitButton = document.querySelector("[data-submit]");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = () => {
  const problems = [];
  const { name, email, company } = form.elements;

  [name, email, company].forEach((input) => input.setAttribute("aria-invalid", "false"));

  if (!name.value.trim()) {
    problems.push("your name");
    name.setAttribute("aria-invalid", "true");
  }
  if (!emailPattern.test(email.value.trim())) {
    problems.push("a valid email");
    email.setAttribute("aria-invalid", "true");
  }
  if (!company.value.trim()) {
    problems.push("your company");
    company.setAttribute("aria-invalid", "true");
  }
  return problems;
};

const showDone = (message) => {
  form.hidden = true;
  done.hidden = false;
  if (message) doneMessage.textContent = message;
  if (CONFIG.bookingUrl && bookingLink) {
    doneMessage.textContent = "Grab a time on the calendar now so we don’t have to trade emails.";
    bookingLink.href = CONFIG.bookingUrl;
    bookingLink.hidden = false;
  }
  done.focus();
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  const problems = validate();
  if (problems.length) {
    errorBox.textContent = `Please add ${problems.join(", ")}.`;
    errorBox.hidden = false;
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  // Bots fill the hidden field; people never see it.
  if (form.elements.website.value) {
    showDone();
    return;
  }

  const values = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    company: form.elements.company.value.trim(),
    phone: form.elements.phone.value.trim(),
    details: buildDetails(),
  };

  if (!CONFIG.googleForm.action) {
    const body = [
      "Hi Nikhil,",
      "",
      "I'd like to book a free 20-minute scan.",
      "",
      `Name: ${values.name}`,
      `Company: ${values.company}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone || "not given"}`,
      "",
      values.details,
    ].join("\r\n");
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(
      `Scan request: ${values.company}`
    )}&body=${encodeURIComponent(body)}`;
    showDone("Your email app should open with everything filled in. Hit send and Nikhil will reply to set a time.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  const payload = new URLSearchParams();
  Object.entries(CONFIG.googleForm.fields).forEach(([key, entry]) => {
    payload.append(entry, values[key] || "");
  });

  try {
    await fetch(CONFIG.googleForm.action, { method: "POST", mode: "no-cors", body: payload });
    showDone();
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Request my free scan";
    errorBox.textContent = `That didn’t go through. Check your connection and try again, or email ${CONFIG.email}.`;
    errorBox.hidden = false;
  }
});

/* Mobile sticky button: appears after the hero, hides at the booking form */

const mobileCta = document.querySelector("[data-mobile-cta]");
const hero = document.querySelector(".hero");
const bookSection = document.getElementById("book");

if (mobileCta && hero && bookSection && "IntersectionObserver" in window) {
  let pastHero = false;
  let atBooking = false;

  const sync = () => {
    const show = pastHero && !atBooking;
    mobileCta.classList.toggle("is-visible", show);
    mobileCta.setAttribute("aria-hidden", String(!show));
    mobileCta.querySelector("a")?.setAttribute("tabindex", show ? "0" : "-1");
  };

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting;
    sync();
  }).observe(hero);

  new IntersectionObserver(([entry]) => {
    atBooking = entry.isIntersecting;
    sync();
  }).observe(bookSection);
}
