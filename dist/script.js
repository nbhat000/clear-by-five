/* ------------------------------------------------------------------
   SETUP: paste your links here. The site works before you do;
   the form just falls back to email.
   ------------------------------------------------------------------ */
const CONFIG = {
  email: "nqb5152@gmail.com",
  displayEmail: "nikhil@clearbyfive.com",

  // Add a Google Calendar Appointment Schedule or Calendly URL here when ready.
  // Until then, every CTA scrolls to the qualified request form below.
  bookingUrl: "https://calendar.app.google/S2CGWY6gTtXmTJig7",

  // Add the Meta Dataset/Pixel ID before paid traffic. The loader safely no-ops while blank.
  metaPixelId: "",

  // Live Google Form used as the no-backend lead store for this GitHub Pages site.
  googleForm: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSfsUPHAPT_06n6-GDpMTpxU1anWwAY6BWjRJbsuCazyOt3WSQ/formResponse",
    editUrl: "https://docs.google.com/forms/d/150r1cJQL4boqUpVmcaaWFOvfdaUkHD-0iV72vY_xIgw/edit",
    fields: {
      name: "entry.10000001",
      email: "entry.10000002",
      phone: "entry.10000003",
      company: "entry.10000004",
      companyWebsite: "entry.10000005",
      revenue: "entry.10000006",
      role: "entry.10000007",
      leak: "entry.10000008",
      systems: "entry.10000009",
      timing: "entry.10000010",
      details: "entry.10000011",
    },
  },
};



/* Attribution and conversion tracking */

const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
const currentParams = new URLSearchParams(window.location.search);
const attribution = Object.fromEntries(
  attributionKeys
    .map((key) => [key, currentParams.get(key) || sessionStorage.getItem(`cbf_${key}`) || ""])
    .filter(([, value]) => value)
);
Object.entries(attribution).forEach(([key, value]) => sessionStorage.setItem(`cbf_${key}`, value));

if (CONFIG.metaPixelId) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", CONFIG.metaPixelId);
  fbq("track", "PageView");
}

const track = (eventName, parameters = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...parameters });
  if (typeof window.fbq === "function") window.fbq("track", eventName, parameters);
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

document.querySelectorAll("[data-cta]").forEach((link) => {
  link.addEventListener("click", () => track("Contact", { content_name: "AI Opportunity Scan" }));
  if (CONFIG.bookingUrl) {
    link.href = CONFIG.bookingUrl;
    link.target = "_blank";
    link.rel = "noopener";
  }
});

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
  lines.push("", `Software selected in worksheet: ${checked.length ? checked.join(", ") : "not selected"}`);
  const attributionLine = Object.entries(attribution).map(([key, value]) => `${key}=${value}`).join(", ");
  lines.push(`Attribution: ${attributionLine || "direct / unavailable"}`);
  lines.push(`Landing page: ${window.location.href}`);
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
  const requiredFields = [
    ["name", "your name"],
    ["email", "a valid work email"],
    ["phone", "your mobile phone"],
    ["company", "your company"],
    ["companyWebsite", "your company website"],
    ["revenue", "annual revenue"],
    ["role", "your role"],
    ["leak", "the largest operational leak"],
    ["primarySystem", "your main business system"],
    ["timing", "a timeframe"],
  ];

  requiredFields.forEach(([field]) => form.elements[field].setAttribute("aria-invalid", "false"));

  requiredFields.forEach(([field, label]) => {
    const input = form.elements[field];
    if (!input.value.trim()) {
      problems.push(label);
      input.setAttribute("aria-invalid", "true");
    }
  });

  if (form.elements.email.value && !emailPattern.test(form.elements.email.value.trim())) {
    if (!problems.includes("a valid work email")) problems.push("a valid work email");
    form.elements.email.setAttribute("aria-invalid", "true");
  }

  try {
    if (form.elements.companyWebsite.value && !/^https?:\/\//i.test(form.elements.companyWebsite.value)) {
      form.elements.companyWebsite.value = `https://${form.elements.companyWebsite.value}`;
    }
    new URL(form.elements.companyWebsite.value);
  } catch {
    if (!problems.includes("your company website")) problems.push("a valid company website");
    form.elements.companyWebsite.setAttribute("aria-invalid", "true");
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
  if (form.elements.fax.value) {
    showDone();
    return;
  }

  const pickedSystems = [...new Set([
    form.elements.primarySystem.value,
    ...systems.filter((box) => box.checked).map((box) => box.value),
  ].filter(Boolean))];

  const values = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    company: form.elements.company.value.trim(),
    companyWebsite: form.elements.companyWebsite.value.trim(),
    revenue: form.elements.revenue.value,
    role: form.elements.role.value,
    leak: form.elements.leak.value,
    systems: pickedSystems,
    timing: form.elements.timing.value,
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
      `Website: ${values.companyWebsite}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `Revenue: ${values.revenue}`,
      `Role: ${values.role}`,
      `Largest leak: ${values.leak}`,
      `Systems: ${values.systems.join(", ")}`,
      `Timing: ${values.timing}`,
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
    const value = values[key];
    if (Array.isArray(value)) value.forEach((item) => payload.append(entry, item));
    else payload.append(entry, value || "");
  });

  try {
    await fetch(CONFIG.googleForm.action, { method: "POST", mode: "no-cors", body: payload });
    track("Lead", {
      content_name: "AI Opportunity Scan",
      content_category: values.leak,
      company_revenue: values.revenue,
      lead_timing: values.timing,
    });
    showDone("Request received. Nikhil will review it and contact you to schedule the scan.");
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Request my free scan";
    errorBox.textContent = `That didn’t go through. Check your connection and try again, or email ${CONFIG.displayEmail}.`;
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
