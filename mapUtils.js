import { normalizeCityName } from "./assetHelpers.js";

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
  const mapElement = placeMap(event.target);

  const lat = clickedLink.getAttribute("lat");
  const lng = clickedLink.getAttribute("lng");
  await showMap(lat, lng, mapElement);

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

async function showMap(lat, lng, mapElementOverride) {
  const mapElement = mapElementOverride || document.querySelector("gmp-map");
  if (mapElement) {
    mapElement.setAttribute("center", `${lat},${lng}`);
    mapElement.setAttribute("zoom", "17");
    await placeCustomMarker(lat, lng, mapElement);
  }
}

function placeMap(target) {
  const mapString = `<div class="map-wrapper"><div class="map-container"><gmp-map zoom="17" map-id="DEMO_MAP_ID"></gmp-map></div></div>`;
  const tr = target.closest("tr");
  if (tr) {
    const trMap = document.createElement("tr");
    const tdMap = document.createElement("td");

    trMap.classList.add("map-row");
    trMap.classList.add("open");
    tdMap.setAttribute("colspan", "6");
    tdMap.classList.add("map-cell");

    trMap.appendChild(tdMap);
    tdMap.innerHTML = mapString;
    tr.after(trMap);
    return tdMap.querySelector("gmp-map");
  }

  const mapDiv = document.createElement("div");
  mapDiv.classList.add("map-interface");
  mapDiv.innerHTML = mapString;
  target.nextElementSibling.append(mapDiv);
  return mapDiv.querySelector("gmp-map");
}

async function placeCustomMarker(lat, lng, mapElementOverride) {
  await ensureMapsReady();
  const mapElement = mapElementOverride || document.querySelector("gmp-map");

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

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      content: img,
    });

    // Maps JS click event on the AdvancedMarker
    marker.addListener("gmp-click", () => {
      console.log("AdvancedMarker click event fired");
    });

    marker.addListener("mouseover", () => {
      console.log("Marker hovered (mouseover)!");
    });

    marker.addListener("mouseout", () => {
      console.log("Mouse left marker!");
    });
  }
}

async function placePinMarker(lat, lng, mapElementOverride) {
  const pin = new PinElement({
    scale: 1,
    borderColor: "#ffffff",
    glyphText: String(asset.count),
    glyphColor: "#ffffff",
  });

  pin.classList.add("world-asset-pin");
}

async function placeDefaultMarker(lat, lng, count, mapElementOverride) {
  await ensureMapsReady();
  const mapElement = mapElementOverride || document.querySelector("gmp-map");

  if (!mapElement) return;
  const map = await getMapInstance(mapElement);
  if (!map) {
    console.warn("Map instance is not ready yet.");
    return;
  }

  const { AdvancedMarkerElement } = await getMarkerLibrary();

  new AdvancedMarkerElement({
    map,
    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
    label: String(count),
  });
}

async function placeWorldAssetMarkers(asset, mapElementOverride) {
  await ensureMapsReady();
  const mapElement = mapElementOverride || document.querySelector("gmp-map");

  if (!mapElement) return;
  const map = await getMapInstance(mapElement);
  if (!map) {
    console.warn("Map instance is not ready yet.");
    return;
  }

  const { AdvancedMarkerElement, PinElement } = await getMarkerLibrary();

  const countTag = document.createElement("div");
  countTag.textContent = asset.count;
  countTag.className = "world-asset-count";

  const marker = new AdvancedMarkerElement({
    map,
    position: {
      lat: parseFloat(asset.coords[0]),
      lng: parseFloat(asset.coords[1]),
    },
    title: `${asset.location}: ${asset.count} assets`,
  });

  marker.append(countTag);

  const attributes = {
    class: "world-asset-marker",
    id: `global-marker-${normalizeCityName(asset.location)}`,
  };
  Object.entries(attributes).forEach(([key, value]) => {
    marker.element.setAttribute(key, value);
  });

  marker.element.addEventListener("mouseenter", () => {
    const cityId = normalizeCityName(asset.location);
    const cityLink = document.getElementById(cityId);
    if (cityLink) {
      cityLink.classList.add("highlight");
      marker.element.classList.add("highlight");
    }
  });

  marker.element.addEventListener("mouseleave", () => {
    const cityId = normalizeCityName(asset.location);
    const cityLink = document.getElementById(cityId);
    if (cityLink) {
      cityLink.classList.remove("highlight");
      marker.element.classList.remove("highlight");
    }
  });

  console.log(marker);
}

async function showWorldMap() {
  const mapElement = document.querySelector("gmp-map");
  mapElement.classList.add("global");
  if (!mapElement) return;

  // Center at (0,0) and zoomed out to show the globe
  mapElement.setAttribute("center", "20,0");
  mapElement.setAttribute("zoom", "2.2");
}

window.placeCustomMarker = placeCustomMarker;
window.placeDefaultMarker = placeDefaultMarker;
window.showMap = showMap;
window.placeMap = placeMap;
window.processLocationClick = processLocationClick;
window.closeExistingMap = closeExistingMap;
window.showWorldMap = showWorldMap;
window.placeWorldAssetMarkers = placeWorldAssetMarkers;
