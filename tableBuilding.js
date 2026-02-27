import {
  randomAssetTypeAndDesc,
  randomLastSeen,
  randomLocation,
  randomSerial,
  randomStatus,
} from "./assetHelpers.js";

export const assetTableBuilder = (nAssets) => {
  let text = "";
  for (let i = 0; i < nAssets; i++) {
    const serial = randomSerial();
    const { type, description } = randomAssetTypeAndDesc();
    const loc = randomLocation();
    const status = randomStatus();
    const lastSeen = randomLastSeen();

    const locSpanAttributes = {
      tabindex: 0,
      role: "button",
      "aria-label": "Location",
      lat: loc.coords[0],
      lng: loc.coords[1],
      onkeydown: "if(event.key==='Enter'){processLocationClick(event)}",
      onclick: "processLocationClick(event)",
      class: "map-link",
    };

    const locSpanAttributesString = Object.entries(locSpanAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    text += `<tr>
      <td class="asset-serial">${serial}</td>
      <td class="asset-type">${type}</td>
      <td class="asset-description">${description}</td>
      <td class="location-cell">
        <span ${locSpanAttributesString}>
            <i class="fa-solid fa-map-location-dot"></i> ${loc.short}
        </span>
      </td>
      <td class="asset-status">${status}</td>
      <td class="asset-last-seen">${lastSeen}</td>
    </tr>`;
  }
  return text;
};
