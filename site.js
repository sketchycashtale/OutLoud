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

const artifactDialog = document.querySelector(".artifact-dialog");

if (artifactDialog) {
  const dialogArt = artifactDialog.querySelector(".dialog-art");
  const dialogKind = artifactDialog.querySelector(".dialog-kind");
  const dialogTitle = artifactDialog.querySelector("#artifact-dialog-title");
  const dialogDetail = artifactDialog.querySelector(".dialog-detail");
  const dialogLink = artifactDialog.querySelector(".dialog-link");
  const closeArtifactDialog = () => {
    if (artifactDialog.open && !artifactDialog.classList.contains("is-closing")) {
      artifactDialog.classList.add("is-closing");
    }
  };

  document.querySelectorAll(".archive-artifact").forEach((artifact) => {
    artifact.addEventListener("click", () => {
      const visual = artifact.querySelector(".artifact-visual").cloneNode(true);
      const elements = [visual, ...visual.querySelectorAll("*")];
      const idMap = new Map();

      elements.forEach((element) => {
        if (!element.id) return;
        const newId = `${element.id}-expanded`;
        idMap.set(element.id, newId);
        element.id = newId;
      });

      elements.forEach((element) => {
        [...element.attributes].forEach((attribute) => {
          const value = attribute.value.replace(/url\(#([^)]+)\)/g, (reference, id) => {
            return `url(#${idMap.get(id) || id})`;
          });
          if (value !== attribute.value) element.setAttribute(attribute.name, value);
        });
      });

      dialogArt.replaceChildren(visual);
      dialogKind.textContent = artifact.dataset.kind;
      dialogTitle.textContent = artifact.dataset.title;
      dialogDetail.textContent = artifact.dataset.detail;
      dialogLink.href = artifact.dataset.link;
      if (artifact.dataset.kind.includes("Court of Inquiry")) {
        dialogLink.textContent = "Explore the operation ↗";
      } else if (artifact.dataset.link.includes("library.html")) {
        dialogLink.textContent = "Explore the Library ↗";
      } else {
        dialogLink.textContent = "Explore 5Klick ↗";
      }
      artifactDialog.showModal();
    });
  });

  artifactDialog.addEventListener("animationend", (event) => {
    if (event.target !== artifactDialog || event.animationName !== "archive-dialog-out") return;

    artifactDialog.classList.remove("is-closing");
    artifactDialog.close();
  });

  artifactDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeArtifactDialog();
  });

  artifactDialog.querySelector(".dialog-close").addEventListener("click", closeArtifactDialog);

  artifactDialog.addEventListener("click", (event) => {
    if (event.target === artifactDialog) closeArtifactDialog();
  });
}

const libraryTrack = document.querySelector(".library-track");

