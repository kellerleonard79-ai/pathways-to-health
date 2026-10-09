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

  // Email signup
  const signup = document.querySelector(".signup");

  if (signup) {
    const input = signup.querySelector("input[type=email]");
    const button = signup.querySelector("button");
    const status = signup.querySelector(".signup__status");

    function setStatus(message, isError) {
      status.textContent = message;
      status.classList.toggle("is-error", isError);
      input.setAttribute("aria-invalid", String(isError));
    }

    signup.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!input.checkValidity()) {
        setStatus("Please enter a valid email address.", true);
        input.focus();
        return;
      }

      const endpoint = signup.dataset.endpoint;
      button.disabled = true;

      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(signup),
          });
          if (!res.ok) throw new Error(res.statusText);
        }
        setStatus("Thanks! We'll be in touch with updates.", false);
        signup.classList.add("is-done");
        input.value = "";
      } catch {
        setStatus("Something went wrong. Please try again.", true);
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
