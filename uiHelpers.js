import {
  populateGlobalCityList,
  populateFacilityCityList,
} from "./assetHelpers.js";

const ui = {};

function updateChevronIcon(header, isActive) {
  const icon = header.querySelector("i.fa-solid");
  if (!icon) return;
  icon.classList.toggle("fa-chevron-down", !isActive);
  icon.classList.toggle("fa-chevron-up", isActive);
}

function setActiveSection(target, { scroll = true } = {}) {
  let targetHeader = null;

  // Allow callers to pass either a numeric index (for nav/side-nav)
  // or a DOM element / event target (for direct header clicks).
  if (typeof target === "number") {
    if (!ui.mainTableHeaders || !ui.mainTableHeaders[target]) {
      console.warn("Invalid section index passed to setActiveSection:", target);
      return;
    }
    targetHeader = ui.mainTableHeaders[target];
  } else if (target && typeof target.closest === "function") {
    // Typical path: event.target from a click/keydown handler
    targetHeader = target.closest(".table-header");
  } else if (
    target &&
    target.classList &&
    target.classList.contains("table-header")
  ) {
    // In case a header element itself is passed
    targetHeader = target;
  }

  if (!targetHeader) {
    console.warn("Clicked element is not within a table header:", target);
    return;
  }

  ui.mainTableHeaders.forEach((header) => {
    if (header === targetHeader) {
      header.classList.add("active");
      updateChevronIcon(header, true);
    } else {
      header.classList.remove("active");
      updateChevronIcon(header, false);
    }
  });

  const sideNavItems = ui.sideNavList.querySelectorAll("li");

  [ui.topNavItems, sideNavItems].forEach((item) => {
    item.forEach((subItem) => {
      matchNavIds(subItem, targetHeader.parentElement);
    });
  });

  if (scroll) {
    // Wait until layout updates (active classes, content visibility)
    // before measuring and scrolling, so the section lands correctly.
    requestAnimationFrame(() => {
      targetHeader.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}

function matchNavIds(item, compare) {
  const tableId = item.id + "-table";
  const headerTableId = compare.id;
  if (tableId === headerTableId) {
    item.classList.add("active");
  } else {
    item.classList.remove("active");
  }
}

function facilityTableHeaderSetup() {
  const byFacilityTableHeader = document.querySelector(
    "#by-facility-table .table-header",
  );
  const byFacilityNavOption = document.querySelector(
    "ul#top-level li#by-facility",
  );
  const byFacilitySideNavOption = document.querySelector(
    "nav.side-nav ul#side-nav-list li#by-facility",
  );

  const handleFacilityHeaderClick = () => {
    window.closeOtherMaps();
    window.placeMap(byFacilityTableHeader);
    window.populateCityMap("default");
    window.showCityMap();
  };

  [byFacilityTableHeader, byFacilityNavOption, byFacilitySideNavOption].forEach(
    (el) => {
      el.addEventListener("click", handleFacilityHeaderClick);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleFacilityHeaderClick();
        }
      });
    },
  );

  const facilityCitiesList = document.querySelectorAll(
    "div.facility-map-legend ul.cities-list li",
  );
  if (!facilityCitiesList) return;

  facilityCitiesList.forEach((li) => {
    li.addEventListener("click", (event) => {
      handleFacilityNavClick(event.currentTarget);
    });
    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleFacilityNavClick(event.currentTarget);
      }
    });
  });

  function styleNavOptions(li, list) {
    list.forEach((item) => {
      if (item === li) {
        item.classList.add("active", "highlight");
      } else {
        item.classList.remove("active", "highlight");
      }
    });
  }

  function updateMapForCity(li) {
    const cityName = li.id;
    // window.zoomMapOut();
    window.removeMarkersFromMap();
    window.populateCityMap(cityName);
  }

  function handleFacilityNavClick(li) {
    styleNavOptions(li, facilityCitiesList);
    updateMapForCity(li);
  }
}

function globalViewTableHeaderSetup() {
  const globalViewHeader = document.querySelector(
    "div#global-view-table > div.table-header",
  );

  const globalViewNavOption = document.querySelector(
    "ul#top-level li#global-view",
  );

  const globalSideNavOption = document.querySelector(
    "nav.side-nav ul#side-nav-list li#global-view",
  );

  const handleGlobalViewHeaderClick = () => {
    window.closeOtherMaps();
    window.placeMap(globalViewHeader);
    window.setGlobalMap();
  };

  [globalViewHeader, globalViewNavOption, globalSideNavOption].forEach((el) => {
    el.addEventListener("click", handleGlobalViewHeaderClick);
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleGlobalViewHeaderClick();
      }
    });
  });
}

export function defaultToGlobalView() {
  const globalViewHeader = document.querySelector(
    "div#global-view-table > div.table-header",
  );
  if (globalViewHeader && !globalViewHeader.classList.contains("active")) {
    globalViewHeader.click();
    if (window.placeMap) {
      window.placeMap(globalViewHeader);
    }
    window.setGlobalMap();
  }
}

