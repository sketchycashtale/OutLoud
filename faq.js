const faqExperience = document.querySelector("[data-faq]");

if (faqExperience) {
  const template = faqExperience.querySelector("[data-faq-items]");
  const leftTabs = faqExperience.querySelector("[data-faq-left]");
  const rightTabs = faqExperience.querySelector("[data-faq-right]");
  const panel = faqExperience.querySelector(".faq-panel");
  const category = faqExperience.querySelector("[data-faq-category]");
  const number = faqExperience.querySelector("[data-faq-number]");
  const question = faqExperience.querySelector("[data-faq-question]");
  const answer = faqExperience.querySelector("[data-faq-answer]");
  const closeButton = faqExperience.querySelector("[data-faq-close]");
  const items = [...template.content.querySelectorAll(".faq-tab")];
  const initialIndex = 1;
  let activeIndex = initialIndex;

  const getTabRects = () => {
    return new Map(
      [...faqExperience.querySelectorAll(".faq-tab")].map((tab) => [
        Number(tab.dataset.faqIndex),
        tab.getBoundingClientRect(),
      ]),
    );
  };

  const setPanelNumber = (value) => {
    number.replaceChildren(
      ...[...String(value)].map((digit) => {
        const digitElement = document.createElement("span");
        digitElement.textContent = digit;
        return digitElement;
      }),
    );
  };

  const cancelTransitionAnimations = () => {
    faqExperience.querySelectorAll(".faq-tab, .faq-panel, .faq-panel-transition, .faq-panel > *").forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
    });
    faqExperience.querySelectorAll(".faq-panel-transition").forEach((element) => element.remove());
  };

  const animatePanelFrom = (origin) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const destination = panel.getBoundingClientRect();
    const offsetX = origin.left - destination.left;
    const offsetY = origin.top - destination.top;
    const scaleX = origin.width / destination.width;
    const scaleY = origin.height / destination.height;

    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.animate(
      [
        {
          transformOrigin: "top left",
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: "9px",
        },
        {
          transformOrigin: "top left",
          transform: "translate(0, 0) scale(1, 1)",
          borderRadius: "14px",
        },
      ],
      {
        duration: 620,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
      },
    );

    panel.querySelectorAll(".faq-panel-label, .faq-panel-number, .faq-panel-copy, .faq-close").forEach((element) => {
      element.animate(
        [{ opacity: 0.35 }, { opacity: 1 }],
        {
          duration: 300,
          delay: 140,
          easing: "ease-out",
        },
      );
    });
  };

  const animateSelection = (origin, previousPanel, previousPanelRect, previousIndex, previousTabRects, nextIndex) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    animatePanelFrom(origin);

    const newTabs = [...faqExperience.querySelectorAll(".faq-tab")];
    newTabs.forEach((tab) => {
      const index = Number(tab.dataset.faqIndex);
      if (index === previousIndex) return;

      const previousRect = previousTabRects.get(index);
      if (!previousRect) return;

      const nextRect = tab.getBoundingClientRect();
      const offsetX = previousRect.left - nextRect.left;
      const offsetY = previousRect.top - nextRect.top;
      const scaleX = previousRect.width / nextRect.width;
      const scaleY = previousRect.height / nextRect.height;

      tab.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
          },
          {
            transformOrigin: "top left",
            transform: "translate(0, 0) scale(1, 1)",
          },
        ],
        {
          duration: 620,
          easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        },
      );
    });

    if (previousPanel && previousIndex !== nextIndex) {
      const previousTab = faqExperience.querySelector(`[data-faq-index="${previousIndex}"]`);
      if (!previousTab) return;

      const destination = previousTab.getBoundingClientRect();
      const offsetX = destination.left - previousPanelRect.left;
      const offsetY = destination.top - previousPanelRect.top;
      const scaleX = destination.width / previousPanelRect.width;
      const scaleY = destination.height / previousPanelRect.height;
      const previousPanelNumber = previousPanel.querySelector(".faq-panel-number");
      const previousDigits = [...previousPanelNumber.querySelectorAll("span")];
      const targetNumber = previousTab.querySelector(".faq-tab-number");
      const targetNumberStyle = getComputedStyle(targetNumber);
      const previousPanelNumberStyle = getComputedStyle(previousPanelNumber);

      previousTab.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 220, delay: 400, easing: "linear", fill: "backwards" },
      );

      previousPanelNumber.animate(
        [
          {
            left: previousPanelNumberStyle.left,
            bottom: previousPanelNumberStyle.bottom,
            fontSize: previousPanelNumberStyle.fontSize,
            lineHeight: previousPanelNumberStyle.lineHeight,
            letterSpacing: previousPanelNumberStyle.letterSpacing,
            transform: "none",
          },
          {
            left: "50%",
            bottom: targetNumberStyle.bottom,
            fontSize: `${parseFloat(targetNumberStyle.fontSize) / scaleY}px`,
            lineHeight: `${parseFloat(targetNumberStyle.lineHeight) / scaleY}px`,
            letterSpacing: targetNumberStyle.letterSpacing,
            transform: "translateX(-50%)",
          },
        ],
        {
          duration: 620,
          easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        },
      );

      if (previousDigits.length > 1 && previousDigits[0].textContent === "0") {
        const leadingZero = previousDigits[0];
        leadingZero.animate(
          [
            {
              width: `${leadingZero.getBoundingClientRect().width}px`,
              opacity: 1,
              transform: "scaleX(1)",
              transformOrigin: "left center",
            },
            {
              width: "0px",
              opacity: 0,
              transform: "scaleX(0)",
              transformOrigin: "left center",
            },
          ],
          {
            duration: 260,
            delay: 120,
            easing: "ease-in",
            fill: "forwards",
          },
        );
        previousDigits[previousDigits.length - 1].animate(
          [
            { transform: "scaleX(1)" },
            { transform: `scaleX(${1 / scaleX})` },
          ],
          {
            duration: 620,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
        );
      }

      previousPanel.removeAttribute("id");
      previousPanel.setAttribute("aria-hidden", "true");
      previousPanel.querySelectorAll("button").forEach((button) => button.remove());
      Object.assign(previousPanel.style, {
        position: "fixed",
        top: `${previousPanelRect.top}px`,
        left: `${previousPanelRect.left}px`,
        width: `${previousPanelRect.width}px`,
        height: `${previousPanelRect.height}px`,
        margin: "0",
        zIndex: "20",
        pointerEvents: "none",
      });
      faqExperience.append(previousPanel);

      const animation = previousPanel.animate(
        [
          {
            transformOrigin: "top left",
            transform: "translate(0, 0) scale(1, 1)",
            borderRadius: "14px",
          },
          {
            transformOrigin: "top left",
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
            borderRadius: "9px",
            backgroundColor: "#292d2b",
          },
        ],
        {
          duration: 620,
          easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        },
      );
      previousPanel.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 220, delay: 400, easing: "linear" },
      );
      previousPanel.classList.add("faq-panel-transition");
      animation.onfinish = () => previousPanel.remove();
    }
  };

  const createTab = (item) => {
    const tab = item.cloneNode(true);
    tab.addEventListener("click", () => {
      cancelTransitionAnimations();
      const origin = tab.getBoundingClientRect();
      const previousIndex = activeIndex;
      const previousPanel = previousIndex === null ? null : panel.cloneNode(true);
      const previousPanelRect = panel.getBoundingClientRect();
      const previousTabRects = getTabRects();
      const nextIndex = Number(tab.dataset.faqIndex);

      render(nextIndex);
      animateSelection(origin, previousPanel, previousPanelRect, previousIndex, previousTabRects, nextIndex);
      question.focus();
    });
    return tab;
  };

  const render = (selectedIndex) => {
    activeIndex = selectedIndex;
    leftTabs.replaceChildren();
    rightTabs.replaceChildren();
    const leftItems = [];
    const rightItems = [];

    items.forEach((item, index) => {
      if (index === selectedIndex) return;
      if (selectedIndex === null ? index < Math.ceil(items.length / 2) : index < selectedIndex) {
        leftItems.push(item);
      } else {
        rightItems.push(item);
      }
    });

    leftItems.forEach((item) => leftTabs.append(createTab(item)));
    rightItems.forEach((item) => rightTabs.append(createTab(item)));
    leftTabs.style.setProperty("--faq-tab-count", String(Math.max(leftItems.length, 1)));
    rightTabs.style.setProperty("--faq-tab-count", String(Math.max(rightItems.length, 1)));

    if (selectedIndex === null) {
      panel.classList.add("faq-panel--empty");
      category.textContent = "OUTLOUD / FREQUENTLY ASKED";
      setPanelNumber("?");
      question.textContent = "Choose a question";
      answer.textContent = "Select a topic from the numbered tabs to read an answer.";
      closeButton.hidden = true;
      return;
    }

    const activeItem = items[selectedIndex];
    panel.classList.remove("faq-panel--empty");
    category.textContent = activeItem.dataset.faqCategory;
    setPanelNumber(String(selectedIndex + 1).padStart(2, "0"));
    question.textContent = activeItem.dataset.faqQuestion;
    answer.textContent = activeItem.dataset.faqAnswer;
    closeButton.hidden = false;
  };

  closeButton.addEventListener("click", () => {
    render(null);
  });

  render(initialIndex);
}
