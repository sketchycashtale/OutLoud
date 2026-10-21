const track = document.querySelector("#cards-track");
const originalCards = track?.querySelector(".cards__set");

if (track && originalCards && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const repeatedCards = originalCards.cloneNode(true);
  repeatedCards.setAttribute("aria-hidden", "true");
  track.append(repeatedCards);
  track.classList.add("is-ready");
}

const cardsViewport = document.querySelector(".cards__viewport");

if (track && cardsViewport && window.matchMedia("(hover: hover)").matches) {
  const cards = track.querySelectorAll(".card");
  const trackIsMoving = track.classList.contains("is-ready");
  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;
  let frameId = 0;
  let hoveredCard = null;

  const updateHoveredCard = () => {
    frameId = 0;

    if (!pointerInside) return;

    const viewportBounds = cardsViewport.getBoundingClientRect();
    const pointerIsInCardRow =
      pointerX >= viewportBounds.left &&
      pointerX <= viewportBounds.right &&
      pointerY >= viewportBounds.top &&
      pointerY <= viewportBounds.bottom;

    const nextHoveredCard = pointerIsInCardRow
      ? [...cards].find((card) => {
          const bounds = card.getBoundingClientRect();
          return pointerX >= bounds.left && pointerX <= bounds.right;
        }) ?? null
      : null;

    if (hoveredCard !== nextHoveredCard) {
      hoveredCard?.classList.remove("is-hovered");
      nextHoveredCard?.classList.add("is-hovered");
      hoveredCard = nextHoveredCard;
    }

    if (trackIsMoving && pointerIsInCardRow) {
      frameId = requestAnimationFrame(updateHoveredCard);
    }
  };

  const trackPointer = (event) => {
    if (event.pointerType === "touch") return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerInside = true;

    if (trackIsMoving) {
      if (!frameId) frameId = requestAnimationFrame(updateHoveredCard);
    } else {
      updateHoveredCard();
    }
  };

  const clearHoveredCard = () => {
    pointerInside = false;
    cancelAnimationFrame(frameId);
    frameId = 0;
    hoveredCard?.classList.remove("is-hovered");
    hoveredCard = null;
  };

  cardsViewport.addEventListener("pointerenter", trackPointer);
  cardsViewport.addEventListener("pointermove", trackPointer);
  cardsViewport.addEventListener("pointerleave", clearHoveredCard);
}