if (libraryTrack) {
  const originalLibraryCards = [...libraryTrack.querySelectorAll(".library-card")];
  const makeLoopCopies = (copyName) => {
    const fragment = document.createDocumentFragment();
    const cards = originalLibraryCards.map((card) => {
      const copy = card.cloneNode(true);
      copy.classList.remove("is-active");
      copy.setAttribute("aria-pressed", "false");
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("tabindex", "-1");
      copy.dataset.loopCopy = copyName;
      fragment.append(copy);
      return copy;
    });

    return { fragment, cards };
  };
  const beforeCopies = makeLoopCopies("before");
  const afterCopies = makeLoopCopies("after");
  libraryTrack.prepend(beforeCopies.fragment);
  libraryTrack.append(afterCopies.fragment);

  const libraryCards = [...libraryTrack.querySelectorAll(".library-card")];
  const featureCategory = document.querySelector("#library-feature-category");
  const featureTitle = document.querySelector("#library-feature-title");
  const featureDescription = document.querySelector("#library-feature-description");
  const readButton = document.querySelector("#library-read-button");
  const storyDialog = document.querySelector(".library-dialog");
  const dialogCategory = storyDialog.querySelector(".library-dialog-category");
  const dialogTitle = storyDialog.querySelector("#library-dialog-title");
  const dialogBody = storyDialog.querySelector(".library-dialog-body");
  const closeDialog = storyDialog.querySelector(".library-dialog-close");
  let scrollTimer;
  let resizeTimer;
  let arcFrame;
  let centerFrame;
  let loopStart = 0;
  let loopWidth = 0;

  const measureLoop = () => {
    const paddingLeft = Number.parseFloat(getComputedStyle(libraryTrack).paddingLeft) || 0;
    const layoutLeft = (card) => card.offsetLeft - libraryTrack.offsetLeft - libraryTrack.clientLeft;

    loopStart = layoutLeft(originalLibraryCards[0]) - paddingLeft;
    loopWidth = layoutLeft(afterCopies.cards[0]) - layoutLeft(originalLibraryCards[0]);
  };

  const setScrollPosition = (position) => {
    const scrollBehavior = libraryTrack.style.scrollBehavior;
    libraryTrack.style.scrollBehavior = "auto";
    libraryTrack.scrollLeft = position;
    libraryTrack.style.scrollBehavior = scrollBehavior;
  };

  const normalizeLoopPosition = () => {
    if (loopWidth <= 0) return;

    let position = libraryTrack.scrollLeft;
    if (position < loopStart) {
      position += Math.ceil((loopStart - position) / loopWidth) * loopWidth;
    } else if (position > loopStart + loopWidth) {
      position -= Math.ceil((position - loopStart - loopWidth) / loopWidth) * loopWidth;
    }

    if (position !== libraryTrack.scrollLeft) setScrollPosition(position);
  };

  const updateCardArc = () => {
    const radius = Math.max(libraryTrack.clientWidth * 0.35, 340);
    const maxAngle = 1.25;
    const trackCenter = libraryTrack.clientLeft + libraryTrack.clientWidth / 2;
    const cardPositions = libraryCards.map((card) => {
      const offset = card.offsetLeft - libraryTrack.offsetLeft + card.offsetWidth / 2 -
        trackCenter - libraryTrack.scrollLeft;
      const angle = Math.max(-maxAngle, Math.min(maxAngle, offset / radius));

      return { card, angle };
    });

    cardPositions.forEach(({ card, angle }) => {
      const distance = Math.abs(angle) / maxAngle;
      const rise = Math.pow(distance, 1.35) * 11;
      const horizontalScale = (1 + distance * 0.1) / Math.max(Math.cos(angle), 0.35);

      card.style.setProperty("--arc-y", `${-rise}px`);
      card.style.setProperty("--arc-z", `${-radius * Math.cos(angle)}px`);
      card.style.setProperty("--arc-rotate-y", `${-angle * (180 / Math.PI)}deg`);
      card.style.setProperty("--arc-rotate-z", `${-angle * 2.5}deg`);
      card.style.setProperty("--arc-scale-x", String(horizontalScale));
      card.style.setProperty("--arc-scale-y", String(1 + distance * 0.1));
      card.style.zIndex = String(Math.round(8 + distance * 4));
    });
  };

  const scheduleCardArc = () => {
    window.cancelAnimationFrame(arcFrame);
    arcFrame = window.requestAnimationFrame(updateCardArc);
  };

  const cancelAutoCenter = () => {
    window.clearTimeout(scrollTimer);
    window.cancelAnimationFrame(centerFrame);
    centerFrame = null;
  };

  const centerCard = (card) => {
    const trackBounds = libraryTrack.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const start = libraryTrack.scrollLeft;
    const target = start + cardBounds.left + cardBounds.width / 2 -
      trackBounds.left - libraryTrack.clientWidth / 2;
    const distance = target - start;
    const startTime = performance.now();
    const duration = 360;

    if (Math.abs(distance) < 1) return;

    const animate = (time) => {
      if (centerFrame === null) return;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 4 * progress ** 3
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      libraryTrack.scrollLeft = start + distance * eased;

      if (progress < 1) {
        centerFrame = window.requestAnimationFrame(animate);
      } else {
        centerFrame = null;
      }
    };

    centerFrame = window.requestAnimationFrame(animate);
  };

  const selectCard = (card, center = false) => {
    libraryCards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    featureCategory.textContent = card.dataset.category;
    featureTitle.textContent = card.dataset.title;
    featureDescription.textContent = card.dataset.description;
    scheduleCardArc();

    if (center) {
      centerCard(card);
    }
  };

  const selectCenteredCard = () => {
    const trackCenter = libraryTrack.getBoundingClientRect().left + libraryTrack.clientWidth / 2;
    const centeredCard = libraryCards.reduce((closest, card) => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - trackCenter);
      return !closest || distance < closest.distance ? { card, distance } : closest;
    }, null);

    if (centeredCard) selectCard(centeredCard.card, true);
  };

  libraryCards.forEach((card) => {
    card.addEventListener("click", () => selectCard(card, true));
  });

  libraryTrack.addEventListener("scroll", () => {
    normalizeLoopPosition();
    scheduleCardArc();
    window.clearTimeout(scrollTimer);
    if (centerFrame === null) {
      scrollTimer = window.setTimeout(selectCenteredCard, 150);
    }
  }, { passive: true });

  libraryTrack.addEventListener("wheel", (event) => {
    cancelAutoCenter();
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      libraryTrack.scrollLeft += event.deltaY;
    }
  }, { passive: false });

  libraryTrack.addEventListener("touchstart", cancelAutoCenter, { passive: true });
  libraryTrack.addEventListener("pointerdown", cancelAutoCenter);
  libraryTrack.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", " "].includes(event.key)) {
      cancelAutoCenter();
    }
  });

  window.addEventListener("resize", () => {
    cancelAutoCenter();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measureLoop();
      const selectedCard = libraryCards.find((card) => card.getAttribute("aria-pressed") === "true");
      if (selectedCard) selectCard(selectedCard, true);
    }, 120);
  });

  readButton.addEventListener("click", () => {
    const selectedCard = libraryCards.find((card) => card.getAttribute("aria-pressed") === "true");
    const storyTemplate = document.querySelector(`#story-${selectedCard.dataset.story}`);

    dialogCategory.textContent = selectedCard.dataset.category;
    dialogTitle.textContent = selectedCard.dataset.title;
    dialogBody.replaceChildren(storyTemplate.content.cloneNode(true));
    storyDialog.showModal();
  });

  closeDialog.addEventListener("click", () => storyDialog.close());
  storyDialog.addEventListener("click", (event) => {
    if (event.target === storyDialog) storyDialog.close();
  });

  measureLoop();
  setScrollPosition(loopStart);
  const initialCard = libraryCards.find((card) => card.getAttribute("aria-pressed") === "true");
  if (initialCard) selectCard(initialCard, true);
}

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
