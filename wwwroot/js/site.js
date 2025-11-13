document.addEventListener("DOMContentLoaded", () => {
  highlightNavigation();
  enableLiveValidation();
  initMobileNavigation();
});

function highlightNavigation() {
  const links = document.querySelectorAll(".primary-nav .nav-link");
  const currentPath = window.location.pathname.toLowerCase();

  links.forEach((link) => {
    const target = link.pathname.toLowerCase();
    if (target === "/") {
      if (currentPath === "/") {
        link.classList.add("active");
      }
    } else if (currentPath.startsWith(target)) {
      link.classList.add("active");
    }
  });
}

function enableLiveValidation() {
  const forms = document.querySelectorAll("form[data-live-validate]");
  if (!forms.length) {
    return;
  }

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("[data-field-input]");
    inputs.forEach((input) => {
      const fieldGroup = input.closest(".form-group");
      const statusBadge = fieldGroup?.querySelector("[data-field-status]");
      const statusLabel = statusBadge?.querySelector(".status-text");
      let hasInteracted = false;

      const setIdleState = () => {
        input.classList.remove("is-valid", "is-invalid");
        if (statusBadge) {
          statusBadge.dataset.state = "idle";
        }
        if (statusLabel) {
          statusLabel.textContent = "";
        }
      };

      const updateState = () => {
        if (!hasInteracted) {
          return;
        }

        const isValid = input.checkValidity();
        input.classList.toggle("is-valid", isValid);
        input.classList.toggle("is-invalid", !isValid);

        if (statusBadge) {
          statusBadge.dataset.state = isValid ? "valid" : "invalid";
        }

        if (statusLabel) {
          statusLabel.textContent = isValid ? "Looks good" : "Not valid yet";
        }
      };

      setIdleState();

      const handleInteraction = () => {
        if (!hasInteracted) {
          hasInteracted = true;
        }
        updateState();
      };

      input.addEventListener("input", handleInteraction);
      input.addEventListener("blur", handleInteraction);
    });
  });
}

function initMobileNavigation() {
  const nav = document.getElementById("primaryNav");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!nav || !toggle) {
    return;
  }

  const closeNav = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("is-open", !isExpanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        closeNav();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) {
      return;
    }

    if (nav.contains(event.target) || toggle.contains(event.target)) {
      return;
    }
    closeNav();
  });
}
