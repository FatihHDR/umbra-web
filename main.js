document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll("[data-animate]");
  const parallaxSections = document.querySelectorAll("[data-parallax]");
  const buttons = document.querySelectorAll(".btn");
  const contactForm = document.getElementById("contact-form");
  const loadingBar = document.getElementById("loading-bar");
  const startConsultation = document.getElementById("start-consultation");
  const carouselTrack = document.querySelector(".carousel-track");
  const prevButton = document.querySelector(".carousel-nav.prev");
  const nextButton = document.querySelector(".carousel-nav.next");
  const scrollTriggers = document.querySelectorAll("[data-scroll]");
  const siteHeader = document.querySelector(".site-header");

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

  // Intersection observer for fade/scale animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  animatedElements.forEach((element) => observer.observe(element));

  // Parallax effect
  const handleParallax = () => {
    const scrollY = window.scrollY;
    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const offset = (rect.top + window.scrollY - scrollY) * 0.1;
      section.style.transform = `translateY(${offset}px)`;
      if (rect.top < window.innerHeight) {
        section.classList.add("parallax-on");
      }
    });
  };

  handleParallax();
  window.addEventListener("scroll", handleParallax, { passive: true });

  // Ripple effect for buttons
  const createRipple = (event) => {
    const button = event.currentTarget;
    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  buttons.forEach((button) => {
    button.addEventListener("click", createRipple);
  });

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

  // CTA scroll
  if (startConsultation) {
    startConsultation.addEventListener("click", () => {
      const target = document.getElementById("contact");
      target?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Simple carousel logic
  let activeIndex = 0;
  const testimonials = Array.from(carouselTrack?.children || []);
  const maxIndex = Math.max(0, testimonials.length - 1);

  const updateCarousel = () => {
    if (!carouselTrack) return;
    const slideWidth = testimonials[0]?.offsetWidth || 0;
    const gap = 24;
    const offset = -(slideWidth + gap) * activeIndex;
    carouselTrack.style.transform = `translateX(${offset}px)`;
  };

  if (prevButton && nextButton && testimonials.length) {
    prevButton.addEventListener("click", () => {
      activeIndex = activeIndex > 0 ? activeIndex - 1 : maxIndex;
      updateCarousel();
    });

    nextButton.addEventListener("click", () => {
      activeIndex = activeIndex < maxIndex ? activeIndex + 1 : 0;
      updateCarousel();
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  }

  // Form submit simulation with loading bar
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      console.info("Contact form submitted", payload);

      loadingBar.style.width = "0";
      loadingBar.classList.add("active");
      requestAnimationFrame(() => {
        loadingBar.style.transition = "width 300ms ease";
        loadingBar.style.width = "60%";
      });

      Array.from(contactForm.elements).forEach((element) => {
        element.disabled = true;
      });

      setTimeout(() => {
        loadingBar.style.width = "100%";
        setTimeout(() => {
          loadingBar.style.transition = "none";
          loadingBar.style.width = "0";
          loadingBar.classList.remove("active");
        }, 320);

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
      }, 1200);
    });
  }

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
    return `Here’s how Umbra would assist with “${trimmed}”: summarise key findings, cite live sources, and package next actions for your team.`;
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
    if (chatbotField) {
      chatbotField.value = "";
    }
  };

  chatbotOpeners.forEach((button) => {
    button.addEventListener("click", openChatbot);
  });

  chatbotClosers.forEach((target) => {
    target.addEventListener("click", closeChatbot);
  });

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

      setTimeout(() => {
        appendChatbotMessage("bot", generateAgentResponse(prompt));
      }, 600);
    });
  }

  const techCarousel = document.querySelector(".tech-carousel");
  const techTrack = techCarousel?.querySelector(".tech-track");

  if (techTrack) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const originalCards = Array.from(techTrack.children);

    if (originalCards.length && !prefersReducedMotion) {
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        techTrack.appendChild(clone);
      });

      const SPEED_PX_PER_SECOND = 120;

      const updateLoopMetrics = () => {
        const loopDistance = techTrack.scrollWidth / 2;
        if (!loopDistance || loopDistance <= 0) return;
        techTrack.style.setProperty("--tech-loop-distance", `${loopDistance}px`);
        const duration = Math.max(loopDistance / SPEED_PX_PER_SECOND, 18);
        techTrack.style.setProperty("--tech-duration", `${duration}s`);
      };

      const scheduleUpdate = () => requestAnimationFrame(updateLoopMetrics);
      scheduleUpdate();
      window.addEventListener("load", scheduleUpdate, { once: true });
      window.addEventListener("resize", scheduleUpdate);

      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(techTrack);
      }
    }
  }
});
