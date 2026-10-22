const faqStage = document.querySelector("#faq-stage");

if (faqStage) {
  const faqCards = [...faqStage.querySelectorAll("[data-faq-card]")];
  let activeIndex = 0;

  const showFaq = (index) => {
    activeIndex = (index + faqCards.length) % faqCards.length;

    faqCards.forEach((card, cardIndex) => {
      const offset = (cardIndex - activeIndex + faqCards.length) % faqCards.length;
      const positions = [
        "is-active",
        "is-next",
        "is-far-next",
        "is-far-previous",
        "is-previous",
      ];
      const position = positions[offset];

      card.classList.remove(
        "is-active",
        "is-previous",
        "is-next",
        "is-far-previous",
        "is-far-next"
      );
      card.classList.add(position);
      const isActive = offset === 0;
      const isAdjacent = offset === 1 || offset === faqCards.length - 1;
      card.setAttribute("aria-hidden", String(!isActive && !isAdjacent));
      card.tabIndex = isAdjacent ? 0 : -1;
    });
  };

  faqCards.forEach((card, cardIndex) => {
    card.addEventListener("click", () => {
      if (cardIndex !== activeIndex) showFaq(cardIndex);
    });

    card.addEventListener("keydown", (event) => {
      if (cardIndex === activeIndex || (event.key !== "Enter" && event.key !== " ")) return;

      event.preventDefault();
      showFaq(cardIndex);
    });
  });

  showFaq(activeIndex);
}
