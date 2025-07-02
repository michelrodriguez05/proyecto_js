const btn = document.getElementById("btnEntrar");
if (btn) {
  btn.addEventListener("click", () => {
    document.querySelector(".portada").style.display = "none";
    document.getElementById("seccionCategorias").scrollIntoView({ behavior: "smooth" });
  });
}

const categorias = [
  { nombre: "Mujer", clave: "women's clothing" },
  { nombre: "Accesorios", clave: "jewelery" },
  { nombre: "Hombre", clave: "men's clothing" },
  { nombre: "Tecnología", clave: "electronics" }
];

const carrusel = document.getElementById("carruselCategorias");

categorias.forEach(cat => {
  const div = document.createElement("div");
  div.className = "categoria-card";
  div.textContent = cat.nombre;
  div.addEventListener("click", () => {
    filtrarPorCategoria(cat.clave);
  });
  carrusel.appendChild(div);
});

let productosOriginales = [];
let categoriaSeleccionada = null;
let textoBusqueda = "";

async function cargarProductos() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    productosOriginales = await res.json();
    aplicarFiltrosYBusqueda();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

function mostrarProductos(productos) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "producto";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
      <button>Agregar</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      agregarAlCarrito(p);
    });
    grid.appendChild(card);
  });
}

function filtrarPorCategoria(clave) {
  categoriaSeleccionada = clave;
  aplicarFiltrosYBusqueda();
}

document.getElementById("btnQuitarFiltros").addEventListener("click", () => {
  categoriaSeleccionada = null;
  textoBusqueda = "";
  document.getElementById("searchInput").value = "";
  aplicarFiltrosYBusqueda();
});
document.getElementById("btnFavoritos").addEventListener("click", () => {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  if (favoritos.length > 0) {
    mostrarProductos(favoritos);
  } else {
    alert("No tienes productos favoritos.");
  }
});



document.getElementById("searchInput").addEventListener("input", e => {
  textoBusqueda = e.target.value.toLowerCase();
  aplicarFiltrosYBusqueda();
});

function aplicarFiltrosYBusqueda() {
  let filtrados = [...productosOriginales];

  if (categoriaSeleccionada) {
    filtrados = filtrados.filter(p => p.category === categoriaSeleccionada);
  }

  if (textoBusqueda) {
    filtrados = filtrados.filter(p => p.title.toLowerCase().includes(textoBusqueda));
  }

  mostrarProductos(filtrados);
}

// -------------------- CARRITO --------------------

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function renderizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("totalCarrito");
  const contador = document.getElementById("contadorCarrito");

  lista.innerHTML = "";
  let totalCompra = 0;
  let cantidadTotal = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.title} - $${item.price.toFixed(2)} x ${item.cantidad}
      <button onclick="modificarCantidad(${index}, 1)">+</button>
      <button onclick="modificarCantidad(${index}, -1)">-</button>
      <button onclick="eliminarDelCarrito(${index})">X</button>
    `;
    lista.appendChild(li);
    totalCompra += item.price * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  total.textContent = totalCompra.toFixed(2);
  contador.textContent = cantidadTotal;
}

function agregarAlCarrito(producto) {
  const index = carrito.findIndex(item => item.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function modificarCantidad(index, cambio) {
  carrito[index].cantidad += cambio;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

document.getElementById("vaciarCarrito").addEventListener("click", () => {
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito();
});

// Mostrar/ocultar carrito
const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const carritoContenedor = document.getElementById("carrito");

if (abrirCarrito && cerrarCarrito && carritoContenedor) {
  abrirCarrito.addEventListener("click", () => {
    carritoContenedor.classList.add("visible");
  });

  cerrarCarrito.addEventListener("click", () => {
    carritoContenedor.classList.remove("visible");
  });
}

// Inicialización
renderizarCarrito();
cargarProductos();
