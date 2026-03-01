const screenState = {
  currentMarkers: [],
};

import {
  globalLocations,
  globalAssetCounts,
  cityLocations,
} from "./assetData.js";
import { normalizeCityName } from "./assetHelpers.js";
import { worldCenter } from "./constants.js";

let markerLibraryPromise = null;
let globalResizeTimer = null;

async function getUserLocation() {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location obtained:", position.coords);
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting user location:", error);
          resolve("39.8283,-98.5795"); // Geographic center of the contiguous US
        },
      );
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
    return "39.8283,-98.5795"; // Geographic center of the contiguous US
  }
}

async function defaultMapSetup() {
  const mapElement = document.querySelector("gmp-map");
  if (mapElement) {
    mapElement.setAttribute("center", await getUserLocation());
  }
}

async function setGlobalMap() {
  if (window.showWorldMap) {
    await window.showWorldMap();

    const mapElement = document.querySelector("gmp-map");
    if (!mapElement) return;

    if (window.placeWorldAssetMarkers) {
      await Promise.all(
        globalAssetCounts.map((asset) =>
          window.placeWorldAssetMarkers(asset, mapElement),
        ),
      );
    }

    await fitGlobalMarkersToViewport(mapElement);
  }
}

function getMapViewportPadding(mapElement) {
  const mapRect = mapElement.getBoundingClientRect();
  const width = mapRect.width || window.innerWidth;
  const height = mapRect.height || window.innerHeight;
  const padding = Math.max(6, Math.round(Math.min(width, height) * 0.1));
  // const padding = 0;

  return {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding,
  };
}

async function fitGlobalMarkersToViewport(mapElementOverride) {
  await ensureMapsReady();
  const mapElement = mapElementOverride || document.querySelector("gmp-map");
  if (!mapElement) return;

  const map = await getMapInstance(mapElement);
  if (!map) {
    console.warn("Map instance is not ready yet.");
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  globalAssetCounts.forEach((asset) => {
    const lat = parseFloat(asset?.coords?.[0]);
    const lng = parseFloat(asset?.coords?.[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      bounds.extend({ lat, lng });
    }
  });

  if (bounds.isEmpty()) {
    return;
  }

  map.fitBounds(bounds, getMapViewportPadding(mapElement));
}

function isGlobalMapActive() {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement) return false;
  return mapElement.classList.contains("global");
}

function handleGlobalMapResize() {
  if (!isGlobalMapActive()) return;

  if (globalResizeTimer) {
    clearTimeout(globalResizeTimer);
  }

  globalResizeTimer = setTimeout(() => {
    fitGlobalMarkersToViewport().catch((error) => {
      console.warn("Unable to fit global markers after resize:", error);
    });
  }, 100);
}

window.addEventListener("resize", handleGlobalMapResize);

function defaultCityMapSetup() {
  if (window.showCityMap) {
    window.showCityMap();
  }
}

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
  closeExistingMapInAssetTable();

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
    closeExistingMapInAssetTable();
  });
  x.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeExistingMapInAssetTable();
    }
  });
  return x;
}

function closeOtherMaps() {
  const openMaps = document.getElementsByTagName("gmp-map");
  Array.from(openMaps).forEach((map) => {
    map.remove();
  });
}

function closeExistingMapInAssetTable() {
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

async function placeDefaultMarker(lat, lng, label, mapElementOverride) {
  await ensureMapsReady();
  const mapElement = mapElementOverride || document.querySelector("gmp-map");

  if (!mapElement) return;
  const map = await getMapInstance(mapElement);
  if (!map) {
    console.warn("Map instance is not ready yet.");
    return;
  }

  const { AdvancedMarkerElement, PinElement } = await getMarkerLibrary();

  const pin = new PinElement({
    scale: 1,
    glyphText: String(label) || "",
    // background: "#4285f4",
    // borderColor: "#1a73e8",
    // glyphColor: "#ffffff",
    glyphColor: "black",
  });

  const marker = new AdvancedMarkerElement({
    map,
    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
    content: pin,
    title: String(label) || "",
  });
  screenState.currentMarkers.push(marker);
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
    class: "global-asset-marker",
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
}

async function showWorldMap() {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement) return;

  mapElement.classList.add("global");

  // Center at (0,0) and zoomed out to show the globe
  mapElement.setAttribute("center", worldCenter);
  mapElement.setAttribute("zoom", "2.2");
}

async function showCityMap() {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement) return;

  mapElement.classList.add("facilities");

  if (!mapElement) return;

  const defaultFacilityLocation = globalLocations[0];

  if (defaultFacilityLocation?.coords) {
    mapElement.setAttribute("center", defaultFacilityLocation.coords.join(","));
    mapElement.setAttribute("zoom", "10");
  }
}

async function populateCityMap(city) {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement) return;

  let location;
  if (city === "default") {
    location = globalLocations[0];

    // highlight the default city link and clear highlights from any other links
    highlightCityLink(location.city);
  } else {
    location = globalLocations.find(
      (loc) => normalizeCityName(loc.city) === normalizeCityName(city),
    );
  }

  const cityData = Object.keys(cityLocations).find(
    (city) => normalizeCityName(city) === normalizeCityName(location.city),
  );

  if (!cityData) return;

  const locList = cityLocations[cityData];

  if (locList.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    locList.forEach((loc) => {
      placeDefaultMarker(
        loc.coords[0],
        loc.coords[1],
        loc.neighborhood,
        mapElement,
      );
      bounds.extend(new google.maps.LatLng(loc.coords[0], loc.coords[1]));
    });
    mapElement.innerMap.fitBounds(bounds, {
      top: 120,
      right: 120,
      bottom: 120,
      left: 120,
    });
  } else {
    mapElement.setAttribute("center", location.coords.join(","));
    mapElement.setAttribute("zoom", "10");
  }
}

function highlightCityLink(city) {
  const defaultCityId = normalizeCityName(city);
  const defaultCityLink = document.querySelector(
    `#${defaultCityId}.facility-view-city-legend-item`,
  );
  if (defaultCityLink) {
    document
      .querySelectorAll(".facility-view-city-legend-item")
      .forEach((link) => {
        link.classList.remove("active", "highlight");
      });
    defaultCityLink.classList.add("active");
    defaultCityLink.classList.add("highlight");
  }
}

function zoomMapOut() {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement) return;
  mapElement.setAttribute("zoom", "10");
}

function removeMarkersFromMap() {
  const mapElement = document.querySelector("gmp-map");
  if (!mapElement || !mapElement.innerMap) return;
  const map = mapElement.innerMap;
  map.markers?.forEach((marker) => marker.setMap(null));
  map.markers = [];

  // advanced markers
  screenState.currentMarkers.forEach((marker) => marker.setMap(null));
  screenState.currentMarkers = [];
}

// --------------------------- EXPORTS to WINDOW --------------------------- //

const windowFunctions = {
  placeCustomMarker,
  placeDefaultMarker,

  showMap,
  placeMap,

  processLocationClick,
  closeExistingMapInAssetTable,

  showWorldMap,
  placeWorldAssetMarkers,

  setGlobalMap,
  defaultMapSetup,

  showCityMap,
  populateCityMap,

  defaultCityMapSetup,

  closeOtherMaps,

  zoomMapOut,
  removeMarkersFromMap,
};

Object.assign(window, windowFunctions);
