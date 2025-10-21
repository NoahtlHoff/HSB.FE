document.addEventListener("DOMContentLoaded", () => {
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
});
