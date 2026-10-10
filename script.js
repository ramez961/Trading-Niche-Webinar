(() => {
  "use strict";

  const config = window.WEBINAR_CONFIG || {};
  const utmKeys = ["utm_source", "utm_campaign", "utm_content", "utm_term"];
  const registrationUtms = (() => {
    const values = {};
    try {
      const saved = JSON.parse(sessionStorage.getItem("northouse-registration-utms") || "{}");
      utmKeys.forEach((key) => {
        if (typeof saved[key] === "string" && saved[key]) values[key] = saved[key];
      });
      const current = new URLSearchParams(window.location.search);
      utmKeys.forEach((key) => {
        const value = current.get(key);
        if (value) values[key] = value.slice(0, 500);
      });
      sessionStorage.setItem("northouse-registration-utms", JSON.stringify(values));
    } catch {
      const current = new URLSearchParams(window.location.search);
      utmKeys.forEach((key) => {
        const value = current.get(key);
        if (value) values[key] = value.slice(0, 500);
      });
    }
    return values;
  })();
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

    if (slotName === "registration") {
      utmKeys.forEach((key) => {
        if (registrationUtms[key]) url.searchParams.set(key, registrationUtms[key]);
      });
    }

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

  const paletteKeys = new Set(["snowfall", "winter", "porcelain", "cotton", "green", "graphite"]);
  const paletteChoices = [...document.querySelectorAll("[data-palette-choice]")];
  const paletteToggle = document.querySelector(".theme-toggle");
  const palettePanel = document.querySelector("#palette-options");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const applyPalette = (name) => {
    const palette = paletteKeys.has(name) ? name : "snowfall";
    document.documentElement.dataset.palette = palette;
    paletteChoices.forEach((choice) => {
      choice.setAttribute("aria-pressed", String(choice.dataset.paletteChoice === palette));
    });
    if (themeColor) {
      themeColor.content = ({
        snowfall: "#101826",
        winter: "#1E2A33",
        porcelain: "#1B2A38",
        cotton: "#26263A",
        green: "#1E3025",
        graphite: "#181B1F"
      })[palette];
    }
    try {
      localStorage.setItem("northouse-palette", palette);
    } catch {}
  };

  let savedPalette = "snowfall";
  try {
    savedPalette = localStorage.getItem("northouse-palette") || savedPalette;
  } catch {}
  applyPalette(savedPalette);

  if (paletteToggle && palettePanel) {
    paletteToggle.addEventListener("click", () => {
      const open = paletteToggle.getAttribute("aria-expanded") !== "true";
      paletteToggle.setAttribute("aria-expanded", String(open));
      palettePanel.hidden = !open;
    });
    paletteChoices.forEach((choice) => {
      choice.addEventListener("click", () => applyPalette(choice.dataset.paletteChoice));
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".theme-picker")) {
        paletteToggle.setAttribute("aria-expanded", "false");
        palettePanel.hidden = true;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        paletteToggle.setAttribute("aria-expanded", "false");
        palettePanel.hidden = true;
        paletteToggle.focus();
      }
    });
  }

  const translations = {
  "جلسة Northouse لصناع وخبراء التداول": "Northouse Webinar for Trading Creators and Experts",
  "عن الجلسة": "About the webinar",
  "لمن الجلسة؟": "Who is it for?",
  "الأسئلة": "FAQs",
  "جرّب الألوان": "Try the colors",
  "اختر لوحة الألوان للمعاينة": "Choose a palette to preview",
  "الصفحات": "Pages",
  "تأكيد التسجيل": "Registration confirmation",
  "طلب الشراكة": "Partnership application",
  "حجز محادثة": "Book a conversation",
  "تفاصيل العرض والدفع": "Offer and payment details",
  "سياسة الخصوصية": "Privacy policy",
  "الشروط والتنويه": "Terms and disclaimer",
  "سجّل اهتمامك": "Register your interest",
  "جلسة تعريفية مباشرة · السعودية": "Live introductory webinar · Saudi Arabia",
  "خبرتك في التداول": "Your trading expertise",
  "قد تفتح باب شراكة جديدة": "could open the door to a new partnership",
  "تعرّف على نموذج الشراكة الذي تبنيه Northouse مع صناع المحتوى والخبراء في مجال التداول، واكتشف كيف تبدأ محادثة مناسبة لخبرتك وجمهورك.": "Learn about Northouse’s partnership model for trading content creators and experts, and discover how to start a conversation that fits your experience and audience.",
  "اكتشف تفاصيل الجلسة": "Explore the webinar",
  "موعد الجلسة": "Webinar date",
  "التاريخ والوقت يعلنان قريبًا": "Date and time to be announced",
  "الوقت المحلي": "Local time",
  "الرياض · السعودية": "Riyadh · Saudi Arabia",
  "لقاء تعريفي عن نموذج الشراكة — وليس توصيات استثمارية أو وعدًا بعوائد.": "An introduction to a partnership model—not investment advice or a promise of returns.",
  "جلسة تعريفية": "Introductory session",
  "لصناع المحتوى والخبراء": "For creators and experts",
  "من قراءة السوق": "From reading the market",
  "إلى حوار الشراكة": "to a partnership conversation",
  "نظرة توضيحية": "Illustrative view",
  "لا تمثل بيانات تداول فعلية": "Not actual trading data",
  "خبرة": "Experience",
  "جمهور": "Audience",
  "شراكة": "Partnership",
  "محتوى تعريفي": "Introductory content",
  "بدون وعود بعوائد": "No promises of returns",
  "نموذج الشراكة بوضوح": "A clear partnership model",
  "نقاش يناسب خبرتك وجمهورك": "A conversation shaped around your experience and audience",
  "بلا وعود بأرباح": "No promises of profit",
  "قبل التسجيل": "Before you register",
  "شاهد الفيديو التعريفي": "Watch the introduction",
  "خذ فكرة أوضح عن الجلسة ونموذج الشراكة قبل أن تقرر إن كان التسجيل مناسبًا لك.": "Get a clearer picture of the webinar and partnership model before deciding whether to register.",
  "سيظهر الفيديو هنا بعد إضافة رابط VSL في ملف الإعدادات.": "The video will appear here once the VSL link is added to the configuration file.",
  "فيديو تعريفي · Northouse": "Northouse introductory video",
  "من محتوى التداول": "From trading content",
  "إلى": "to",
  "نموذج تعاون مفهوم": "a clear collaboration model",
  "لقاء يعرّفك على طريقة عمل Northouse مع صناع المحتوى والخبراء في هذا المجال، وكيف يمكن أن تنتقل المحادثة إلى تقييم فرصة شراكة مناسبة للطرفين.": "Learn how Northouse works with content creators and experts in this field, and how a conversation can lead to evaluating a partnership opportunity that suits both sides.",
  "افهم نموذج الشراكة": "Understand the partnership model",
  "تعرّف على فكرة التعاون وما الذي تبحث عنه Northouse في الشركاء المحتملين.": "Learn how the collaboration works and what Northouse looks for in potential partners.",
  "قيّم مدى الملاءمة": "See if it’s a good fit",
  "ناقش خبرتك ونوعية جمهورك، وحدد إن كانت الخطوة التالية مناسبة لك.": "Discuss your experience and audience, then decide whether the next step is right for you.",
  "اعرف ما بعد الجلسة": "Know what comes next",
  "إذا رغبت بالمتابعة، ستتضح لك آلية التقديم والمحادثة مع الفريق.": "If you’d like to continue, the team will explain the application process and next conversation.",
  "تفاصيل العرض وشروط الشراكة النهائية تُشرح بوضوح قبل اتخاذ أي قرار.": "The offer details and final partnership terms will be explained clearly before you make a decision.",
  "هل تناسبك؟": "Is it right for you?",
  "هذه الجلسة": "This webinar",
  "لأصحاب الخبرة والجمهور": "For people with experience and an audience",
  "صُممت الجلسة للتعارف مع أشخاص لديهم حضور أو خبرة حقيقية في مجال التداول، ويرغبون بفهم فرصة تعاون محتملة.": "This webinar is for people with a real presence or experience in trading who want to understand a potential collaboration opportunity.",
  "أرسل اهتمامك": "Register your interest",
  "صناع محتوى التداول": "Trading content creators",
  "لديك قناة أو حساب تنشر فيه محتوى متخصصًا.": "You have a channel or account where you share specialized content.",
  "خبراء وممارسون": "Experts and practitioners",
  "لديك خبرة في المجال وتستطيع شرحها لجمهور مهتم.": "You have experience in the field and can explain it to an interested audience.",
  "قادة مجتمعات تعليمية": "Leaders of learning communities",
  "تدير مجتمعًا أو مساحة يتابعها مهتمون بالتداول.": "You run a community or space followed by people interested in trading.",
  "الجلسة للتعريف بنموذج الشراكة، ولا تتضمن توصيات لشراء أو بيع أصول مالية.": "This webinar introduces the partnership model and does not include recommendations to buy or sell financial assets.",
  "كيف تسير الرحلة؟": "How does it work?",
  "خطوات بسيطة،": "A few simple steps,",
  "من التسجيل إلى القرار": "from registration to a decision",
  "مسار واضح يساعد الفريق على متابعة كل مهتم، ويمنحك صورة دقيقة عن الخطوة التالية.": "A clear process helps the team follow up with everyone interested and shows you what happens next.",
  "اترك بياناتك ورابط حسابك أو مجتمعك.": "Share your details and a link to your account or community.",
  "استلم التفاصيل": "Get the details",
  "تصلك معلومات الموعد والتذكير قبل الجلسة.": "Receive the date and a reminder before the webinar.",
  "احضر الجلسة": "Attend the webinar",
  "تعرّف على نموذج الشراكة واطرح أسئلتك.": "Learn about the partnership model and ask your questions.",
  "اختر خطوتك": "Choose your next step",
  "إذا رغبت، قدّم طلبًا وحدد محادثة مع الفريق.": "If you’re interested, submit an application and book a conversation with the team.",
  "الخطوة التالية تبدأ هنا": "Your next step starts here",
  "وسنشاركك التفاصيل": "and we’ll share the details",
  "بعد تأكيد الموعد وربط نموذج التسجيل، ستتمكن من إرسال بياناتك واستلام معلومات الحضور والتذكيرات.": "Once the date is confirmed and the registration form is connected, you’ll be able to submit your details and receive attendance information and reminders.",
  "المنطقة الزمنية": "Time zone",
    "الموعد": "Date",
  "توقيت الرياض (UTC+3)": "Riyadh time (UTC+3)",
  "اللغة": "Language",
  "تحدد مع تفاصيل الجلسة": "To be confirmed with the webinar details",
  "تسجيل الجلسة": "Webinar registration",
  "نموذج التسجيل سيظهر هنا": "The registration form will appear here",
  "نربط هذا المكان بنموذج GoHighLevel بعد تجهيز الحقول وخطوات الموافقة والتذكير.": "We’ll connect the GoHighLevel form here once the fields, consent steps, and reminders are ready.",
  "جاهز للربط · التسجيل غير مفعّل بعد": "Ready to connect · registration is not active yet",
  "بإرسال النموذج، ستوافق على استخدام بياناتك لإدارة التسجيل والتواصل بشأن الجلسة وفق": "By submitting the form, you agree to the use of your information to manage registration and contact you about the webinar, as described in the",
  "أسئلة شائعة": "Frequently asked questions",
  "قبل أن": "Before you",
  "تسجّل": "register",
  "كل التفاصيل المهمة ستصلك قبل الموعد.": "You’ll receive all the important details before the webinar.",
  "لمن هذه الجلسة؟": "Who is this webinar for?",
  "لصناع المحتوى والخبراء وأصحاب المجتمعات في مجال التداول، خصوصًا من لديهم جمهور أو خبرة يرغبون بمناقشة فرصة تعاون.": "It’s for trading content creators, experts, and community owners—especially those with an audience or experience who want to discuss a collaboration opportunity.",
  "هل هي جلسة توصيات أو تعليم تداول؟": "Is this a signals or trading education session?",
  "لا. هدفها شرح نموذج الشراكة والتعارف مع الشركاء المحتملين، وليست توصية استثمارية أو وعدًا بنتائج مالية.": "No. It explains the partnership model and introduces potential partners. It is not investment advice or a promise of financial results.",
  "متى وأين ستقام؟": "When and where will it take place?",
  "موعد الجلسة وطريقة الحضور سيؤكدان قبل فتح التسجيل. المنطقة الزمنية المعتمدة هي توقيت الرياض.": "The date and attendance details will be confirmed before registration opens. The time zone is Riyadh time.",
  "ماذا يحدث بعد الجلسة؟": "What happens after the webinar?",
  "يمكن للمهتمين الانتقال إلى طلب شراكة ومحادثة تعريفية. أي عرض أو شروط توضح قبل الالتزام.": "Interested attendees can submit a partnership application and have an introductory conversation. Any offer or terms will be explained before you commit.",
  "هل لديك خبرة تستحق": "Do you have experience worth",
  "محادثة جديدة؟": "a new conversation?",
  "جلسة تعريفية عن نموذج الشراكة لصناع وخبراء التداول في السعودية.": "An introductory session about a partnership model for trading creators and experts in Saudi Arabia.",
  "الخصوصية": "Privacy",
  "وصل تسجيلك — Northouse": "Registration received — Northouse",
  "الصفحة الرئيسية": "Home",
  "تم استلام طلبك": "Your application has been received",
  "شكرًا لاهتمامك.": "Thank you for your interest.",
  "إذا أتممت نموذج التسجيل، فقد وصلت بياناتك إلى الفريق. ستصلك تفاصيل الجلسة والتذكير على وسيلة التواصل التي اخترتها بعد تأكيد الموعد.": "If you completed the registration form, the team has received your details. Once the date is confirmed, you’ll receive the webinar information and reminder through your chosen contact method.",
  "بعد حضور الجلسة، يمكنك إرسال طلب الشراكة ليتعرف الفريق على خبرتك ومحتواك.": "After attending the webinar, you can submit a partnership application so the team can learn about your experience and content.",
  "موعد الجلسة الحالي:": "Current webinar date:",
  ". احتفظ برسالة التأكيد للرجوع إلى رابط الحضور.": ". Keep your confirmation message so you can find the attendance link.",
  "قدّم طلب الشراكة بعد حضور الجلسة": "Apply for a partnership after the webinar",
  "العودة إلى الصفحة الرئيسية": "Return to the home page",
  "طلب شراكة — Northouse": "Partnership application — Northouse",
  "الخطوة التالية بعد الجلسة": "The next step after the webinar",
  "قدّم طلب الشراكة": "Apply for a partnership",
  "أخبر الفريق عن خبرتك ومحتواك وجمهورك. بعد إرسال الطلب، ستنتقل إلى صفحة حجز محادثة تعريفية مع الفريق.": "Tell the team about your experience, content, and audience. After submitting, you’ll be taken to a page to book an introductory conversation with the team.",
  "أضف روابط حساباتك أو مجتمعك.": "Add links to your accounts or community.",
  "اشرح نوع المحتوى أو الخبرة التي تقدمها.": "Describe the content or expertise you offer.",
  "أرسل الطلب بعد قراءة التفاصيل والشروط النهائية.": "Submit your application after reviewing the final details and terms.",
  "نموذج الطلب سيظهر هنا": "The application form will appear here",
  "نربط النموذج بعد اعتماد أسئلة التأهيل ومسار CRM.": "We’ll connect the form once the qualification questions and CRM flow are approved.",
  "نموذج التقديم غير مفعّل بعد": "The application form is not active yet",
  "بعد إرسال النموذج، ستنتقل إلى صفحة الحجز. يضبط الفريق هذا التحويل في إعدادات نجاح نموذج GoHighLevel.": "After submitting the form, you’ll be taken to the booking page. The team will set this redirect in the GoHighLevel form’s success settings.",
  "العودة للموقع": "Return to the website",
  "إرسال الطلب لا يعني قبولًا أو التزامًا. سيشرح الفريق العرض والشروط قبل أي خطوة مالية.": "Submitting an application does not mean acceptance or a commitment. The team will explain the offer and terms before any financial step.",
  "احجز محادثة تعريفية — Northouse": "Book an introductory conversation — Northouse",
  "محادثة تعريفية": "Introductory conversation",
  "اختر وقتًا يناسبك": "Choose a time that works for you",
  "بعد مراجعة الطلب، استخدم رابط الحجز المعتمد لتحديد موعد مع الفريق ومناقشة مدى ملاءمة نموذج الشراكة.": "After reviewing your application, use the approved booking link to schedule a conversation with the team and discuss whether the partnership model is a good fit.",
  "رابط الحجز سيضاف بعد اعتماده": "The booking link will be added once approved",
  "لا يُطلب منك الدفع لحجز هذه المحادثة إلا إذا أوضح العرض النهائي ذلك صراحة.": "You won’t be asked to pay to book this conversation unless the final offer clearly says otherwise.",
  "راجع تفاصيل العرض والدفع بعد مناقشتها مع الفريق": "Review the offer and payment details after discussing them with the team",
  "تفاصيل العرض والدفع — Northouse": "Offer and payment details — Northouse",
  "تفاصيل العرض": "Offer details",
  "راجع الشروط قبل الدفع": "Review the terms before paying",
  "هذه الصفحة ستعرض رابط الدفع بعد اعتماد العرض النهائي. لا تُضف بيانات دفع قبل مراجعة السعر، نطاق الخدمة، مدة الالتزام، سياسة الإلغاء والاسترداد، والجهة المستفيدة.": "This page will show the payment link once the final offer is approved. Don’t enter payment details until you’ve reviewed the price, scope of service, commitment period, cancellation and refund policy, and recipient.",
  "رابط الدفع سيضاف بعد اعتماد العرض": "The payment link will be added once the offer is approved",
  "قيد الإعداد:": "In preparation:",
  "لم تُعتمد تفاصيل العرض أو السعر بعد، لذلك رابط الدفع غير مفعّل.": "The offer details and price have not been approved yet, so the payment link is not active.",
  "العودة إلى صفحة الحجز": "Return to the booking page",
  "العودة إلى الرئيسية": "Return to home",
  "سياسة الخصوصية — Northouse": "Privacy policy — Northouse",
  "معلومات الخصوصية": "Privacy information",
  "مسودة غير جاهزة للنشر.": "Draft—not ready to publish.",
  "أكمل بيانات الجهة المسؤولة ومعلومات التواصل وممارسات الاحتفاظ قبل تفعيل أي نموذج يجمع بيانات حقيقية.": "Complete the responsible entity’s details, contact information, and data retention practices before activating any form that collects real information.",
  "توضح هذه الصفحة كيف تُستخدم البيانات التي تُرسل من خلال التسجيل في الجلسة. يجب مراجعة النص واعتماده من الجهة المسؤولة عن جمع البيانات قبل الإطلاق.": "This page explains how information submitted through webinar registration is used. The responsible entity must review and approve this text before launch.",
  "ما البيانات التي قد تُجمع؟": "What information may be collected?",
  "قد يتضمن نموذج التسجيل الاسم والبريد الإلكتروني ورقم الهاتف وروابط الحسابات أو المجتمع، بحسب الحقول التي يعتمدها الفريق.": "Depending on the fields approved by the team, the registration form may ask for your name, email address, phone number, and links to your accounts or community.",
  "لماذا تُستخدم؟": "How is it used?",
  "لإدارة التسجيل، إرسال تفاصيل الحضور والتذكيرات، ومتابعة طلبات الشراكة المتعلقة بالجلسة. يجب ألا تُضاف أغراض أخرى إلى النموذج دون توضيحها واعتمادها.": "To manage registration, send attendance details and reminders, and follow up on partnership applications related to the webinar. Other purposes should not be added without being clearly disclosed and approved.",
  "من يعالج البيانات؟": "Who processes the information?",
  "يُستكمل هذا القسم باسم الجهة المسؤولة ومزودي الخدمة الذين سيعالجون البيانات، بما في ذلك منصة إدارة العملاء المستخدمة.": "Complete this section with the responsible entity and the service providers that will process information, including the customer management platform.",
  "التواصل وطلبات الخصوصية": "Contact and privacy requests",
  "للاستفسارات أو طلبات الخصوصية:": "For questions or privacy requests:",
  "[أضف بريد التواصل المعتمد]": "[Add the approved contact email]",
  "مدة الاحتفاظ والتحديثات": "Retention period and updates",
  "يجب تحديد مدة الاحتفاظ بالبيانات وطريقة طلب تصحيحها أو حذفها، ثم إضافة تاريخ اعتماد هذه السياسة.": "Specify how long information will be retained and how to request a correction or deletion, then add the date this policy is approved.",
  "الشروط والتنويه — Northouse": "Terms and disclaimer — Northouse",
  "معلومات الجلسة": "Webinar information",
  "مسودة تحتاج اعتمادًا قبل النشر.": "Draft—approval required before publishing.",
  "أضف الجهة المنظمة وشروط التسجيل والحضور وأي أحكام نهائية معتمدة.": "Add the organizer, registration and attendance terms, and any approved final provisions.",
  "طبيعة الجلسة": "Nature of the webinar",
  "الجلسة تعريفية بنموذج شراكة محتمل لصناع المحتوى والخبراء في مجال التداول. وهي ليست توصية استثمارية أو دعوة لشراء أو بيع أصل مالي أو وعدًا بعائد أو نتيجة محددة.": "This webinar introduces a potential partnership model for trading content creators and experts. It is not investment advice, an invitation to buy or sell a financial asset, or a promise of returns or specific results.",
  "الطلبات والعروض": "Applications and offers",
  "إرسال بيانات التسجيل أو طلب الشراكة لا يضمن القبول أو إبرام اتفاق. تُعرض الشروط النهائية وتفاصيل المقابل والالتزامات قبل أي قبول أو دفع.": "Submitting registration details or a partnership application does not guarantee acceptance or an agreement. Final terms, compensation details, and obligations will be presented before any acceptance or payment.",
  "البيانات والتواصل": "Information and communications",
  "يجب توضيح وسيلة التواصل المستخدمة لإرسال رابط الجلسة والتذكيرات، والحصول على الموافقات المطلوبة في نموذج التسجيل.": "The contact method used to send the webinar link and reminders must be disclosed, and any required consent must be obtained through the registration form.",
  "بيانات الجهة المنظمة": "Organizer details",
  "[أضف الاسم القانوني للجهة، ووسيلة التواصل، وتاريخ سريان الشروط قبل الإطلاق.]": "[Add the organization’s legal name, contact method, and the effective date of these terms before launch.]",
  "الفيديو التعريفي لجلسة Northouse": "Northouse webinar introduction video",
  "نموذج التسجيل في الجلسة": "Webinar registration form",
  "نموذج طلب الشراكة": "Partnership application form",
  "صفحات الموقع": "Site pages",
  "التنقل الرئيسي": "Main navigation",
  "Northouse — الرئيسية": "Northouse — Home",
    "جلسة تعريفية مباشرة لصناع المحتوى والخبراء في مجال التداول في السعودية. تعرّف على نموذج شراكة Northouse والخطوات التالية.": "A live introductory webinar for content creators and experts in trading in Saudi Arabia. Learn about Northouse’s partnership model and next steps.",
    "تعرّف على نموذج الشراكة والخطوة التالية المناسبة لخبرتك وجمهورك.": "Learn about the partnership model and the next step that fits your experience and audience.",
    "تصميم توضيحي لحركة السوق وخطوات بناء شراكة": "Illustration of market movement and partnership-building steps",
    "رسم توضيحي لحركة السوق": "Illustrative market chart",
    "اسأل مساعد الذكاء الاصطناعي": "Ask the AI assistant",
    "مساعد Northouse": "Northouse assistant",
    "إغلاق": "Close",
    "لم يتم ربط مساعد الذكاء الاصطناعي بعد.": "The AI assistant is not connected yet.",
    "اضغط بدء المحادثة لفتح المساعد.": "Select Start chat to open the assistant.",
    "ابدأ المحادثة": "Start chat",
    "إخفاء المساعد على الجانب": "Hide assistant to the side",
    "إظهار مساعد الذكاء الاصطناعي": "Show the AI assistant"
};
  const languageToggle = document.querySelector("[data-language-toggle]");
  const originalTextNodes = new WeakMap();
  const originalAttributes = new WeakMap();
  const originalDocumentTitle = document.title;
  let currentLanguage = "ar";
  const translateArabic = (value) => {
    const trimmed = value.trim();
    const translated = translations[trimmed];
    return translated ? value.replace(trimmed, translated) : value;
  };
  const applyLanguage = (language) => {
    currentLanguage = language === "en" ? "en" : "ar";
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "en" ? "ltr" : "rtl";
    document.title = currentLanguage === "en" ? translateArabic(originalDocumentTitle) : originalDocumentTitle;
    const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())) {
      if(!originalTextNodes.has(node)) originalTextNodes.set(node,node.nodeValue);
      const original=originalTextNodes.get(node);
      node.nodeValue=currentLanguage==="en"?translateArabic(original):original;
    }
    document.querySelectorAll("[aria-label], [title]").forEach((el)=>{
      let originals=originalAttributes.get(el);if(!originals){originals={};originalAttributes.set(el,originals);}
      ["aria-label","title"].forEach((a)=>{const v=el.getAttribute(a);if(v&&!Object.hasOwn(originals,a))originals[a]=v;if(originals[a])el.setAttribute(a,currentLanguage==="en"?translateArabic(originals[a]):originals[a]);});
    });
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach((el)=>{
      let originals=originalAttributes.get(el);if(!originals){originals={};originalAttributes.set(el,originals);}
      const v=el.getAttribute("content");if(v&&!Object.hasOwn(originals,"content"))originals.content=v;
      if(originals.content)el.setAttribute("content",currentLanguage==="en"?translateArabic(originals.content):originals.content);
    });
    if(config.eventStartISO){const d=new Date(config.eventStartISO);if(!Number.isNaN(d.getTime())){const date=new Intl.DateTimeFormat(currentLanguage==="en"?"en-SA":"ar-SA",{dateStyle:"full",timeStyle:"short",timeZone:config.timeZone||"Asia/Riyadh"}).format(d);document.querySelectorAll("[data-event-date]").forEach((el)=>el.textContent=date);}}
    if(languageToggle){languageToggle.textContent=currentLanguage==="en"?"AR":"EN";languageToggle.setAttribute("aria-label",currentLanguage==="en"?"Switch to Arabic":"Switch to English");}
    try{localStorage.setItem("northouse-language",currentLanguage);}catch{}
  };
  const aiChatWidget = document.querySelector(".ai-chat-widget");
  const aiChatToggle = document.querySelector("[data-ai-chat-toggle]");
  const aiChatPanel = document.querySelector("#ai-chat-panel");
  const aiChatClose = document.querySelector("[data-ai-chat-close]");
  const aiChatDock = document.querySelector("[data-ai-chat-dock]");
  const aiChatStatus = document.querySelector("[data-ai-chat-status]");
  const aiChatLink = document.querySelector("[data-ai-chat-link]");
  try {
    const assistantUrl = new URL(config.aiAssistantUrl || "");
    if (assistantUrl.protocol === "https:" && aiChatLink) {
      aiChatLink.href = assistantUrl.href;
      aiChatLink.hidden = false;
      if (aiChatStatus) aiChatStatus.textContent = "اضغط بدء المحادثة لفتح المساعد.";
    }
  } catch {}
  const closeAiChat = () => {
    if (aiChatPanel) aiChatPanel.hidden = true;
    if (aiChatToggle) aiChatToggle.setAttribute("aria-expanded", "false");
  };
  const setAiChatDocked = (docked) => {
    if (!aiChatWidget) return;
    aiChatWidget.classList.toggle("is-docked", docked);
    if (docked) closeAiChat();
    if (aiChatToggle) {
      if (docked) {
        aiChatToggle.setAttribute("aria-label", currentLanguage === "en" ? "Show the AI assistant" : "إظهار مساعد الذكاء الاصطناعي");
      } else {
        aiChatToggle.removeAttribute("aria-label");
      }
    }
    try { localStorage.setItem("northouse-ai-chat-docked", String(docked)); } catch {}
  };
  if (aiChatToggle && aiChatPanel) {
    aiChatToggle.addEventListener("click", () => {
      const docked = aiChatWidget?.classList.contains("is-docked");
      if (docked) {
        setAiChatDocked(false);
        aiChatPanel.hidden = false;
        aiChatToggle.setAttribute("aria-expanded", "true");
        return;
      }
      aiChatPanel.hidden = !aiChatPanel.hidden;
      aiChatToggle.setAttribute("aria-expanded", String(!aiChatPanel.hidden));
    });
    if (aiChatClose) aiChatClose.addEventListener("click", closeAiChat);
    if (aiChatDock) aiChatDock.addEventListener("click", () => setAiChatDocked(true));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAiChat(); });
  }
  let assistantDocked = false;
  try { assistantDocked = localStorage.getItem("northouse-ai-chat-docked") === "true"; } catch {}
  setAiChatDocked(assistantDocked);

  let savedLanguage="ar";try{savedLanguage=localStorage.getItem("northouse-language")||savedLanguage;}catch{}
  applyLanguage(savedLanguage);
  if(languageToggle)languageToggle.addEventListener("click",()=>applyLanguage(currentLanguage==="ar"?"en":"ar"));
})();
