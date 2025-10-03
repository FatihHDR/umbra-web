document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll("[data-animate]");
  const parallaxSections = document.querySelectorAll("[data-parallax]");
  const contentSections = document.querySelectorAll("[data-content]");
  const buttons = document.querySelectorAll(".btn");
  const contactForm = document.getElementById("contact-form");
  const loadingBar = document.getElementById("loading-bar");
  const startConsultation = document.getElementById("start-consultation");
  const scrollTriggers = document.querySelectorAll("[data-scroll]");
  const siteHeader = document.querySelector(".site-header");
  const hudElements = {
    time: document.querySelector("[data-hud-time]"),
    offset: document.querySelector("[data-hud-offset]"),
    throughputBar: document.querySelector("[data-hud-throughput]"),
    throughputValue: document.querySelector("[data-hud-throughput-value]"),
    latency: document.querySelector("[data-hud-latency]"),
    sync: document.querySelector("[data-hud-sync]"),
    sessions: document.querySelector("[data-hud-sessions]"),
    threads: document.querySelector("[data-hud-threads]"),
  };

  // Layout helpers
  const updateHeaderOffset = () => {
    if (!siteHeader) return;
    const { height } = siteHeader.getBoundingClientRect();
    document.documentElement.style.setProperty("--header-height", `${height}px`);
  };

  updateHeaderOffset();
  window.addEventListener("resize", updateHeaderOffset);
  if ("ResizeObserver" in window && siteHeader) {
    const headerResizeObserver = new ResizeObserver(updateHeaderOffset);
    headerResizeObserver.observe(siteHeader);
  }

  // Animate on view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((element) => observer.observe(element));

  // Parallax motion + lazy content signal
  const handleParallax = () => {
    const scrollY = window.scrollY;
    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const offset = (rect.top + window.scrollY - scrollY) * 0.08;
      section.style.transform = `translateY(${offset}px)`;
      if (rect.top < window.innerHeight * 0.9) {
        section.classList.add("parallax-on");
      }
    });
  };

  handleParallax();
  window.addEventListener("scroll", handleParallax, { passive: true });

  // Button ripple accent
  const createRipple = (event) => {
    const button = event.currentTarget;
    const prior = button.querySelector(".ripple");
    if (prior) prior.remove();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };
  buttons.forEach((button) => button.addEventListener("click", createRipple));

  // Scroll triggers
  scrollTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      const selector = trigger.getAttribute("data-scroll");
      if (!selector) return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  if (startConsultation) {
    startConsultation.addEventListener("click", () => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Loading bar + contact form simulation
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      console.info("Contact form submitted", payload);

      if (loadingBar) {
        loadingBar.style.width = "0";
        loadingBar.classList.add("active");
        requestAnimationFrame(() => {
          loadingBar.style.transition = "width 320ms ease";
          loadingBar.style.width = "62%";
        });
      }

      Array.from(contactForm.elements).forEach((element) => {
        element.disabled = true;
      });

      setTimeout(() => {
        if (loadingBar) {
          loadingBar.style.width = "100%";
          setTimeout(() => {
            loadingBar.style.transition = "none";
            loadingBar.style.width = "0";
            loadingBar.classList.remove("active");
          }, 320);
        }

        contactForm.reset();
        Array.from(contactForm.elements).forEach((element) => {
          element.disabled = false;
        });
        contactForm.dispatchEvent(
          new CustomEvent("umbra:formSuccess", {
            bubbles: true,
            detail: payload,
          })
        );
      }, 1280);
    });
  }

  // Chatbot interactions
  const chatbotModal = document.getElementById("chatbot-modal");
  const chatbotForm = document.getElementById("chatbot-form");
  const chatbotField = document.getElementById("chatbot-field");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotOpeners = document.querySelectorAll("[data-chatbot-open]");
  const chatbotClosers = document.querySelectorAll("[data-chatbot-close]");

  const appendChatbotMessage = (role, text) => {
    if (!chatbotMessages) return;
    const message = document.createElement("div");
    message.className = `chatbot-message ${role}`;

    const sender = document.createElement("span");
    sender.className = "sender";
    sender.textContent = role === "bot" ? "Umbra Agent" : "You";

    const copy = document.createElement("p");
    copy.textContent = text;

    message.append(sender, copy);
    chatbotMessages.append(message);
    chatbotMessages.scrollTo({ top: chatbotMessages.scrollHeight, behavior: "smooth" });
  };

  const generateAgentResponse = (prompt) => {
    const trimmed = prompt.slice(0, 160);
    return `Here’s how Umbra would assist with “${trimmed}”: summarise findings, cite live sources, and package next actions for your team.`;
  };

  const openChatbot = () => {
    if (!chatbotModal) return;
    chatbotModal.classList.add("open");
    chatbotModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      chatbotField?.focus();
      chatbotMessages?.scrollTo({ top: chatbotMessages.scrollHeight });
    });
  };

  const closeChatbot = () => {
    if (!chatbotModal) return;
    chatbotModal.classList.remove("open");
    chatbotModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (chatbotField) chatbotField.value = "";
  };

  chatbotOpeners.forEach((button) => button.addEventListener("click", openChatbot));
  chatbotClosers.forEach((closeTarget) => closeTarget.addEventListener("click", closeChatbot));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chatbotModal?.classList.contains("open")) {
      closeChatbot();
    }
  });

  if (chatbotForm && chatbotField) {
    chatbotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const prompt = chatbotField.value.trim();
      if (!prompt) return;
      appendChatbotMessage("user", prompt);
      chatbotField.value = "";
      setTimeout(() => appendChatbotMessage("bot", generateAgentResponse(prompt)), 620);
    });
  }

  const setupHud = () => {
    if (!hudElements.time || !hudElements.offset) return;
    const statuses = ["mission lock", "edge POP sync", "telemetry aligned", "ops live"];
    const threads = ["RAG", "Guardrail", "Telemetry", "Compliance", "Insights", "Policy" ];
    const syncStart = Date.now();
    const perfStart = performance.now();
    let statusIndex = 0;

    const rotateThreads = () => {
      if (!hudElements.threads) return;
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 3; i += 1) {
        const label = threads[(statusIndex + i) % threads.length];
        const chip = document.createElement("span");
        chip.className = "hud-chip";
        chip.textContent = label;
        fragment.appendChild(chip);
      }
      hudElements.threads.innerHTML = "";
      hudElements.threads.appendChild(fragment);
    };

    const updateHud = () => {
      const now = Date.now();
      const offset = Math.round(now - syncStart - (performance.now() - perfStart));
      hudElements.time.textContent = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      hudElements.offset.textContent = `${offset >= 0 ? "+" : "-"}${Math.abs(offset)} ms offset`;

      const throughput = 360 + Math.sin(now / 680) * 140;
      if (hudElements.throughputValue) {
        hudElements.throughputValue.textContent = Math.max(throughput, 0).toFixed(0);
      }
      if (hudElements.throughputBar) {
        const width = Math.max(16, Math.min(100, (throughput / 520) * 100));
        hudElements.throughputBar.style.width = `${width}%`;
      }

      if (hudElements.latency) {
        const latency = 40 + Math.cos(now / 520) * 6;
        hudElements.latency.textContent = `${latency.toFixed(1)} ms`;
      }

      if (hudElements.sessions) {
        const sessions = 184 + Math.round(24 + Math.sin(now / 1200) * 18);
        hudElements.sessions.textContent = sessions.toLocaleString();
      }

      if (hudElements.sync) {
        hudElements.sync.textContent = statuses[statusIndex % statuses.length];
      }

      statusIndex += 1;
      rotateThreads();
    };

    updateHud();
    rotateThreads();
    setInterval(updateHud, 1400);
  };

  setupHud();

  // Deferred content loader
  const defaultContent = {
    technology: [
      {
        tag: "Orchestrator",
        title: "FastAPI Control Plane",
        description: "Coordinates prompts, guardrails, and routing across every Umbra session with deterministic fallbacks.",
        points: [
          "Policy middleware enforces per-tenant governance in under 38 ms.",
          "Blue/green rollouts maintained 99.99% uptime during nine pilot launches.",
        ],
        metrics: [
          { label: "Latency", value: "<52 ms" },
          { label: "Rollouts", value: "x128 pods" },
        ],
        tooltip: "Umbra's central brain dispatching every agent task.",
        icon: "orchestrator",
      },
      {
        tag: "Retrieval Core",
        title: "Hybrid Vector Search",
        description: "Dense embeddings pair with policy filters to surface vetted evidence for every answer.",
        points: [
          "Nova Labs recorded 97.6% recall across 6M documents in production.",
          "Adaptive windows prevent hallucinations even on 48k token transcripts.",
        ],
        metrics: [
          { label: "Recall", value: "97.6%" },
          { label: "Context", value: "48k tokens" },
        ],
        tooltip: "Surfaces the right evidence for every answer.",
        icon: "retrieval",
      },
      {
        tag: "Realtime IO",
        title: "SSE Delivery Gateway",
        description: "Streams interim answers, citations, and agent actions as they are produced.",
        points: [
          "Median p95 latency held at 74 ms during launch week spikes.",
          "Edge POP fan-out kept 25k+ concurrent conversations in sync.",
        ],
        metrics: [
          { label: "Uptime", value: "99.98%" },
          { label: "Fan-out", value: "25k streams" },
        ],
        tooltip: "Ensures teams see Umbra's reasoning live.",
        icon: "realtime",
      },
      {
        tag: "Trust Layer",
        title: "Umbra Shield Policies",
        description: "Compliance, redaction, and human-in-the-loop review fire automatically when signals demand.",
        points: [
          "Meridian Health blocked 100% of PII slips across 42k conversations.",
          "Escalation hooks notified SMEs within a 1.4 s SLA.",
        ],
        metrics: [
          { label: "Coverage", value: "11 locales" },
          { label: "Alerts", value: "<1.4 s" },
        ],
        tooltip: "Keeps guidance compliant without slowing teams down.",
        icon: "trust",
      },
      {
        tag: "Observability",
        title: "Telemetry Mesh",
        description: "Live traces and metrics show how each agent decision unfolded end-to-end.",
        points: [
          "3B structured signals/day feed Umbra Mission Control dashboards.",
          "Drift monitors surfaced anomalies 28 minutes before operators did.",
        ],
        metrics: [
          { label: "Signals", value: "3B / day" },
          { label: "Retention", value: "35 days" },
        ],
        tooltip: "Streams telemetry into a unified operational dashboard.",
        icon: "observability",
      },
      {
        tag: "Human Loop",
        title: "Operator Console",
        description: "Supervisors review, approve, or escalate responses in real-time with full audit context.",
        points: [
          "Role-based controls synced with existing SSO providers in under two hours.",
          "Hand-off packets preserved 100% of citation trails across shifts.",
        ],
        metrics: [
          { label: "Escalations", value: "<90 s" },
          { label: "Coverage", value: "24 / 7" },
        ],
        tooltip: "Keeps humans in the loop for high-sensitivity workflows.",
        icon: "humanloop",
      },
    ],
    testimonials: [
      {
        lane: "top",
        company: "Nova Labs",
        role: "Head of Intelligence",
        metric: "62% faster escalations",
        accent: "#ff3b30",
        quote:
          "“Umbra trimmed diligence sprints from 17 hours to 6.5. Our ops teams receive live, cited guidance before leadership even convenes.”",
      },
      {
        lane: "top",
        company: "Orbis AI",
        role: "Delivery Director",
        metric: "4.2x faster briefs",
        accent: "#c91d1d",
        quote:
          "“Citation locking means every AI-assisted answer ships with the source of truth. We reduced rework hours by eighty percent.”",
      },
      {
        lane: "top",
        company: "Lumen Partners",
        role: "Operations Executive",
        metric: "38% fewer follow-ups",
        accent: "#ff5345",
        quote:
          "“With Umbra memory we recap decisions instantly. Time-zone handoffs dropped from five emails to a single cited packet.”",
      },
      {
        lane: "bottom",
        company: "Polaris Ventures",
        role: "Portfolio Operating Partner",
        metric: "3.4 days saved",
        accent: "#a31818",
        quote:
          "“The agent pre-screens thousands of pages so diligence meetings start with answers. Our average deal cycle shrank by three days.”",
      },
      {
        lane: "bottom",
        company: "Meridian Health",
        role: "Chief Clinical Officer",
        metric: "99.2% audit pass",
        accent: "#ff3b30",
        quote:
          "“Compliance-ready answers with live citations meant every care protocol update cleared regulators on the first submission.”",
      },
      {
        lane: "bottom",
        company: "Atlas Robotics",
        role: "Global Support Lead",
        metric: "47% fewer truck rolls",
        accent: "#8d1010",
        quote:
          "“Field engineers receive Umbra telemetry playbooks in under 75 ms. We avoid nearly half of our on-site dispatches now.”",
      },
    ],
  };

  const contentState = {
    data: null,
    promise: null,
    rendered: {},
  };

  const cloneDefault = () => JSON.parse(JSON.stringify(defaultContent));

  const resolveWithDefault = () => {
    if (!contentState.data) {
      contentState.data = cloneDefault();
    }
    return contentState.data;
  };

  const fetchContent = () => {
    if (contentState.promise) return contentState.promise;

    if (window.location.protocol === "file:") {
      contentState.promise = Promise.resolve(resolveWithDefault());
      return contentState.promise;
    }

    contentState.promise = fetch("content.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load content.json (${response.status})`);
        return response.json();
      })
      .then((json) => {
        contentState.data = { ...cloneDefault(), ...json };
        return contentState.data;
      })
      .catch((error) => {
        console.error(error);
        return resolveWithDefault();
      });
    return contentState.promise;
  };

  const iconTemplates = {
    orchestrator: '<path d="M10 28h44M18 18h28M18 38h28" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.82"/>',
    retrieval: '<circle cx="24" cy="24" r="10" fill="currentColor" opacity="0.28"/><circle cx="40" cy="40" r="12" stroke="currentColor" stroke-width="3" fill="none" opacity="0.86"/><path d="M30 30l8 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    realtime: '<rect x="14" y="20" width="36" height="16" rx="8" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8"/><path d="M20 16h24" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.8"/><path d="M20 44h24" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>',
    trust: '<path d="M32 14l18 10v12c0 11-9 18-18 26-9-8-18-15-18-26V24z" fill="currentColor" opacity="0.3"/><path d="M32 14l18 10v12c0 11-9 18-18 26" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    observability: '<circle cx="20" cy="32" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.72"/><circle cx="42" cy="26" r="8" fill="currentColor" opacity="0.32"/><path d="M28 30l8-6 10 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    humanloop: '<rect x="16" y="18" width="32" height="20" rx="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.7"/><path d="M12 38c4-6 12-6 20-2s16 2 20-4" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6"/>',
    default: '<path d="M16 48L32 16l16 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="16" r="6" fill="currentColor" opacity="0.4"/>'
  };

  const createTechIcon = (type) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 64");
    svg.setAttribute("role", "presentation");
    svg.innerHTML = iconTemplates[type] || iconTemplates.default;
    return svg;
  };

  const initTechMarquee = () => {
    const techTrack = document.getElementById("tech-track");
    if (!techTrack || techTrack.dataset.marqueeInitialized === "true") return;
    const items = Array.from(techTrack.children);
    if (!items.length) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      techTrack.style.removeProperty("--tech-loop-distance");
      techTrack.style.removeProperty("--tech-duration");
      techTrack.style.animation = "none";
      return;
    }

    items.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      techTrack.appendChild(clone);
    });

    techTrack.dataset.marqueeInitialized = "true";
    const SPEED_PX_PER_SECOND = 118;
    const updateLoopMetrics = () => {
      const loopDistance = techTrack.scrollWidth / 2;
      if (!loopDistance) return;
      techTrack.style.setProperty("--tech-loop-distance", `${loopDistance}px`);
      const duration = Math.max(loopDistance / SPEED_PX_PER_SECOND, 16);
      techTrack.style.setProperty("--tech-duration", `${duration}s`);
    };

    const scheduleUpdate = () => requestAnimationFrame(updateLoopMetrics);
    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate, { once: true });
    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(techTrack);
    }
  };

  const initHeroPointsCarousel = () => {
    const track = document.querySelector(".hero-points");
    if (!track) return;
    const baseItems = Array.from(track.children);
    if (baseItems.length < 2) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 720px)");
    const SPEED_PX_PER_SECOND = 72;
    let resizeObserver;

    const updateLoop = () => {
      if (track.dataset.marqueeInitialized !== "true") return;
      const loopDistance = track.scrollWidth / 2;
      if (!loopDistance) return;
      track.style.setProperty("--hero-points-loop", `${loopDistance}px`);
      const duration = Math.max(loopDistance / SPEED_PX_PER_SECOND, 18);
      track.style.setProperty("--hero-points-duration", `${duration}s`);
    };

    const scheduleUpdate = () => requestAnimationFrame(updateLoop);

    const teardownMarquee = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (track.dataset.marqueeInitialized === "true") {
        Array.from(track.querySelectorAll("[aria-hidden=\"true\"]")).forEach((clone) => clone.remove());
        track.removeAttribute("data-marquee-initialized");
      }
      track.style.removeProperty("animation");
      track.style.removeProperty("--hero-points-loop");
      track.style.removeProperty("--hero-points-duration");
    };

    const setupMarquee = () => {
      if (track.dataset.marqueeInitialized === "true") {
        scheduleUpdate();
        return;
      }
      track.style.removeProperty("animation");
      baseItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
      track.dataset.marqueeInitialized = "true";
      scheduleUpdate();
      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(track);
      }
    };

    const applyMode = () => {
      if (motionQuery.matches || mobileQuery.matches) {
        teardownMarquee();
        return;
      }
      setupMarquee();
    };

    applyMode();
    window.addEventListener("resize", applyMode);
    window.addEventListener("load", scheduleUpdate, { once: true });
    const registerMediaListener = (query) => {
      if (!query) return;
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", applyMode);
      } else if (typeof query.addListener === "function") {
        query.addListener(applyMode);
      }
    };
    registerMediaListener(motionQuery);
    registerMediaListener(mobileQuery);
  };

  const populateTechnology = (items = []) => {
    const techTrack = document.getElementById("tech-track");
    const fallback = document.getElementById("tech-fallback");
    if (!techTrack) return;
    techTrack.innerHTML = "";

    if (!items.length) {
      techTrack.innerHTML = '<p class="tech-empty">Pipeline telemetry will appear once pilots stream data.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "tech-card";

      const header = document.createElement("div");
      header.className = "tech-header";

      const iconWrapper = document.createElement("div");
      iconWrapper.className = "icon";
      iconWrapper.appendChild(createTechIcon(item.icon));

      const tag = document.createElement("span");
      tag.className = "tech-tag";
      tag.textContent = item.tag;

      header.append(iconWrapper, tag);

      const title = document.createElement("h3");
      title.textContent = item.title;

      const description = document.createElement("p");
      description.textContent = item.description;

      const list = document.createElement("ul");
      list.className = "tech-points";
      item.points.forEach((point) => {
        const li = document.createElement("li");
        li.textContent = point;
        list.appendChild(li);
      });

      const meta = document.createElement("div");
      meta.className = "tech-meta";
      item.metrics.forEach((metric) => {
        const span = document.createElement("span");
        span.innerHTML = `${metric.label} <strong>${metric.value}</strong>`;
        meta.appendChild(span);
      });

      if (item.tooltip) {
        const tooltip = document.createElement("span");
        tooltip.className = "tooltip";
        tooltip.textContent = item.tooltip;
        card.append(header, title, description, list, meta, tooltip);
      } else {
        card.append(header, title, description, list, meta);
      }

      fragment.appendChild(card);
    });

    techTrack.appendChild(fragment);
    fallback?.setAttribute("hidden", "true");
    initTechMarquee();
  };

  const initTestimonialsMarquee = () => {
    const tracks = document.querySelectorAll(".testimonials-track");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tracks.forEach((track) => {
      if (track.dataset.marqueeInitialized === "true") return;
      const testimonials = Array.from(track.children);
      if (!testimonials.length) return;
      if (prefersReducedMotion) {
        track.style.animation = "none";
        track.style.removeProperty("--testimonials-loop-distance");
        track.style.removeProperty("--testimonials-duration");
        track.style.transform = "translateX(0)";
        return;
      }

      testimonials.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      track.dataset.marqueeInitialized = "true";
      const speedOverride = Number(track.dataset.speed);
      const SPEED_PX_PER_SECOND = Number.isFinite(speedOverride) && speedOverride > 0 ? speedOverride : 90;
      const updateLoop = () => {
        const loopDistance = track.scrollWidth / 2;
        if (!loopDistance) return;
        track.style.setProperty("--testimonials-loop-distance", `${loopDistance}px`);
        const duration = Math.max(loopDistance / SPEED_PX_PER_SECOND, 18);
        track.style.setProperty("--testimonials-duration", `${duration}s`);
      };
      const schedule = () => requestAnimationFrame(updateLoop);
      schedule();
      window.addEventListener("resize", schedule);
      window.addEventListener("load", schedule, { once: true });
      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(schedule);
        observer.observe(track);
      }
    });
  };

  const populateTestimonials = (items = []) => {
    const lanes = {
      top: document.querySelector('[data-testimonial-lane="top"]'),
      bottom: document.querySelector('[data-testimonial-lane="bottom"]'),
    };

    Object.values(lanes).forEach((lane) => {
      if (lane) lane.innerHTML = "";
    });

    if (!items.length) {
      if (lanes.top) {
        const empty = document.createElement("p");
        empty.className = "testimonial-empty";
        empty.textContent = "Testimonials will rotate here once teams publish new case studies.";
        lanes.top.appendChild(empty);
      }
      return;
    }

    items.forEach((item) => {
      const lane = lanes[item.lane === "bottom" ? "bottom" : "top"];
      if (!lane) return;
      const card = document.createElement("article");
      card.className = "testimonial-card";

      const author = document.createElement("div");
      author.className = "testimonial-author";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      if (item.accent) {
        avatar.style.setProperty("--avatar-accent", item.accent);
      }

      const meta = document.createElement("div");
      meta.className = "author-meta";

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = item.company;

      const role = document.createElement("span");
      role.className = "role";
      role.textContent = item.role;

      meta.append(name, role);

      if (item.metric) {
        const metric = document.createElement("span");
        metric.className = "metric";
        metric.textContent = item.metric;
        meta.appendChild(metric);
      }

      author.append(avatar, meta);

      const quoteBlock = document.createElement("blockquote");
      const quote = document.createElement("p");
      quote.textContent = item.quote;
      quoteBlock.appendChild(quote);

      card.append(author, quoteBlock);
      lane.appendChild(card);
    });

    initTestimonialsMarquee();
  };

  initHeroPointsCarousel();

  if (contentSections.length) {
    const contentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const key = entry.target.dataset.content;
          if (!key || contentState.rendered[key]) return;
          fetchContent().then((data) => {
            if (!data) return;
            if (key === "technology") {
              populateTechnology(data.technology || []);
            }
            if (key === "testimonials") {
              populateTestimonials(data.testimonials || []);
            }
            contentState.rendered[key] = true;
          });
        });
      },
      { threshold: 0.35 }
    );

    contentSections.forEach((section) => contentObserver.observe(section));
  }
});
