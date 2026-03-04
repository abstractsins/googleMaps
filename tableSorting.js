let sortDirection = {}; // Track sort direction for each column
let currentData = []; // Store current table data

const parseTableData = () => {
  const tbody = document.getElementById("generated-rows");
  // Exclude map rows so sorting only applies to asset rows
  const rows = Array.from(tbody.querySelectorAll("tr:not(.map-row)"));

  return rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return {
      element: row,
      data: cells.map((cell) => cell.textContent.trim()),
    };
  });
};

const updateSortIndicators = (activeColumn, direction) => {
  const headers = document.querySelectorAll("th.sortable");
  headers.forEach((header, index) => {
    const icon = header.querySelector(".sort-icon");
    if (index === activeColumn) {
      icon.textContent = direction === "asc" ? " ▲" : " ▼";
      header.classList.add("active-sort");
    } else {
      icon.textContent = "";
      header.classList.remove("active-sort");
    }
  });
};

export const sortTable = (columnIndex) => {
  const tbody = document.getElementById("generated-rows");

  // Parse current table data
  currentData = parseTableData();

  // Determine sort direction
  if (!sortDirection[columnIndex]) {
    sortDirection[columnIndex] = "asc";
  } else if (sortDirection[columnIndex] === "asc") {
    sortDirection[columnIndex] = "desc";
  } else {
    sortDirection[columnIndex] = "asc";
  }

  const direction = sortDirection[columnIndex];

  // Sort the data
  currentData.sort((a, b) => {
    let aVal = a.data[columnIndex];
    let bVal = b.data[columnIndex];

    // Special handling for serial numbers (column 0)
    if (columnIndex === 0) {
      // Serial format: ABC123D456-789
      // Split into parts for proper comparison
      const parseSerial = (serial) => {
        const match = serial.match(/([A-Z]+)(\d+)([A-Z])(\d+)-(\d+)/);
        if (match) {
          return {
            letters: match[1],
            num1: parseInt(match[2]),
            letter: match[3],
            num2: parseInt(match[4]),
            suffix: parseInt(match[5]),
          };
        }
        return null;
      };

      const aParsed = parseSerial(aVal);
      const bParsed = parseSerial(bVal);

      if (aParsed && bParsed) {
        // Compare each part in order
        if (aParsed.letters !== bParsed.letters) {
          const result = aParsed.letters.localeCompare(bParsed.letters);
          return direction === "asc" ? result : -result;
        }
        if (aParsed.num1 !== bParsed.num1) {
          return direction === "asc"
            ? aParsed.num1 - bParsed.num1
            : bParsed.num1 - aParsed.num1;
        }
        if (aParsed.letter !== bParsed.letter) {
          const result = aParsed.letter.localeCompare(bParsed.letter);
          return direction === "asc" ? result : -result;
        }
        if (aParsed.num2 !== bParsed.num2) {
          return direction === "asc"
            ? aParsed.num2 - bParsed.num2
            : bParsed.num2 - aParsed.num2;
        }
        return direction === "asc"
          ? aParsed.suffix - bParsed.suffix
          : bParsed.suffix - aParsed.suffix;
      }
    }

    // Special handling for Last Seen column (column 5) with "Never" values
    if (columnIndex === 5) {
      // Handle "Never" as the oldest date (or newest depending on sort)
      const aIsNever = aVal.toLowerCase() === "never";
      const bIsNever = bVal.toLowerCase() === "never";

      if (aIsNever && bIsNever) return 0;
      if (aIsNever) return direction === "asc" ? -1 : 1;
      if (bIsNever) return direction === "asc" ? 1 : -1;

      // Both are actual dates, parse and compare
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);

      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }
    }

    // Try to parse as numbers for numeric sorting
    const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ""));
    const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ""));

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Try to parse as dates
    const aDate = new Date(aVal);
    const bDate = new Date(bVal);

    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return direction === "asc" ? aDate - bDate : bDate - aDate;
    }

    // Default to string comparison
    return direction === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  // Clear and repopulate tbody
  tbody.innerHTML = "";
  currentData.forEach((item) => tbody.appendChild(item.element));

  // Update sort indicators
  updateSortIndicators(columnIndex, direction);
};

const sortHeaderActivationHandler = (header) => {
  const columnIndex = parseInt(header.getAttribute("data-column"));
  sortTable(columnIndex);
  header.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const tableHeadersSortingSetup = () => {
  // Add click handlers to sortable headers
  const sortableHeaders = document.querySelectorAll("th.sortable");
  sortableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      sortHeaderActivationHandler(header);
    });
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sortHeaderActivationHandler(header);
      }
    });
  });
};
