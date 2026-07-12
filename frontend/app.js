/**
 * Frontend simple para CRUD de productos de la tienda de perritos.
 */

const API_BASE = "/api/productos";
let editandoId = null;

const tbody = document.getElementById("tbodyProductos");
const btnCargar = document.getElementById("btnCargar");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const formTitle = document.getElementById("formTitle");
const statusDiv = document.getElementById("status");

const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");

function setStatus(mensaje, tipo = "ok") {
  statusDiv.textContent = mensaje;
  statusDiv.className = "status " + tipo;
}

async function cargarProductos() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al cargar productos");
    const data = await res.json();
    renderProductos(data);
    setStatus("Productos cargados correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudieron cargar los productos.", "error");
  }
}

function renderProductos(productos) {
  tbody.innerHTML = "";
  productos.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.descripcion || ""}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button data-id="${p.id}" class="btn-editar">Editar</button>
        <button data-id="${p.id}" class="btn-eliminar danger">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => editarProducto(btn.getAttribute("data-id")));
  });
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("¿Seguro?")) eliminarProducto(btn.getAttribute("data-id"));
    });
  });
}

function limpiarFormulario() {
  editandoId = null;
  formTitle.textContent = "Nuevo producto";
  inputNombre.value = "";
  inputDescripcion.value = "";
  inputPrecio.value = "";
  inputStock.value = "";
}

async function guardarProducto() {
  const producto = {
    nombre: inputNombre.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    precio: parseFloat(inputPrecio.value),
    stock: parseInt(inputStock.value, 10),
  };

  try {
    const res = await fetch(editandoId ? `${API_BASE}/${editandoId}` : API_BASE, {
      method: editandoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error("Error al guardar");
    limpiarFormulario();
    await cargarProductos();
    setStatus("Guardado con éxito.", "ok");
  } catch (err) {
    setStatus("Error al guardar.", "error");
  }
}

async function editarProducto(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  const p = await res.json();
  editandoId = p.id;
  formTitle.textContent = `Editar #${p.id}`;
  inputNombre.value = p.nombre;
  inputDescripcion.value = p.descripcion;
  inputPrecio.value = p.precio;
  inputStock.value = p.stock;
}

async function eliminarProducto(id) {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  await cargarProductos();
}

btnCargar.addEventListener("click", cargarProductos);
btnGuardar.addEventListener("click", guardarProducto);
btnCancelar.addEventListener("click", limpiarFormulario);

cargarProductos();