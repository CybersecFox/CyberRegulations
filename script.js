let data = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Load JSON data
fetch('regulations.json')
  .then(response => {
    if (!response.ok) throw new Error("File not found");
    return response.json();
  })
  .then(json => {
    data = json;
    populateFilters();
    updateTable();
  })
  .catch(error => {
    console.error("Error loading JSON:", error);
    document.body.innerHTML = `<h2>Error loading data: ${error.message}</h2>`;
  });

function populateFilters() {
  const apps = [...new Set(data.map(d => d["APPLICATION"]))].sort();
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
