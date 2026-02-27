import { numOfAssetsToCreate } from "./constants.js";
import { tableHeadersSortingSetup, sortTable } from "./tableSorting.js";
import { assetTableBuilder } from "./tableBuilding.js";
import {
  populateInitialUIReferences,
  intialUIEventListenersSetup,
  findInitiallyActiveSection,
  populateCityListNavs,
  navMenuTrackingInit,
  addSpecificEventListeners,
  defaultToGlobalView,
} from "./uiHelpers.js";

//* ------------------------------ DOMContentLoaded ------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  populateInitialUIReferences();
  populateAllAssetsTable();
  // defaultMapSetup();
  intialUIEventListenersSetup();

  findInitiallyActiveSection();

  populateCityListNavs();

  // defaultToGlobalView();
  navMenuTrackingInit();

  addSpecificEventListeners();
});

function populateAllAssetsTable() {
  const tableRows = document.getElementById("generated-rows");
  tableRows.innerHTML = assetTableBuilder(numOfAssetsToCreate);
  tableHeadersSortingSetup();
  sortTable(0);
}
