document.addEventListener("DOMContentLoaded", () => {
  highlightNavigation();
  enableLiveValidation();
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
