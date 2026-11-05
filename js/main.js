(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");

  // Mobile menu
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
      if (e.matches) setMenu(false);
    });
  }

  // Header hairline once the page scrolls
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // "What's next" cues on snap pages: fade each one in once it's fully on
  // screen (its section has snapped into view), and out again as it leaves.
  // The sticky header's strip doesn't count as on screen, since it covers it.
  const cues = document.querySelectorAll(".next-cue");

  if (cues.length && "IntersectionObserver" in window) {
    const headerHeight = header ? header.offsetHeight : 0;
    const cueObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-away", entry.intersectionRatio < 0.99);
        });
      },
      { threshold: 1, rootMargin: `-${headerHeight}px 0px 0px 0px` }
    );
    cues.forEach((cue) => cueObserver.observe(cue));
  }

  // Forms: registration (register.html), questions for speakers (ask.html) and
  // feedback (feedback.html). All share the .register styles; the parent fields
  // are registration only.
  const form = document.querySelector(".register");

  if (form) {
    const button = form.querySelector("button[type=submit]");
    const status = form.querySelector(".register__status");
    const minorToggle = form.querySelector("[data-minor-toggle]");
    const parent = form.querySelector(".register__parent");
    const done = document.querySelector(".register__done");
    const closed = document.querySelector(".register__closed");

    // From the data-closes date (YYYY-MM-DD) on, show the "closed" notice instead
    if (form.dataset.closes && closed) {
      const [y, m, d] = form.dataset.closes.split("-").map(Number);
      if (new Date() >= new Date(y, m - 1, d)) {
        form.hidden = true;
        closed.hidden = false;
      }
    }

    function setStatus(message, isError) {
      status.textContent = message;
      status.classList.toggle("is-error", isError);
    }

    function markField(field) {
      field.setAttribute("aria-invalid", String(!field.checkValidity()));
    }

    // Parent fields only count (and only submit) when the attendee is under 18
    function setParent(open) {
      parent.hidden = !open;
      parent.querySelectorAll("input").forEach((input) => {
        input.disabled = !open;
        if (!open) input.removeAttribute("aria-invalid");
      });
    }

    if (minorToggle && parent) {
      setParent(minorToggle.checked);
      minorToggle.addEventListener("change", () => setParent(minorToggle.checked));
    }

    // Once a field has been flagged, clear the flag as soon as it's fixed
    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") markField(e.target);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fields = [...form.querySelectorAll("input, select, textarea")].filter(
        (field) => !field.disabled && field.name !== "company"
      );
      fields.forEach(markField);
      const invalid = fields.find((field) => !field.checkValidity());

      if (invalid) {
        setStatus("Please fill in the highlighted fields.", true);
        invalid.focus();
        return;
      }

      const data = new FormData(form);
      const payload = Object.fromEntries(data);
      if (form.elements.interests) payload.interests = data.getAll("interests");
      if (minorToggle) payload.is_minor = data.has("is_minor");

      const endpoint = form.dataset.endpoint;
      button.disabled = true;
      setStatus("Sending…", false);

      try {
        let emailed = false;
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apikey: form.dataset.key,
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            // The server's message (e.g. "already registered") is meant for people
            const body = await res.json().catch(() => ({}));
            throw Object.assign(new Error(res.statusText), { userMessage: body.error });
          }
          const body = await res.json().catch(() => ({}));
          emailed = body.emailed === true;
        }
        const doneEmail = done.querySelector("[data-done-email]");
        const doneEmailed = done.querySelector("[data-done-emailed]");
        if (doneEmail) doneEmail.textContent = payload.email;
        if (doneEmailed) doneEmailed.hidden = !emailed;
        form.hidden = true;
        done.hidden = false;
        done.focus();
      } catch (err) {
        setStatus(err.userMessage || "Something went wrong. Please try again.", true);
      } finally {
        button.disabled = false;
      }
    });
  }

  // Hero paths: move the gold route from career to career
  const routes = document.querySelectorAll(".paths__routes path");
  const careers = document.querySelectorAll(".paths__labels li");
  const nodes = document.querySelectorAll(".paths__nodes path");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (routes.length > 1) {
    let active = 0;

    setInterval(() => {
      if (reduceMotion.matches || document.hidden) return;
      active = (active + 1) % routes.length;
      routes.forEach((route, i) => route.classList.toggle("is-active", i === active));
      careers.forEach((career, i) => career.classList.toggle("is-active", i === active));
      nodes.forEach((node) => {
        node.classList.toggle("is-active", node.dataset.routes.split(" ").includes(String(active)));
      });
    }, 2000);
  }

  // Countdown to the conference, in whole days from local midnight.
  // An empty data-countdown hides it until the date is set.
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    if (!el.dataset.countdown) {
      el.hidden = true;
      return;
    }

    const [y, m, d] = el.dataset.countdown.split("-").map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((new Date(y, m - 1, d) - today) / 86400000);
    const num = el.querySelector("[data-countdown-days]");
    const label = el.querySelector("[data-countdown-label]");

    if (days > 0) {
      num.textContent = days;
      label.textContent = days === 1 ? "day to go" : "days to go";
    } else if (days === 0) {
      num.textContent = "Today";
      label.textContent = "See you there";
    } else {
      el.hidden = true;
    }
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
