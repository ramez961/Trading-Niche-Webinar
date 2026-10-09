(() => {
  "use strict";

  const config = window.WEBINAR_CONFIG || {};
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const dateLabel = config.eventDateLabel || "التاريخ والوقت يعلنان قريبًا";
  document.querySelectorAll("[data-event-date]").forEach((node) => {
    node.textContent = dateLabel;
  });

  if (config.eventStartISO) {
    const start = new Date(config.eventStartISO);
    if (!Number.isNaN(start.getTime())) {
      const formatted = new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: config.timeZone || "Asia/Riyadh"
      }).format(start);
      document.querySelectorAll("[data-event-date]").forEach((node) => {
        node.textContent = formatted;
      });
    }
  }

  const embedHosts = new Set([
    "api.leadconnectorhq.com",
    "link.msgsndr.com",
    "forms.leadconnectorhq.com"
  ]);

  const mountEmbed = (slotName, urlValue, title) => {
    const slot = document.querySelector('[data-embed-slot="' + slotName + '"]');
    if (!slot || !urlValue) return;

    let url;
    try {
      url = new URL(urlValue);
    } catch {
      return;
    }
    if (url.protocol !== "https:" || !embedHosts.has(url.hostname)) return;

    const frame = document.createElement("iframe");
    frame.className = "embed-frame";
    frame.title = title;
    frame.src = url.href;
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "clipboard-write";
    slot.replaceChildren(frame);
  };

  mountEmbed("registration", config.registrationEmbedUrl, "نموذج التسجيل في الجلسة");
  mountEmbed("application", config.applicationEmbedUrl, "نموذج طلب الشراكة");

  const setExternalLink = (selector, urlValue, label) => {
    const links = document.querySelectorAll(selector);
    let url;
    try {
      url = new URL(urlValue || "");
    } catch {
      links.forEach((link) => {
        link.setAttribute("aria-disabled", "true");
        link.classList.add("pending-link");
        link.textContent = label;
        link.removeAttribute("href");
      });
      return;
    }
    if (url.protocol !== "https:") return;
    links.forEach((link) => {
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.classList.remove("pending-link");
    });
  };

  setExternalLink("[data-booking-link]", config.bookingUrl, "رابط الحجز سيضاف بعد اعتماده");
  setExternalLink("[data-payment-link]", config.paymentUrl, "رابط الدفع سيضاف بعد اعتماد العرض");

  const mobileCta = document.querySelector("[data-mobile-cta]");
  const hero = document.querySelector(".hero");
  const registration = document.querySelector("#register");
  if (mobileCta && hero && registration && "IntersectionObserver" in window) {
    const isMobile = window.matchMedia("(max-width: 680px)");
    let heroVisible = true;
    let registrationVisible = false;

    const updateMobileCta = () => {
      const visible = isMobile.matches && !heroVisible && !registrationVisible;
      mobileCta.classList.toggle("is-visible", visible);
      mobileCta.setAttribute("aria-hidden", String(!visible));
      mobileCta.tabIndex = visible ? 0 : -1;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === registration) registrationVisible = entry.isIntersecting;
      });
      updateMobileCta();
    }, { threshold: 0.01 });

    observer.observe(hero);
    observer.observe(registration);
    isMobile.addEventListener("change", updateMobileCta);
    updateMobileCta();
  }
})();
