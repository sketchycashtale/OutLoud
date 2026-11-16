const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const soldier = document.querySelector(".soldier");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  navigation?.classList.toggle("is-open", !isExpanded);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  });
});

if (soldier && window.matchMedia("(min-width: 768px)").matches && !reducedMotion.matches) {
  const handlePointerMove = (event) => {
    const horizontal = (event.clientX / window.innerWidth - 0.5) * 20;
    const vertical = (event.clientY / window.innerHeight - 0.5) * 20;
    soldier.style.setProperty("--parallax-x", `${horizontal}px`);
    soldier.style.setProperty("--parallax-y", `${vertical}px`);
  };

  const resetParallax = () => {
    soldier.style.setProperty("--parallax-x", "0px");
    soldier.style.setProperty("--parallax-y", "0px");
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", resetParallax);
}
