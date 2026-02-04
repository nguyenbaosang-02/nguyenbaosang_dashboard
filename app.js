const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

async function fetchProducts() {
  const res = await fetch(API);
  products = await res.json();
  filtered = [...products];
  render();
}

function render() {
  paginate();
  renderPagination();
}

function paginate() {
  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  pageData.forEach(p => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-bs-toggle", "tooltip");
    tr.setAttribute("data-bs-title", p.description);
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ""}</td>
      <td><img src="${p.images[0]}" class="product-img"></td>
    `;
    tr.onclick = () => openDetail(p);
    body.appendChild(tr);
  });

  new bootstrap.Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    customClass: "tooltip-desc"
  });
}

function renderPagination() {
  const total = Math.ceil(filtered.length / pageSize);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="goPage(${i})">${i}</button>
      </li>`;
  }
}

function goPage(p) {
  currentPage = p;
  render();
}

document.getElementById("searchInput").oninput = e => {
  filtered = products.filter(p =>
    p.title.toLowerCase().includes(e.target.value.toLowerCase())
  );
  currentPage = 1;
  render();
};

document.getElementById("pageSize").onchange = e => {
  pageSize = +e.target.value;
  currentPage = 1;
  render();
};

function sortBy(field) {
  sortAsc = field === sortField ? !sortAsc : true;
  sortField = field;

  filtered.sort((a, b) => {
    if (a[field] > b[field]) return sortAsc ? 1 : -1;
    if (a[field] < b[field]) return sortAsc ? -1 : 1;
    return 0;
  });
  render();
}

function exportCSV() {
  let csv = "id,title,price,category\n";
  filtered.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}

function openDetail(p) {
  document.getElementById("detailBody").innerHTML = `
    <p><b>Title:</b> ${p.title}</p>
    <p><b>Price:</b> ${p.price}</p>
    <p><b>Description:</b> ${p.description}</p>
    <button class="btn btn-warning" onclick="editProduct(${p.id})">Edit</button>
  `;
  new bootstrap.Modal("#detailModal").show();
}

async function editProduct(id) {
  const newTitle = prompt("New title?");
  if (!newTitle) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle })
  });
  fetchProducts();
}

async function createProduct() {
  const data = {
    title: cTitle.value,
    price: +cPrice.value,
    categoryId: +cCategory.value,
    images: [cImage.value]
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  location.reload();
}

fetchProducts();
