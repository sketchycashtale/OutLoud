const track = document.querySelector("#cards-track");
const originalCards = track?.querySelector(".cards__set");

if (track && originalCards && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const repeatedCards = originalCards.cloneNode(true);
  repeatedCards.setAttribute("aria-hidden", "true");
  repeatedCards.setAttribute("inert", "");
  track.append(repeatedCards);
  track.classList.add("is-ready");
}
