import {
  assetTypes,
  globalLocations,
  cityLocations,
  statuses,
} from "./assetData.js";
import {
  serialNumberSectionsRange,
  serialNumberSuffixRange,
  chanceOfNever,
} from "./constants.js";

const randomLetter = () =>
  String.fromCharCode(65 + Math.floor(Math.random() * 26));

const randomInRange = (range) =>
  Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

const removeDiacritics = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const randomSerial = () => {
  const firstThreeLetters = Array(3)
    .fill(null)
    .map(() => randomLetter())
    .join("");

  const serial =
    firstThreeLetters +
    randomInRange(serialNumberSectionsRange) +
    randomLetter() +
    randomInRange(serialNumberSectionsRange) +
    "-" +
    randomInRange(serialNumberSuffixRange);

  return serial;
};

export const randomAssetTypeAndDesc = () => {
  return assetTypes[Math.floor(Math.random() * assetTypes.length)];
};

export const randomLocation = () => {
  const locationFull =
    cityLocations[Math.floor(Math.random() * cityLocations.length)];
  const locationShort = `${locationFull.neighborhood}, ${locationFull.city}`;
  const locationCoords = locationFull.coords;
  return { short: locationShort, coords: locationCoords };
};

export const randomStatus = () =>
  statuses[Math.floor(Math.random() * statuses.length)];

export const randomLastSeen = () => {
  if (Math.random() < chanceOfNever) {
    return "Never";
  }

  // Random date and time within last 90 days
  const now = new Date();
  const daysAgo = Math.random() * 90;
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} ${timeStr}`;
};

export const populateCityList = (container) => {
  globalLocations.forEach((loc) => {
    const li = document.createElement("li");
    const city = loc.city;
    li.textContent = `${city}`;
    li.id = removeDiacritics(city).toLowerCase().replace(/\s/g, "-");
    li.classList.add("global-view-city-legend-item");
    container.appendChild(li);
    const markers = document.getElementsByClassName("world-asset-marker");

    li.addEventListener("mouseover", () => {
      Array.from(markers).forEach((marker) => {
        marker.id === `global-marker-${normalizeCityName(city)}`
          ? marker.classList.add("highlight")
          : marker.classList.add("lowlight");
      });
    });

    li.addEventListener("mouseout", () => {
      Array.from(markers).forEach((marker) => {
        marker.id === `global-marker-${normalizeCityName(city)}`
          ? marker.classList.remove("highlight")
          : marker.classList.remove("lowlight");
      });
    });
  });
};

export const normalizeCityName = (name) =>
  removeDiacritics(name).toLowerCase().replace(/\s/g, "-");
