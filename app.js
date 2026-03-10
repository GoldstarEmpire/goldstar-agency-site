/* GoldStar AI Agency — App JS */
(function () {
  "use strict";

  /* ========================
     Theme Toggle
     ======================== */
  var currentTheme = "dark"; // Default to dark
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");

  function setTheme(theme) {
    currentTheme = theme;
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
      );
      toggle.innerHTML =
        theme === "dark"
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  // Initialize dark theme
  setTheme("dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  /* ========================
     Mobile Menu
     ======================== */
  var mobileBtn = document.getElementById("mobileMenuBtn");
  var nav = document.getElementById("nav");

  if (mobileBtn && nav) {
    mobileBtn.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      mobileBtn.classList.toggle("active");
      mobileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on nav link click
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        mobileBtn.classList.remove("active");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ========================
     Sticky Header
     ======================== */
  var header = document.getElementById("header");
  var lastScrollY = 0;
  var ticking = false;

  function updateHeader() {
    var scrollY = window.scrollY;

    if (scrollY > 100) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }

    // Hide on scroll down, show on scroll up
    if (scrollY > lastScrollY && scrollY > 300) {
      header.classList.add("header--hidden");
    } else {
      header.classList.remove("header--hidden");
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* ========================
     Scroll Reveal (IntersectionObserver)
     ======================== */
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // If reduced motion, make everything visible
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ========================
     Animated Counters
     ======================== */
  var counters = document.querySelectorAll("[data-count]");
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1500;
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(eased * target);
        el.textContent = prefix + current + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    });
  }

  // Observe the metrics section
  var metricsSection = document.getElementById("metrics");
  if (metricsSection) {
    var metricsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            metricsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    metricsObserver.observe(metricsSection);
  }

  /* ========================
     Contact Form Submission
     ======================== */
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var formSubmitBtn = document.getElementById("formSubmitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var company = document.getElementById("cf-company").value.trim();
      var service = document.getElementById("cf-service").value;
      var message = document.getElementById("cf-message").value.trim();

      if (!name || !email) {
        showStatus("Please fill in your name and email.", "error");
        return;
      }

      // Disable button
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = "Sending...";

      var payload = {
        name: name,
        email: email,
        company: company || "N/A",
        service: service || "Not specified",
        message: message || "No message provided",
        source: "website-contact-form",
        timestamp: new Date().toISOString()
      };

      // Send to both n8n webhook and API
      var webhookUrl = "https://n8n.goldstarcommand.com/webhook/contact";
      var apiUrl = "https://api.goldstarcommand.com/api/contact";

      Promise.all([
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(function () { return { ok: true }; }),
        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(function () { return { ok: true }; })
      ]).then(function () {
        showStatus("Thank you! We'll be in touch within 24 hours.", "success");
        contactForm.reset();
      }).catch(function () {
        showStatus("Something went wrong. Please email us directly at felix@goldstarempire.com", "error");
      }).finally(function () {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = 'Book Your Free AI Audit <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      });
    });
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = "form-status " + type;
    formStatus.style.display = "block";
    setTimeout(function () {
      formStatus.style.display = "none";
    }, 8000);
  }

  /* ========================
     Smooth Scroll for Anchor Links
     ======================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