export function populateInitialUIReferences() {
  ui.mainTableHeaders = document.querySelectorAll(".table-header");
  ui.topNavItems = document.querySelectorAll("#top-level li");
  ui.sideNavList = document.getElementById("side-nav-list");
}

export function intialUIEventListenersSetup() {
  ui.mainTableHeaders.forEach((header, index) => {
    const handleToggle = (event) => {
      const isActive = header.classList.contains("active");
      if (isActive) {
        header.classList.remove("active");
        updateChevronIcon(header, false);
        if (ui.topNavItems[index]) {
          ui.topNavItems[index].classList.remove("active");
        }
      } else {
        setActiveSection(event.target, { scroll: true });
      }
      window.closeExistingMapInAssetTable();
    };

    header.addEventListener("click", handleToggle);
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggle(event);
      }
    });
  });

  ui.topNavItems.forEach((navItem) => {
    const headerEl = document
      .getElementById(navItem.id + "-table")
      ?.querySelector(".table-header");
    const activateSection = (event) => {
      setActiveSection(headerEl, { scroll: true });
    };

    navItem.addEventListener("click", activateSection);
    navItem.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateSection(event);
      }
    });
  });

  const handleSideNavActivate = (event) => {
    const clickedItem = event.target.closest("li");
    if (!clickedItem) return;
    const { sectionIndex } = clickedItem.dataset;

    if (sectionIndex !== undefined) {
      const index = parseInt(sectionIndex, 10);
      if (!Number.isNaN(index)) {
        setActiveSection(index, { scroll: true });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  ui.sideNavList.addEventListener("click", handleSideNavActivate);
  ui.sideNavList.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSideNavActivate(e);
    }
  });
}

export function findInitiallyActiveSection() {
  const initiallyActiveIndex = Array.from(ui.topNavItems).findIndex((item) =>
    item.classList.contains("active"),
  );

  if (initiallyActiveIndex >= 0) {
    setActiveSection(initiallyActiveIndex, { scroll: false });
  }
}

//! need to differentiate between global and facility city lists to apply correct styles and map interactions - can check parent container class to determine which list it is and apply appropriate class to list items for styling, as well as hover interactions for map markers
export function populateCityListNavs() {
  const citiesList = document.getElementsByClassName("cities-list");
  Array.from(citiesList).forEach(populateGlobalCityList);
}

export function navMenuTrackingInit() {
  const navList = document.querySelector("ul#top-level");
  if (!navList) return;

  const updateNavPosition = () => {
    const rect = navList.getBoundingClientRect();

    const viewportY = rect.top;
    const sideNav = document.querySelector("nav.side-nav");

    if (viewportY <= -(rect.height + 200)) {
      if (
        !sideNav.classList.contains("visible") &&
        !sideNav.classList.contains("tucked")
      ) {
        toggleSideNavVisible(true);
      }
    } else {
      toggleSideNavTucked(false);
      toggleSideNavVisible(false);
    }
  };

  const toggleSideNavVisible = (visible) => {
    const sideNav = document.querySelector("nav.side-nav");
    if (!sideNav) return;
    sideNav.classList.toggle("visible", visible);
  };

  const toggleSideNavTucked = (tucked) => {
    const sideNav = document.querySelector("nav.side-nav");
    if (!sideNav) return;
    const closeSideNavButton = document.getElementById("close-side-nav");
    if (sideNav.classList.contains("visible")) {
      sideNav.classList.toggle("tucked", tucked);
      if (sideNav.classList.contains("tucked")) {
        setTimeout(() => {
          closeSideNavButton.innerHTML = `<i class="fa-solid fa-angles-right"></i>`;
          closeSideNavButton.classList.add("tucked");
        }, 350);
      } else {
        closeSideNavButton.innerHTML = `<i class="fa-solid fa-angles-left"></i>`;
        closeSideNavButton.classList.remove("tucked");
      }
    }
  };

  const populateSideNav = () => {
    const sideNavList = document.getElementById("side-nav-list");
    const mainNavItems = document.querySelectorAll("#top-level li");
    if (!sideNavList || !mainNavItems) return;
    mainNavItems.forEach((item, index) => {
      const clone = item.cloneNode(true);
      clone.dataset.sectionIndex = index;
      sideNavList.lastElementChild.before(clone);
    });
  };

  const closeSideNavButton = document.getElementById("close-side-nav");
  if (closeSideNavButton) {
    closeSideNavButton.addEventListener("click", () => {
      toggleSideNavTucked();
    });
    closeSideNavButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSideNavTucked();
      }
    });
  }

  populateSideNav();
  updateNavPosition();

  window.addEventListener("scroll", updateNavPosition);
  window.addEventListener("resize", updateNavPosition);
}

export function addSpecificEventListeners() {
  facilityTableHeaderSetup();
  globalViewTableHeaderSetup();
}
