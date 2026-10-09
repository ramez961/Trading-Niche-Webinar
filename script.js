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

  const mountVsl = (videoUrl) => {
    const slot = document.querySelector("[data-vsl-slot]");
    if (!slot || !videoUrl) return;

    let url;
    try {
      url = new URL(videoUrl);
    } catch {
      return;
    }

    const allowedHosts = new Set(["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com"]);
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) return;

    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId = url.hostname === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") || (["embed", "shorts", "live"].includes(pathParts[0]) ? pathParts[1] : "");
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;

    const frame = document.createElement("iframe");
    frame.className = "vsl-frame";
    frame.title = "الفيديو التعريفي لجلسة Northhouse";
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    const embedUrl = "https://www.youtube-nocookie.com/embed/" + videoId + "?rel=0&playsinline=1";

    const loadFrame = () => {
      if (frame.src) return;
      frame.src = embedUrl;
      slot.replaceChildren(frame);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadFrame();
        }
      }, { rootMargin: "240px" });
      observer.observe(slot);
    } else {
      loadFrame();
    }
  };

  mountVsl(config.vslVideoUrl);

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
  const vslSection = document.querySelector("#watch");
  const registration = document.querySelector("#register");
  if (mobileCta && hero && registration && "IntersectionObserver" in window) {
    const isMobile = window.matchMedia("(max-width: 680px)");
    let heroVisible = true;
    let vslVisible = false;
    let registrationVisible = false;

    const updateMobileCta = () => {
      const visible = isMobile.matches && !heroVisible && !vslVisible && !registrationVisible;
      mobileCta.classList.toggle("is-visible", visible);
      mobileCta.setAttribute("aria-hidden", String(!visible));
      mobileCta.tabIndex = visible ? 0 : -1;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === vslSection) vslVisible = entry.isIntersecting;
        if (entry.target === registration) registrationVisible = entry.isIntersecting;
      });
      updateMobileCta();
    }, { threshold: 0.01 });

    observer.observe(hero);
    if (vslSection) observer.observe(vslSection);
    observer.observe(registration);
    isMobile.addEventListener("change", updateMobileCta);
    updateMobileCta();
  }
})();

