const { narratives, timeline, regions, sources } = window.EXHIBIT_DATA;

document.documentElement.classList.add("js");

function renderTags(target, tags) {
  target.innerHTML = "";
  tags.forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = tag;
    target.appendChild(item);
  });
}

function setMetrics() {
  const mediaNarrativeCount = document.querySelectorAll("#media-left-list li").length || narratives.length;
  document.getElementById("metric-narratives").textContent = String(mediaNarrativeCount).padStart(2, "0");
  document.getElementById("metric-timeline").textContent = String(timeline.length).padStart(2, "0");
  document.getElementById("metric-regions").textContent = String(regions.length).padStart(2, "0");
}

function setupNarratives() {
  const list = document.getElementById("narrative-list");
  const title = document.getElementById("narrative-title");
  const headline = document.getElementById("narrative-headline");
  const response = document.getElementById("narrative-response");
  const why = document.getElementById("narrative-why");
  const tags = document.getElementById("narrative-tags");

  if (!list || !title || !headline || !response || !why || !tags) {
    return;
  }

  function update(selectedId) {
    const entry = narratives.find((item) => item.id === selectedId);
    title.textContent = entry.title;
    headline.textContent = entry.headline;
    response.textContent = entry.response;
    why.textContent = entry.why;
    renderTags(tags, entry.tags);

    list.querySelectorAll("button").forEach((button) => {
      const isActive = button.dataset.id === selectedId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  narratives.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "narrative-button";
    button.dataset.id = entry.id;
    button.innerHTML = `
      <span class="detail-card__label">Signal ${String(index + 1).padStart(2, "0")}</span>
      <span class="narrative-button__title">${entry.title}</span>
      <span class="narrative-button__text">${entry.headline}</span>
    `;
    button.addEventListener("click", () => update(entry.id));
    list.appendChild(button);
  });

  update(narratives[0].id);
}

function setupTimeline() {
  const list = document.getElementById("timeline-list");
  if (!list) {
    return;
  }

  timeline.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "detail-card panel panel--inset timeline-card";
    card.innerHTML = `
      <button type="button" class="timeline-card__toggle" aria-expanded="${index === 0 ? "true" : "false"}">
        <div class="timeline-card__meta">
          <span class="detail-card__label">Moment ${String(index + 1).padStart(2, "0")}</span>
          <span class="timeline-card__indicator">${index === 0 ? "Open" : "Expand"}</span>
        </div>
        <span class="timeline-card__year">${entry.year}</span>
        <span class="timeline-card__title">${entry.title}</span>
        <span class="timeline-card__preview">${entry.preview}</span>
      </button>
      <div class="timeline-card__body">
        ${entry.description.split("\n\n").map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
    `;

    if (index === 0) {
      card.classList.add("is-open");
    }

    const toggle = card.querySelector(".timeline-card__toggle");
    const indicator = card.querySelector(".timeline-card__indicator");
    toggle.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      indicator.textContent = isOpen ? "Open" : "Expand";
    });

    list.appendChild(card);
  });
}

function setupMap() {
  const surface = document.getElementById("map-surface");
  const title = document.getElementById("map-title");
  const region = document.getElementById("map-region");
  const preview = document.getElementById("map-preview");
  const description = document.getElementById("map-description");
  const deepView = document.getElementById("map-deepview-text");
  const tags = document.getElementById("map-tags");
  const deepViewDetails = document.getElementById("map-deepview");

  if (!surface || !window.L || !title || !region || !preview || !description || !deepView || !tags || !deepViewDetails) {
    return;
  }

  function update(selectedId, openPopup = false) {
    const entry = regions.find((item) => item.id === selectedId);
    title.textContent = entry.title;
    region.textContent = entry.region;
    preview.textContent = entry.preview;
    description.textContent = entry.description;
    deepView.textContent = entry.deepView;
    deepViewDetails.open = false;
    renderTags(tags, entry.tags);

    markers.forEach(({ marker, entry: markerEntry }) => {
      const isActive = markerEntry.id === selectedId;
      const element = marker.getElement();
      if (element) {
        element.classList.toggle("is-active", isActive);
      }

      if (isActive && openPopup) {
        marker.openPopup();
      }
    });
  }

  const map = L.map(surface, {
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: false
  });
  map.setView([24, 15], 2);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap &copy; CARTO"
  }).addTo(map);

  const markers = regions.map((entry) => {
    const icon = L.divIcon({
      className: "map-pin-wrapper",
      html: `<button class="map-pin" type="button" aria-label="${entry.title}"></button>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12]
    });

    const marker = L.marker([entry.lat, entry.lng], { icon }).addTo(map);
    marker.bindPopup(
      `
        <div class="map-popup">
          <p class="map-popup__region">${entry.region}</p>
          <h4 class="map-popup__title">${entry.title}</h4>
          <p class="map-popup__text">${entry.preview}</p>
          <details class="map-popup__details">
            <summary>Expand</summary>
            <p>${entry.deepView}</p>
          </details>
        </div>
      `,
      { className: "map-popup-shell", closeButton: false, offset: [0, -6] }
    );

    marker.on("click", () => update(entry.id));
    return { marker, entry };
  });

  update(regions[0].id, true);
}

function setupSources() {
  const list = document.getElementById("sources-list");
  sources.forEach((source, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${String(index + 1).padStart(2, "0")}</strong> ${source}`;
    list.appendChild(item);
  });
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function setupNavSpy() {
  const links = [...document.querySelectorAll(".topnav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", isActive);
      });
    });
  }, { rootMargin: "-35% 0px -45% 0px", threshold: 0.05 });

  sections.forEach((section) => observer.observe(section));
}

function setupCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow || window.matchMedia("(max-width: 720px)").matches) {
    return;
  }

  window.addEventListener("pointermove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

setMetrics();
setupNarratives();
setupTimeline();
setupMap();
setupSources();
setupReveal();
setupNavSpy();
setupCursorGlow();
