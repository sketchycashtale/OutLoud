const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) closeMenu();
  });
}

const storyCards = [...document.querySelectorAll(".story-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const storySearch = document.querySelector(".library-search");
const emptyResults = document.querySelector(".empty-results");
let activeFilter = "all";

const updateStories = () => {
  if (!storyCards.length) return;

  const searchTerm = storySearch.value.trim().toLowerCase();
  let visibleCount = 0;

  storyCards.forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !searchTerm || card.textContent.toLowerCase().includes(searchTerm);
    const isVisible = matchesFilter && matchesSearch;

    card.hidden = !isVisible;
    if (!isVisible) card.open = false;
    if (isVisible) visibleCount += 1;
  });

  emptyResults.hidden = visibleCount > 0;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });
    updateStories();
  });
});

storySearch?.addEventListener("input", updateStories);

const contactForm = document.querySelector(".contact-form");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const selectedFile = contactForm.querySelector('input[type="file"]').files[0];
  const body = [
    `Name: ${formData.get("name")}`,
    `Email: ${formData.get("email")}`,
    `Mobile: ${formData.get("phone") || "Not provided"}`,
    `Message: ${formData.get("message")}`,
    selectedFile ? `Letter to attach: ${selectedFile.name}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const subject = encodeURIComponent("A note for OutLoud");
  const encodedBody = encodeURIComponent(body);

  window.location.href = `mailto:?subject=${subject}&body=${encodedBody}`;
  document.querySelector(".form-status").textContent =
    "Your email app should open with this draft. Add OutLoud's email address and attach your selected letter before sending. This website does not send or store submissions.";
});
