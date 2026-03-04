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

const collectLocations = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectLocations(item));
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value.coords)) {
      return [value];
    }

    return Object.values(value).flatMap((item) => collectLocations(item));
  }

  return [];
};

export const getCityLocationsList = () => collectLocations(cityLocations);

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
  const allLocations = getCityLocationsList();

  if (!allLocations.length) {
    return { short: "Unknown", coords: [0, 0] };
  }

  const locationFull =
    allLocations[Math.floor(Math.random() * allLocations.length)];
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

const makeCityLegendItem = (loc, className) => {
  const li = document.createElement("li");
  const city = loc.city;
  li.textContent = `${city}`;
  li.id = removeDiacritics(city).toLowerCase().replace(/\s/g, "-");
  if (className) {
    li.classList.add(className);
  }
  return li;
};

export const populateGlobalCityList = (container) => {
  const parentClasses = container.parentElement.classList;
  let type;
  if (parentClasses.contains("global-map-legend")) {
    type = "global";
  } else if (parentClasses.contains("city-map-legend")) {
    type = "city";
  }

  globalLocations.forEach((loc) => {
    let className, idPrefix, markers, classPrefix;

    if (type === "global") {
      className = "global-view-city-legend-item";
      idPrefix = "global-marker";
      classPrefix = "global";
    } else if (type === "city") {
      className = "city-view-city-legend-item";
      idPrefix = "facility-marker";
      classPrefix = "facility";
    }

    markers = document.getElementsByClassName(`${classPrefix}-asset-marker`);

    const li = makeCityLegendItem(loc, className);
    container.appendChild(li);

    li.addEventListener("mouseover", () => {
      Array.from(markers).forEach((marker) => {
        marker.id === `${idPrefix}-${normalizeCityName(loc.city)}`
          ? marker.classList.add("highlight")
          : marker.classList.add("lowlight");
      });
    });

    li.addEventListener("mouseout", () => {
      Array.from(markers).forEach((marker) => {
        marker.id === `${idPrefix}-${normalizeCityName(loc.city)}`
          ? marker.classList.remove("highlight")
          : marker.classList.remove("lowlight");
      });
    });
  });
};

// export const populateFacilityCityList = (container) => {
//   console.log("populateFacilityCityList called");
//   globalLocations.forEach((loc) => {
//     let className;
//     if (container.parentElement.classList.contains("city-map-legend")) {
//       className = "city-view-city-legend-item";
//     }

//     const li = makeCityLegendItem(loc, className);
//     container.appendChild(li);
//     const markers = document.getElementsByClassName("facility-asset-marker");

//     li.addEventListener("mouseover", () => {
//       Array.from(markers).forEach((marker) => {
//         marker.id === `facility-marker-${normalizeCityName(loc.city)}`
//           ? marker.classList.add("highlight")
//           : marker.classList.add("lowlight");
//       });
//     });

//     li.addEventListener("mouseout", () => {
//       Array.from(markers).forEach((marker) => {
//         marker.id === `facility-marker-${normalizeCityName(loc.city)}`
//           ? marker.classList.remove("highlight")
//           : marker.classList.remove("lowlight");
//       });
//     });
//   });
// };

export const normalizeCityName = (name) =>
  removeDiacritics(name).toLowerCase().replace(/\s/g, "-");
