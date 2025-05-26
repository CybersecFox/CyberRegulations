let data = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Load JSON data
fetch('regulations.json')
  .then(response => response.json())
  .then(json => {
    console.log("✅ Raw JSON loaded:", json);
    data = json;
    populateFilters();
    updateTable();
    updateSummary();
  })
  .catch(error => {
    console.error("❌ Error loading JSON:", error);
    document.body.innerHTML = `<h2>Error loading data: ${error.message}</h2>`;
  });

function populateFilters() {
  const apps = [...new Set(data.map(d => d.APPLICATION))].sort();
  const countries = [...new Set(data.map(d => d["COUNTRY/ORG"]))].sort();
  const institutions = [...new Set(data.map(d => d.INSTITUTION))].sort();

  populateSelect("filter-application", ['', ...apps]);
  populateSelect("filter-country", ['', ...countries]);
  populateSelect("filter-institution", ['', ...institutions]);

  document.querySelectorAll(".filters select").forEach(sel => {
    sel.addEventListener("change", applyFilters);
  });

  document.getElementById("search-bar").addEventListener("input", applyFilters);
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => sortTable(th.dataset.column));
  });
}

function populateSelect(id, values) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  values.forEach(val => {
    const option = document.createElement("option");
    option.value = val || "";
    option.textContent = val || "All";
    select.appendChild(option);
  });
}

function applyFilters() {
  let app = document.getElementById("filter-application").value;
  let country = document.getElementById("filter-country").value;
  let inst = document.getElementById("filter-institution").value;
  let search = document.getElementById("search-bar").value.toLowerCase();

  filteredData = data.filter(item =>
    (!app || item.APPLICATION === app) &&
    (!country || item["COUNTRY/ORG"] === country) &&
    (!inst || item.INSTITUTION === inst) &&
    Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(search)
    )
  );

  currentPage = 1;
  updateTable();
  updateSummary();
}

function sortTable(column) {
  let direction = "asc";
  const header = document.querySelector(`th[data-column="${column}"]`);
  if (header.dataset.order === "asc") {
    direction = "desc";
    header.dataset.order = "desc";
  } else {
    direction = "asc";
    header.dataset.order = "asc";
  }

  filteredData.sort((a, b) => {
    const valA = a[column] ? a[column].toString().toLowerCase() : "";
    const valB = b[column] ? b[column].toString().toLowerCase() : "";
    return direction === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  updateTable();
}

function updateTable() {
  const tbody = document.querySelector("#reg-table tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  if (filteredData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" style="text-align:center;">No matching records found</td>`;
    tbody.appendChild(row);
    updatePagination();
    return;
  }

  pageData.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.APPLICATION || ''}</td>
      <td>${item['COUNTRY/ORG'] || ''}</td>
      <td>${item.INSTITUTION || ''}</td>
      <td>${item.DATE || ''}</td>
      <td>${item.DOCUMENT || ''}</td>
    `;
    tbody.appendChild(row);
  });

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const pageInfo = document.getElementById("page-info");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled = currentPage === totalPages;
}

function updateSummary() {
  const summaryList = document.getElementById("summary-list");
  summaryList.innerHTML = "";

  // Total Count
  summaryList.innerHTML += `<li><strong>Total:</strong> ${data.length}</li>`;

  // Group by Application
  const appCounts = data.reduce((acc, curr) => {
    acc[curr.APPLICATION] = (acc[curr.APPLICATION] || 0) + 1;
    return acc;
  }, {});

  for (const [app, count] of Object.entries(appCounts)) {
    summaryList.innerHTML += `<li>${app}: ${count}</li>`;
  }

  // Group by Country/Organization
  const countryCounts = data.reduce((acc, curr) => {
    acc[curr["COUNTRY/ORG"]] = (acc[curr["COUNTRY/ORG"]] || 0) + 1;
    return acc;
  }, {});

  summaryList.innerHTML += `<li><strong>Countries/Orgs:</strong></li>`;
  for (const [country, count] of Object.entries(countryCounts)) {
    summaryList.innerHTML += `<li>${country}: ${count}</li>`;
  }
}
