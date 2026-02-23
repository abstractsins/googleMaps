let markerLibraryPromise = null;

async function ensureMapsReady() {
  if (!window.google?.maps?.importLibrary) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
  await customElements.whenDefined("gmp-map");
}

async function getMarkerLibrary() {
  await ensureMapsReady();
  if (!markerLibraryPromise) {
    markerLibraryPromise = google.maps.importLibrary("marker");
  }
  return markerLibraryPromise;
}

async function getMapInstance(mapElement) {
  await ensureMapsReady();
  if (typeof mapElement.getMap === "function") {
    return mapElement.getMap();
  }
  if (mapElement.innerMap) {
    return mapElement.innerMap;
  }
  await new Promise((resolve) => {
    mapElement.addEventListener("gmp-map-ready", resolve, { once: true });
  });
  return mapElement.innerMap || null;
}

async function processLocationClick(event) {
  //* cache target
  const clickedLink = event.target.closest(".map-link");
  if (!clickedLink) {
    return;
  }

  //* close any existing map and remove active state from any other link
  closeExistingMap();

  //* place new map in a <tr>, and set active state on clicked link
  placeMap(event);

  const lat = clickedLink.getAttribute("lat");
  const lng = clickedLink.getAttribute("lng");
  await showMap(lat, lng);

  //* Style clicked link as active
  clickedLink.classList.add("active");

  //* Add close button if not already present
  const x = createCloseButton();
  clickedLink.before(x);
}

function createCloseButton() {
  const existingCloseBtn = document.querySelector(".map-close-btn");
  if (existingCloseBtn) {
    return; // Close button already exists, no need to add another
  }
  const x = document.createElement("i");
  x.classList.add("fa-solid", "fa-circle-xmark", "map-close-btn");
  x.setAttribute("tabindex", "0");
  x.setAttribute("role", "button");
  x.setAttribute("aria-label", "Close map");
  x.addEventListener("click", () => {
    closeExistingMap();
  });
  x.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeExistingMap();
    }
  });
  return x;
}

function closeExistingMap() {
  const existingMapRow = document.querySelector(".map-row.open");
  const activeLink = document.querySelector(".map-link.active");
  if (activeLink) {
    activeLink.classList.remove("active");
    if (
      activeLink.previousElementSibling &&
      activeLink.previousElementSibling.classList.contains("map-close-btn")
    ) {
      activeLink.previousElementSibling.remove();
    }
  }
  if (existingMapRow) {
    existingMapRow.classList.remove("open");
    existingMapRow.remove();
  }
}

async function showMap(lat, lng) {
  console.log(`Showing map centered at: ${lat}, ${lng}`);
  const mapElement = document.querySelector("gmp-map");
  if (mapElement) {
    mapElement.setAttribute("center", `${lat},${lng}`);
    mapElement.setAttribute("zoom", "17");
    await placeMarker(lat, lng);
  }
}

function placeMap(event) {
  const target = event.target;
  const tr = target.closest("tr");
  const trMap = document.createElement("tr");
  const tdMap = document.createElement("td");

  trMap.classList.add("map-row");
  trMap.classList.add("open");
  tdMap.setAttribute("colspan", "6");
  tdMap.classList.add("map-cell");

  trMap.appendChild(tdMap);
  tdMap.innerHTML = `<div class="map-wrapper"><div class="map-container"><gmp-map zoom="17" map-id="DEMO_MAP_ID"></gmp-map></div></div>`;
  tr.after(trMap);
}

async function placeMarker(lat, lng) {
  await ensureMapsReady();
  const mapElement = document.querySelector("gmp-map");

  if (mapElement) {
    const map = await getMapInstance(mapElement);
    if (!map) {
      console.warn("Map instance is not ready yet.");
      return;
    }

    const { AdvancedMarkerElement } = await getMarkerLibrary();

    const img = document.createElement("img");
    img.src = "public/images/exxon-tiger-logo-png-transparent.png";
    img.alt = "Asset";
    img.classList.add("marker-icon");

    const text = document.createElement("div");
    text.textContent = "Asset Location";
    text.classList.add("marker-text");

    new AdvancedMarkerElement({
      map,
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      content: text,
      content: img,
    });
  }
}

window.placeMarker = placeMarker;
window.showMap = showMap;
window.placeMap = placeMap;
window.processLocationClick = processLocationClick;
